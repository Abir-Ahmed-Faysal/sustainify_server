import bcrypt from "bcryptjs"
import { JwtPayload } from "jsonwebtoken"
import { prisma } from "../../lib/prisma"
import { tokenUtils } from "../../utilities/token"
import { jwtUtils } from "../../utilities/jwt"
import { envVars } from "../../config/env"
import ms from "ms";
import { IUserRequest } from "../../interfaces/user.interface"


const register = async (payload: any) => {


    const { name, email, password } = payload;
    const existingUser = await prisma.user.findUnique({ where: { email } });



    if (existingUser) throw new Error("User already exists");
    return await prisma.$transaction(async (tx) => {


        const hashPassword = await bcrypt.hash(password, 10);

        const user = await tx.user.create({
            data: { name, email, password: hashPassword },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        await tx.profile.create({
            data: {
                userId: user.id,
                
            },
        });


        const tokenPayload = {
            id: user.id,
            nama: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

        };

        const accessToken = tokenUtils.getAccessToken(tokenPayload);
        const refreshToken = tokenUtils.getRefreshToken(tokenPayload);

        await tx.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + ms("7d")),
            },
        });

        return { user, accessToken, refreshToken };
    });
};


const login = async (payload: any) => {
    const { email, password } = payload;

    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { email },select:{id:true,name:true,email:true,role:true,isActive:true,isDeleted:true,createdAt:true,updatedAt:true,password:true} });
        if (!user) throw new Error("User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid password");

        const tokenPayload = {
           id: user.id,
            nama: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        const accessToken = tokenUtils.getAccessToken(tokenPayload);
        const refreshToken = tokenUtils.getRefreshToken(tokenPayload);

        await tx.session.create({
            data: {
                userId: user.id,
                refreshToken,
                expiresAt: new Date(Date.now() + ms("7d")),
            },
        });

        return { 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }, 
            accessToken, 
            refreshToken 
        };
    });
};

const getMe = async (user: any) => {
    const userExists = await prisma.user.findUnique({
        where: {
            id: user.id
        }, 
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
        }
    })

    if (!userExists) {
        throw new Error("User not found")
    }

    return userExists;
}


const refreshTokenHandler = async (refreshToken: string) => {
    // ✅ 1. Verify refresh token
    const verifyRefreshToken = jwtUtils.verifyToken(
        refreshToken,
        envVars.REFRESH_TOKEN_SECRET
    );

    if (!verifyRefreshToken.success || !verifyRefreshToken.data) {
        throw new Error("Invalid refresh token");
    }

    const decoded = verifyRefreshToken.data as IUserRequest;

    // ✅ 2. Find session using refreshToken
    const session = await prisma.session.findFirst({
        where: { refreshToken }
    });

    if (!session) {
        throw new Error("Session not found");
    }

    // ✅ 3. Expiry check
    if (session.expiresAt < new Date()) {
        await prisma.session.delete({
            where: { id: session.id }
        });
        throw new Error("Session expired");
    }

    // ❌ REMOVE THIS (redundant)
    // if (session.refreshToken !== refreshToken)

    // 👉 Because you already queried by refreshToken

    // ✅ 4. Validate user
    const user = await prisma.user.findUnique({
        where: { id: decoded.id }
    });

    if (!user || user.isDeleted || !user.isActive) {
        await prisma.session.delete({
            where: { id: session.id }
        });
        throw new Error("User not allowed");
    }

    // ✅ 5. Generate new tokens
    const tokenPayload = {
        id: user.id, // no sessionId
    };

    const newAccessToken = tokenUtils.getAccessToken(tokenPayload);
    const newRefreshToken = tokenUtils.getRefreshToken(tokenPayload);

    // 🔁 6. Rotate refresh token (IMPORTANT)
    const updated = await prisma.session.updateMany({
        where: {
            id: session.id,
            refreshToken: refreshToken, // still needed for safety
        },
        data: {
            refreshToken: newRefreshToken,
            expiresAt: new Date(Date.now() + ms("7d")),
        }
    });

    if (updated.count === 0) {
        throw new Error("Token already used");
    }

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
};

export const authService = {
    register, login, getMe, refreshTokenHandler
}