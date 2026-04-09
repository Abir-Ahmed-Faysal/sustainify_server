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

    // ✅ 4. Separate name & theme from other profile fields
    const { name, themePreference, ...profileData } = filteredPayload as IProfileUpdate;

    // ✅ 5. Use transaction to update both User and Profile if needed
    const result = await prisma.$transaction(async (tx) => {
        // Update user name and/or theme if provided
        const userData: any = {};
        if (name) userData.name = name;
        if (themePreference) userData.themePreference = themePreference;

        if (Object.keys(userData).length > 0) {
            await tx.user.update({
                where: { id: user.id },
                data: userData,
            });
        }

        // Update profile with other fields
        if (Object.keys(profileData).length > 0) {
            await tx.profile.update({
                where: { userId: user.id },
                data: profileData
            });
        }

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
                themePreference: true,
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

const updateTheme = async (user: IUserRequest, themePreference: string) => {
    // Validate theme value
    if (!["light", "dark"].includes(themePreference)) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "Theme must be 'light' or 'dark'"
        );
    }

    // Update user theme preference
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { themePreference },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            isDeleted: true,
            themePreference: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
        }
    });

    if (!updatedUser) {
        throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    return updatedUser;
};


export const profileService = {

    updateProfile,
    updateTheme,

};
