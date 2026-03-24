import { betterAuth, } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { StringValue } from "ms";
import { toSeconds } from "../utilities/duration";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utilities/email";






export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,

    },
    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: () => {
                return {
                    role: Role.PATIENT,
                    status: UserStatus.ACTIVE,
                    emailVerified: true,
                    isDeleted: false,
                    deletedAt: null,
                    needPasswordChange: false
                }
            }
        }
    },
    redirectURLS: {
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
    }
    ,
    user: {
        additionalFields: {


            needPasswordChange: {
                type: "boolean",
                required: true,
                default: false
            }
            ,

            role: {
                type: "string",
                required: true, defaultValue: Role.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            }
        },
        deletedAt: {
            type: "date",
            required: false,
            defaultValue: null
        },
    }, session: {
        expiresIn: toSeconds(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue),
        updateAge: toSeconds(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue),
        cookieCache: {
            enabled: true,
            maxAge: toSeconds(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)
        }
    },
    plugins: [bearer(), emailOTP({
        overrideDefaultEmailVerification: true,
        async sendVerificationOTP({ email, otp, type }) {
            if (type === "email-verification") {
                const user = await prisma.user.findUnique({
                    where: { email }
                })

                if (!user) {
                    console.log(`user with email ${email}  not found. Can not send verification OTP`);
                    return
                }

                if (user && user.role === Role.SUPER_ADMIN) {
                    console.log(` user with email ${email} is as super admin. not need to verified`);
                    return
                }

                if (user && !user.emailVerified) {
                    sendEmail({
                        to: email,
                        subject: "Verify your email",
                        templateName: "otp",
                        templateData: {
                            name: user.name,
                            otp
                        }
                    })
                }
            }
            if (type === "forget-password") {
                const user = await prisma.user.findUnique({
                    where: { email }
                })

                if (user) {

                    sendEmail({
                        to: email,
                        subject: "password reset otp",
                        templateName: "otp",
                        templateData: {
                            name: user.name,
                            otp
                        }
                    })
                }


            }
        },
        expiresIn: 2 * 60,
        otpLength: 6,
    })],


    trustedOrigins: [envVars.FRONTEND_URL, "http://localhost:5000", envVars.BETTER_AUTH_URL, "http://localhost:3000"],

    advanced: {
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    sameSite: 'none',
                    secure: true,
                    httpOnly: true,
                    path: '/'
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: '/'
                }
            }
        }
    }

});



export default auth
