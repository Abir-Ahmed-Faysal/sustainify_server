import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { Role } from "../../../generated/prisma";

const updateUserRole = async (
    targetUserId: string,
    payload: { role: Role }
) => {
    const user = await prisma.user.findUnique({
        where: { id: targetUserId, isDeleted: false },
    });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.role === payload.role) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            `User already has the role "${payload.role}"`
        );
    }

    const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: payload.role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};

const toggleUserStatus = async (targetUserId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: targetUserId, isDeleted: false },
    });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { isActive: !user.isActive },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};

const deleteUser = async (targetUserId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: targetUserId, isDeleted: false },
    });

    if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    await prisma.user.update({
        where: { id: targetUserId },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
            isActive: false,
        },
    });

    return { message: "User deleted successfully" };
};

export const adminService = {
    updateUserRole,
    toggleUserStatus,
    deleteUser,
};
