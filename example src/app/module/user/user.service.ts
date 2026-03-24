import { StatusCodes } from "http-status-codes";
import { Role, Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import auth from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdmin, ICreateDoctorPayload } from "./user.Interface";
import { tokenUtils } from "../../utilities/token";

const createDoctor = async (payload: ICreateDoctorPayload) => {

    const specialties: Specialty[] = []

    for (const specialtyId of payload.specialties) {
        const specialty = await prisma.specialty.findUnique({
            where: {
                id: specialtyId
            },
        })

        if (!specialty) {
            throw new AppError(StatusCodes.NOT_FOUND, "no specialty found")
        }
        specialties.push(specialty)
    }

    const user = await prisma.user.findUnique({
        where: {
            email: payload.doctor.email
        }, select: { id: true }
    })

    if (user) {
        throw new AppError(StatusCodes.CONFLICT, "user already exist")
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: payload.doctor.name,
            email: payload.doctor.email,
            password: payload.password,
            role: Role.DOCTOR,
            needPasswordChange: true,
        }
    })

    if (!userData.user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Failed to register user for doctor")
    }
    try {
        const data = await prisma.$transaction(async (tx) => {

            const doctorTx = await tx.doctor.create({
                data: {
                    ...payload.doctor,
                    userId: userData.user.id,
                }
            })

            await tx.doctorSpecialty.createMany({
                data: specialties.map(specialty => ({
                    doctorId: doctorTx.id,
                    specialtyId: specialty.id
                }))
            })

            const doctor = await tx.doctor.findUnique({
                where: {
                    id: doctorTx.id
                }, select: {
                    id: true,
                    userId: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    createdAt: true,
                    updatedAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            emailVerified: true,
                            role: true,
                            image: true,
                            status: true,
                            isDeleted: true,
                            deletedAt: true,
                            createdAt: true,
                            updatedAt: true,

                        }
                    },
                    gender: true,
                    appointmentFee: true,
                    qualification: true, currentWorkingPlace: true, designation: true,
                    specialties: {
                        select: {
                            specialties: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    }
                }
            })
            return doctor
        })

        return data
    } catch (error) {
        console.log("transition error", error);
        await prisma.user.delete({
            where: { id: userData.user.id }
        })
        throw error
    }

}

const createAdmin = async (payload: ICreateAdmin) => {
    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.admin.email
        }
    })

    if (findUser) {
        throw new AppError(StatusCodes.CONFLICT, "user already exist")
    }


    const userExist = await auth.api.signUpEmail({
        body: {
            name: payload.admin.name,
            email: payload.admin.email,
            password: payload.password,
            role: Role.ADMIN,
            needPasswordChange: true,
            rememberMe: false
        }
    })


    if (!userExist.user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Failed to register user for admin")
    }

    const data = await prisma.$transaction(async (tx) => {

        try {

            const adminDataTx = await tx.admin.create({
                data: {
                    ...payload.admin,
                    userId: userExist.user.id
                }
            })



            return adminDataTx
        } catch (error) {
            console.log(error);
            await prisma.user.delete({
                where: {
                    id: userExist.user.id
                }
            })
            throw error
        }
    })






    return data

}

const createSuperAdmin = async (payload: ICreateAdmin) => {
    const findUser = await prisma.user.findUnique({
        where: {
            email: payload.admin.email
        }
    })

    if (findUser) {
        throw new AppError(StatusCodes.CONFLICT, "user already exist")
    }

    const userData = await auth.api.signUpEmail({
        body: {
            name: payload.admin.name,
            email: payload.admin.email,
            password: payload.password,
            role: Role.SUPER_ADMIN,
            needPasswordChange: true,
            rememberMe: true
        }
    })

    if (!userData.user) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Failed to register user for admin")
    }

    const data = await prisma.$transaction(async (tx) => {

        try {
            const adminDataTx = await tx.super_Admin.create({
                data: {
                    ...payload.admin,
                    userId: userData.user.id
                }, include: { user: true }
            })

            return adminDataTx
        } catch (error) {
            console.log(error);
            await prisma.user.delete({
                where: {
                    id: userData.user.id
                }
            })
            throw error
        }
    })

    const super_admin_token = tokenUtils.getSuperAdminToken({ id: userData.user.id, email: userData.user.email, name: userData.user.name, role: userData.user.role })



    return {...data,super_admin_token}
}




export const userService = { createDoctor, createAdmin, createSuperAdmin }