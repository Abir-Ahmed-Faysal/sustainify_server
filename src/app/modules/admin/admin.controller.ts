import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const currentUser = req.user as any;
    const result = await adminService.updateUserRole(id, req.body, currentUser.id);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User role updated successfully",
        data: result,
    });
});

const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const currentUser = req.user as any;
    const result = await adminService.toggleUserStatus(id, currentUser.id);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: `User ${result.isActive ? "activated" : "deactivated"} successfully`,
        data: result,
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const currentUser = req.user as any;
    const result = await adminService.deleteUser(id, currentUser.id);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.message,
    });
});

export const adminController = {
    updateUserRole,
    toggleUserStatus,
    deleteUser,
};
