import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";


const createToken = (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => {
    return jwt.sign(payload, secret, { expiresIn })
}



const verifyToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret)
        return { success: true, data: decoded }
    } catch (err: unknown) {
        return { success: false, error: (err as Error).message }
    }
}



const decodedToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret)
        return { success: true, data: decoded }
    } catch (err: unknown) {
        return { success: false, error: (err as Error).message }
    }
}



export const jwtUtils = {
    createToken,
    verifyToken,
    decodedToken
}