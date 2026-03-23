import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";
import { cookieUtils } from "./cookie";
import { Response } from "express";
import ms, { StringValue } from "ms";



const getAccessToken = (payload: JwtPayload) => {
    const token = jwtUtils.createToken(payload,
        envVars.ACCESS_TOKEN_SECRET,
        { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions)
    return token
}



const getRefreshToken = (payload: JwtPayload): string => {
    return jwtUtils.createToken(payload, envVars.REFRESH_TOKEN_SECRET, {
        expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions);
};

const setAccessTokenCookie = (res: Response, token: string) => {

    const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue)
    cookieUtils.setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: maxAge
    })
}

const setRefreshTokenCookie = (res: Response, token: string) => {

    const maxAge = ms(envVars.REFRESH_TOKEN_EXPIRES_IN as StringValue)
    cookieUtils.setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: maxAge
    })
}




export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
}