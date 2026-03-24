/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utilities/cookie";
import { StatusCodes } from "http-status-codes";
import { jwtUtils } from "../utilities/jwt";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";

export const authCheck = (...authRoles: Role[]) => {
    return (async (req: Request, res: Response, next: NextFunction) => {

       

        try {
            const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token")



            if (!sessionToken) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "You are not authorized to access this route" });

            if (sessionToken) {


                const sessionExists = await prisma.session.findFirst({
                    where: {
                        token: sessionToken, expiresAt: {
                            gt: new Date(),
                        }
                    },
                    include: {
                        user: true
                    }
                })


                if (sessionExists && sessionExists.user) {
                    const user = sessionExists.user

                    const now = new Date();
                    const expiresAt = new Date(sessionExists.expiresAt);
                    const createdAt = new Date(sessionExists.createdAt)


                    const sessionLifetime = expiresAt.getTime() - createdAt.getTime()
                    const timeRemaining = expiresAt.getTime() - now.getTime()
                    const percentRemaining = (timeRemaining / sessionLifetime) * 100


                    if (percentRemaining < 20) {
                        res.setHeader("X-Session-Refresh", "true")
                        res.setHeader("X-Session-Expires-At", expiresAt.toISOString())
                        res.setHeader("X-Time-Remaining", timeRemaining.toString())

                        console.log("session is ran out soon");
                    }

                    if (user.status === UserStatus.DELETED || user.status === UserStatus.BLOCKED) {
                        throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized access! User is not active.')
                    }
                    if (user.isDeleted) {
                        throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized access! User is deleted.')
                    }


                    if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                        throw new AppError(StatusCodes.FORBIDDEN, "you are not authorized to access this route")
                    }


                    req.user = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    }

                }

                // ! mentor does not do this check
                if (!sessionExists) {
                    throw new AppError(StatusCodes.UNAUTHORIZED, "Session expired or invalid");
                }
            }


            // access token verification 
            const accessToken = cookieUtils.getCookie(req, "accessToken")

            if (!accessToken) return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "You are not authorized to access this route" });


            const verifyAccessToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET)

            if (!verifyAccessToken.success) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: "You are not authorized to access this route" });
            }




            next()
        } catch (error: any) {
            console.log(error);
            next(error)
        }
    })
}