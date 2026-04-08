import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IProfileUpdate } from "./profile.interfaces";
import { IUserRequest } from "../../interfaces/user.interface";





const updateProfile = async (user: IUserRequest, payload: IProfileUpdate) => {


    console.log(payload , user,"profile update")

    // ✅ 1. Empty payload check
    if (!payload || Object.keys(payload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Update payload cannot be empty"
        );
    }

    // ✅ 2. Check profile exists
    const isExist = await prisma.profile.findUnique({
        where: { userId: user.id },
    });

    if (!isExist) {
        throw new AppError(
            StatusCodes.NOT_FOUND,
            "Profile not found. Please create a profile first."
        );
    }

    // ✅ 3. Remove undefined fields (VERY IMPORTANT)
    const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredPayload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "No valid fields provided for update"
        );
    }

    // ✅ 4. Separate name from other profile fields
    const { name, ...profileData } = filteredPayload as IProfileUpdate;

    // ✅ 5. Use transaction to update both User and Profile if needed
    const result = await prisma.$transaction(async (tx) => {
        // Update user name if provided
        if (name) {
            await tx.user.update({
                where: { id: user.id },
                data: { name },
            });
        }

        // Update profile with other fields
        await tx.profile.update({
            where: { userId: user.id },
            data: profileData
        });

        // Return updated user with profile relation matching /auth/me
        const updatedUser = await tx.user.findUnique({
            where: { id: user.id },
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
        });

        if (!updatedUser) {
            throw new AppError(StatusCodes.NOT_FOUND, "User not found after update");
        }

        return updatedUser;
    });

    return result;
};


export const profileService = {

    updateProfile,

};
