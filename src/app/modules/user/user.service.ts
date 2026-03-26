import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { IUserRequest } from "../../interfaces/user.interface";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";

const getAllUsers = async (query: IQueryParams) => {
    const userModel = prisma.user as any;
    
    const userQueryBuilder = new QueryBuilder(userModel, query, {
        searchableFields: ["name", "email"],
        filterableFields: ["role", "isActive"],
    });

    const result = await userQueryBuilder
        .search()
        .filter()
        .sort()
        .paginate()
        .where({ isDeleted: false })
        .include({
            profile: true
        })
        .execute();

    // Securely project fields
    result.data = result.data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isDeleted: user.isDeleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: user.profile,
    }));

    return result;
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
