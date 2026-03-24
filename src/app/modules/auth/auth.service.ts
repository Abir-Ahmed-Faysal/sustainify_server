import bcrypt from "bcryptjs"
import { JwtPayload } from "jsonwebtoken"
import { prisma } from "../../lib/prisma"
import { tokenUtils } from "../../utilities/token"
import { jwtUtils } from "../../utilities/jwt"
import { envVars } from "../../config/env"
import ms from "ms";


const register = async (payload: any) => {


    const { name, email, password } = payload;
    const existingUser = await prisma.user.findUnique({ where: { email } });



    if (existingUser) throw new Error("User already exists");
    return await prisma.$transaction(async (tx) => {


        const hashPassword = await bcrypt.hash(password, 10);

        const user = await tx.user.create({
            data: { name, email, password: hashPassword },
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
        const user = await tx.user.findUnique({ where: { email } });
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

        return { user, accessToken, refreshToken };
    });
};

const getMe = async (user: any) => {
    const userExists = await prisma.user.findUnique({
        where: {
            id: user.id
        }, include: {
            profile: true
        }
    })

    if (!userExists) {
        throw new Error("User not found")
    }

    return userExists
}


const refreshTokenHandler = async (refreshToken: string) => {
    // ✅ 1. Verify refresh token first
    const verifyRefreshToken = jwtUtils.verifyToken(
        refreshToken,
        envVars.REFRESH_TOKEN_SECRET
    );

    if (!verifyRefreshToken.success || !verifyRefreshToken.data) {
        throw new Error("Invalid refresh token");
    }

    const decoded = verifyRefreshToken.data as JwtPayload;

    // ✅ 2. Find session by sessionId
    const session = await prisma.session.findUnique({
        where: { id: decoded.sessionId }
    });

    if (!session) {
        throw new Error("Session not found");
    }

    // ✅ 3. Expiry check + cleanup
    if (session.expiresAt < new Date()) {
        await prisma.session.delete({
            where: { id: session.id }
        });
        throw new Error("Session expired");
    }

    // ✅ 4. Token match (reuse attack detection)
    if (session.refreshToken !== refreshToken) {
        await prisma.session.delete({
            where: { id: session.id }
        });
        throw new Error("Token reuse detected");
    }

    // ✅ 5. Validate user status
    const user = await prisma.user.findUnique({
        where: { id: decoded.id }
    });

    if (!user || user.isDeleted || !user.isActive) {
        await prisma.session.delete({
            where: { id: session.id }
        });
        throw new Error("User not allowed");
    }

    // ✅ 6. Generate new tokens
    const tokenPayload = {
        id: decoded.id,
        sessionId: session.id,
    };

    const newAccessToken = tokenUtils.getAccessToken(tokenPayload);
    const newRefreshToken = tokenUtils.getRefreshToken(tokenPayload);

    // 🔁 7. Atomic refresh token rotation (race-condition safe)
    const updated = await prisma.session.updateMany({
        where: {
            id: session.id,
            refreshToken: refreshToken, // ensure token still valid
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