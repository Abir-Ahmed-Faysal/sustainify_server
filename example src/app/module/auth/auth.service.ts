/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import { UserStatus } from "../../../generated/prisma/enums";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { tokenUtils } from "../../utilities/token";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { jwtUtils } from "../../utilities/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { toSeconds } from "../../utilities/duration";
import { StringValue } from "ms";
import { IChangePasswordPayload, ILoginPayload, IRegisterPatientPayload } from "./auth.interface";




// !!!check if the user is social login you must check the password reset , change password and other route check if the user is social login!!!

const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload


    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            needPasswordChange: false

        }
    })


    if (!data.user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Failed to register user")
    }



    try {
        const patient = await prisma.$transaction(async (tx) => {

            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: payload.name,
                    email: payload.email
                }
            })

            return patientTx
        })




        const accessToken = tokenUtils.getAccessToken({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            emailVerified: data.user.emailVerified,
            isDeleted: data.user.isDeleted,
            isBlocked: data.user.status,
        })

        const refreshToken = tokenUtils.getRefreshToken({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            emailVerified: data.user.emailVerified,
            isDeleted: data.user.isDeleted,
            isBlocked: data.user.status,
        })

        return { accessToken, refreshToken, ...data, patient }
    } catch (error) {
        console.log("transition error:", error);

        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        })
        throw error
    }
}

const getMe = async (user: IUserRequest) => {
    const IUserExists = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        include: {
            patients: {
                include: {
                    appointments: true,
                    reviews: true,
                    prescriptions: true,
                    medicalReports: true,
                    patientHealthData: true
                }
            },
            doctors: {
                include: {
                    specialties: true,
                    appointments: true,
                    prescriptions: true,
                    reviews: true,
                }
            },
            admins: true,
            superAdmins: true
        }
    })

    if (!IUserExists) {
        throw new AppError(StatusCodes.NOT_FOUND, "user not found")
    }


    return IUserExists
}


const newToken = async (refreshToken: string, sessionToken: string) => {


    const sessionExists = await prisma.session.findFirst({
        where: {
            token: sessionToken
        }, include: {
            user: true
        }
    })

    if (!sessionExists) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "invalid session token")
    }


    const verifyRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

    if (!verifyRefreshToken || verifyRefreshToken.error) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "invalid refresh token")
    }

    const data = verifyRefreshToken.data as JwtPayload


    const accessToken = tokenUtils.getAccessToken({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified,
        isDeleted: data.isDeleted,
        isBlocked: data.status,
    })



    const newRefreshToken = tokenUtils.getRefreshToken({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        emailVerified: data.emailVerified,
        isDeleted: data.isDeleted,
        isBlocked: data.status,
    })




    const { token } = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            expiresAt: new Date(Date.now() + toSeconds(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
            updatedAt: new Date()
        }
    })


    console.log('hit third', "here is last finished", accessToken, newRefreshToken, token, "<==");




    return {
        accessToken,
        newRefreshToken,
        sessionToken: token
    }
}

const changePassword = async (
    payload: IChangePasswordPayload,
    sessionToken: string
) => {

    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    if (!session) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Session not found")
    }

    const { newPassword, currentPassword } = payload

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true
        },
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })


    if (session.user.emailVerified) {
        await prisma.user.update({
            where: {
                id: session.user.id
            }, data: {
                needPasswordChange: false
            }
        })
    }

    // optional: refetch session (senior best practice)
    const user = session.user

    const accessToken = tokenUtils.getAccessToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isDeleted: user.isDeleted,
        isBlocked: user.status
    })

    const refreshToken = tokenUtils.getRefreshToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isDeleted: user.isDeleted,
        isBlocked: user.status
    })



    return {
        ...result,
        accessToken,
        refreshToken,
    }
}


const login = async (payload: ILoginPayload) => {
    const { email, password } = payload

    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })


    if (data.user.isDeleted) {
        throw new AppError(StatusCodes.NOT_FOUND, "user deleted")
    }

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(StatusCodes.FORBIDDEN, "login blocked")
    }

    const accessToken = tokenUtils.getAccessToken({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        emailVerified: data.user.emailVerified,
        isDeleted: data.user.isDeleted,
        isBlocked: data.user.status,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        emailVerified: data.user.emailVerified,
        isDeleted: data.user.isDeleted,
        isBlocked: data.user.status,
    })

    return { ...data, accessToken, refreshToken }

}


const logout = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })

    return result

}

const verifyEmail = async (email: string, otp: string) => {

    const result = await auth.api.verifyEmailOTP({
        body: { email, otp }
    })


    if (result.status && result.status) {
        await prisma.user.update({
            where: {
                email
            }, data: {
                emailVerified: true
            }
        })
    }


}



const forgetPassword = async (email: string) => {
    const isExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "user not found")
    }

    if (!isExist.emailVerified) {
        throw new AppError(StatusCodes.FORBIDDEN, "email not verified")
    }

    if (isExist.status === UserStatus.BLOCKED || isExist.status === UserStatus.DELETED) {
        throw new AppError(StatusCodes.FORBIDDEN, "account blocked")
    }

    await auth.api.requestPasswordResetEmailOTP({
        body: {
            email
        }
    })
}


const resetPassword = async (email: string, otp: string, password: string) => {

    const isUserExist = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!isUserExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "user not found")
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(StatusCodes.FORBIDDEN, "email not verified")
    }

    if (isUserExist.status === UserStatus.BLOCKED || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(StatusCodes.FORBIDDEN, "account blocked")
    }


    await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password,
        }
    })

    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                email
            }, data: {
                needPasswordChange: false
            }
        })
    }


    await prisma.session.deleteMany({
        where: {
            userId: isUserExist.id
        }
    })
}


const googleLoginSuccess = async (session: Record<string, any>) => {

    const isPatientExists = await prisma.patient.findUnique({
        where: {
        email:session.user.email
        }
    })

    if (!isPatientExists) {
        await prisma.patient.create({
            data: {
                userId: session.user.id,
                name: session.user.name,
                email: session.user.email,
            }
        })
    }


    const accessToken = tokenUtils.getAccessToken({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
        isDeleted: session.user.isDeleted,
        isBlocked: session.user.status,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
        isDeleted: session.user.isDeleted,
        isBlocked: session.user.status,
    })


    return { accessToken, refreshToken }


}




export const authService = { registerPatient, login, getMe, newToken, changePassword, logout, verifyEmail, forgetPassword, resetPassword, googleLoginSuccess }
