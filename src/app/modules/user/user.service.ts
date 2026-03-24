import { prisma } from "../../lib/prisma";
import { IUserRequest } from "../../interfaces/user.interface";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";

const getAllUsers = async (query: {
    page?: string;
    limit?: string;
    search?: string;
}) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
        isDeleted: false,
    };

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
        ];
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
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
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        data: users,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id, isDeleted: false },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
        },
    });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    return user;
};

const updateMyProfile = async (
    authUser: IUserRequest,
    payload: {
        name?: string;
        bio?: string;
        avatar?: string;
        address?: string;
    }
) => {
    const user = await prisma.user.findUnique({
        where: { id: authUser.id, isDeleted: false },
    });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    const { name, ...profileData } = payload;

    const result = await prisma.$transaction(async (tx) => {
        // Update user name if provided
        if (name) {
            await tx.user.update({
                where: { id: authUser.id },
                data: { name },
            });
        }

        // Upsert profile data
        if (Object.keys(profileData).length > 0) {
            await tx.profile.upsert({
                where: { userId: authUser.id },
                create: {
                    userId: authUser.id,
                    ...profileData,
                },
                update: profileData,
            });
        }

        // Return updated user with profile
        return tx.user.findUnique({
            where: { id: authUser.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
            },
        });
    });

    return result;
};

const deleteMyAccount = async (authUser: IUserRequest) => {
    const user = await prisma.user.findUnique({
        where: { id: authUser.id, isDeleted: false },
    });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    await prisma.user.update({
        where: { id: authUser.id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return { message: "Account deleted successfully" };
};

export const userService = {
    getAllUsers,
    getUserById,
    updateMyProfile,
    deleteMyAccount,
};
