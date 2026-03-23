import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";


const createToken = (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => {
    return jwt.sign(payload, secret, { expiresIn })
}



const verifyTokne = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret)
        return { success: true, data: decoded }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}



const decodedToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret)
        return { success: true, data: decoded }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}



export const jwtUtils = {
    createToken,
    verifyTokne,
    decodedToken
}