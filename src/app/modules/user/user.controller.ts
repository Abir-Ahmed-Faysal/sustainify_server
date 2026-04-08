import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getAllUsers(req.query as Record<string, string>);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Users retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await userService.getUserById(id);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUserRequest;
    const result = await userService.updateMyProfile(user, req.body);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUserRequest;
    const result = await userService.deleteMyAccount(user);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
    });
});

const getPublicUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getPublicUsers();

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Public users retrieved successfully",
        data: result,
    });
});

const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await userService.toggleUserStatus(id, req.body);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User status updated successfully",
        data: result,
    });
});



export const userController = {
    getAllUsers,
    getPublicUsers,
    getUserById,
    updateMyProfile,
    deleteMyAccount,
    toggleUserStatus,
};
