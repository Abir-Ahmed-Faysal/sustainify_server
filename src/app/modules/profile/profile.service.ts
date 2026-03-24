import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IProfileUpdate } from "./profile.interfaces";
import { IUserRequest } from "../../interfaces/user.interface";





const updateProfile = async (user: IUserRequest, payload: IProfileUpdate) => {

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
        Object.entries(payload).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredPayload).length === 0) {
        throw new AppError(
            StatusCodes.BAD_REQUEST,
            "No valid fields provided for update"
        );
    }

    // ✅ 4. Update
    const result = await prisma.profile.update({
        where: { userId: user.id },
        data: filteredPayload,
    });

    return result;
};


export const profileService = {

    updateProfile,

};
