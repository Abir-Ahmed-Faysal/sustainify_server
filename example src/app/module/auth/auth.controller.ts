import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendRes } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { tokenUtils } from "../../utilities/token";
import { IUserRequest } from "../../interfaces/IUserRequest";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utilities/cookie";
import { envVars } from "../../config/env";
import auth from "../../lib/auth";


const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body
    const result = await authService.registerPatient({ name, email, password })

    const { accessToken, refreshToken, token, ...rest } = result


    tokenUtils.setAccessTokenCookie(res, accessToken)
    tokenUtils.setRefreshTokenCookie(res, refreshToken)
    tokenUtils.SetBetterAuthSessionCookie(res, token as string)

    return sendRes(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "new Patient data create successfully",
        data: { accessToken, refreshToken, token, ...rest }
    })
})

const getNewToken = catchAsync(async (req: Request, res: Response) => {

    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) { throw new AppError(StatusCodes.UNAUTHORIZED, "refresh token is missing") }

    const betterAuthSessionToken = req.cookies["better-auth.session_token"]

    if (!betterAuthSessionToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "session token is missing")
    }

    const result = await authService.newToken(refreshToken, betterAuthSessionToken)


    const { accessToken, newRefreshToken, sessionToken } = result

    tokenUtils.setAccessTokenCookie(res, accessToken)
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken)
    tokenUtils.SetBetterAuthSessionCookie(res, sessionToken as string)

    return sendRes(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "token synced",
        data: { accessToken, refreshToken: newRefreshToken, sessionToken }
    })

})

const changePassword = catchAsync(async (req: Request, res: Response) => {

    const sessionToken = req.cookies["better-auth.session_token"]
    if (!sessionToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "session token is missing")
    }
    const payload = req.body

    const result = await authService.changePassword(payload, sessionToken)

    const { accessToken, refreshToken, token } = result

    tokenUtils.setAccessTokenCookie(res, accessToken)
    tokenUtils.setRefreshTokenCookie(res, refreshToken)
    tokenUtils.SetBetterAuthSessionCookie(res, token as string)

    return sendRes(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "password changed successfully",
        data: result
    })
})

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body
    console.log("her is the verify email route ,", email, otp);
    await authService.verifyEmail(email, otp)
    return sendRes(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "email verified successfully",
    })
})

const logout = catchAsync(async (req: Request, res: Response) => {

    const sessionToken = req.cookies["better-auth.session_token"]

    const result = await authService.logout(sessionToken)

    cookieUtils.deleteCookie(res, "better-auth.session_token", { httpOnly: true, sameSite: "none", secure: true })
    cookieUtils.deleteCookie(res, "accessToken", { httpOnly: true, sameSite: "none", secure: true })
    cookieUtils.deleteCookie(res, "refreshToken", { httpOnly: true, sameSite: "none", secure: true })



    return sendRes(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "logout successful",
        data: result
    })
})

const getMe = catchAsync(async (req: Request, res: Response) => {

    const  user  = req.user as IUserRequest


    const result = await authService.getMe(user as IUserRequest)

    return sendRes(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "my data retrieve successfully",
        data: result
    })
})

const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body
    const result = await authService.login({ email, password })

    const { accessToken, refreshToken, token, ...rest } = result


    tokenUtils.setAccessTokenCookie(res, accessToken)
    tokenUtils.setRefreshTokenCookie(res, refreshToken)
    tokenUtils.SetBetterAuthSessionCookie(res, token)


    sendRes(res, {
        statusCode: StatusCodes.OK,
        message: "login successfully",
        success: true,
        data: { accessToken, refreshToken, token, ...rest }
    })
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body
    await authService.resetPassword(email, otp, newPassword)


    sendRes(res, {
        statusCode: StatusCodes.OK,
        message: "password reset successfully",
        success: true,
    })
})


const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body
    await authService.forgetPassword(email,)


    sendRes(res, {
        statusCode: StatusCodes.OK,
        message: "forget password email sent successfully.check your inbox ",
        success: true,

    })
})

//  /api/v1/login/google?redirect=/profile 

const googleAuth = catchAsync(async (req: Request, res: Response) => {

    console.log("hti the first req");
    const redirectPath = req.params.redirect || "/dashboard"

    const encodeRedirectPath = encodeURIComponent(redirectPath as string)

    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodeRedirectPath}`

    console.log('hit the encoded path', callbackURL, envVars.BETTER_AUTH_URL);


    res.render('googleRedirect', {
        callbackURL,
        betterAuthUrl: envVars.BETTER_AUTH_URL
    })


})


const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {


    const redirectPath = req.query.redirect as string || '/dashboard'

    const sessionToken = req.cookies['better-auth.session_token'];

    console.log("here is the session token", sessionToken);
    if (!sessionToken) {
        res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`)
        return
    }

    const session = await auth.api.getSession({
        headers: {
            "Cookie": `better-auth.session_token=${sessionToken}`
        }
    })


    console.log("here is the session ", session);
    if (!session || !session.user) {
        res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`)
        return
    }


    const result = await authService.googleLoginSuccess(session)
    const { accessToken, refreshToken } = result

    tokenUtils.setAccessTokenCookie(res as Response, accessToken as string)
    tokenUtils.setRefreshTokenCookie(res as Response, refreshToken as string)


    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");

    const finalRedirectPath = isValidRedirectPath
        ? redirectPath
        : "/dashboard";

    const finalUrl = `${envVars.FRONTEND_URL}${finalRedirectPath}`;

    return res.redirect(finalUrl);
})


const handlerAuthError = catchAsync(async (req: Request, res: Response) => {

    const { user } = req
    const result = await authService.getMe(user as IUserRequest)

    return sendRes(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "google error occur",
        data: result
    })
})



export const authController = {
    getMe,
    login,
    logout,
    googleAuth,
    verifyEmail,
    getNewToken,
    resetPassword,
    forgetPassword,
    changePassword,
    registerPatient,
    handlerAuthError,
    googleLoginSuccess,
}