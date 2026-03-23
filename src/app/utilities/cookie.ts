import { CookieOptions, Request, Response } from "express";

const setCookie = (res: Response, key: string, value: string, options: CookieOptions) => {
    return res.cookie(key, value, options)
}

const getCookie = (req: Request, key: string) => {
    return req.cookies[key]
}

const clearCookie = (res: Response, key: string, options: CookieOptions) => {
    return res.clearCookie(key, options)
}

export const cookieUtils = {
    setCookie,
    getCookie,
    clearCookie
}