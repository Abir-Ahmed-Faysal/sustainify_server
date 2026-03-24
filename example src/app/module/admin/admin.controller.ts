import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { sendRes } from "../../shared/sendRes";
import { adminService } from "./admin.service";
import { catchAsync } from "../../shared/catchAsync";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { IChangeUserRolePayload, IChangeUserStatusPayload } from "./admin.interface";

const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAllAdmins();

    return sendRes(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "admins data retrieves successfully",
        data: result
    });
});



const getAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.getAdminById(req.params.id as string);

    return sendRes(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "admin data retrieve successfully",
        data: result
    });
});


const updateAdmin = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const payload = req.body

    const result = await adminService.updateAdminProfile(user as IUserRequest, payload);

    return sendRes(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "admin data update successfully",
        data: result
    });
});



const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await adminService.deleteAdmin(req.params.id as string);

    return sendRes(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "admin data delete successfully",
        data: result
    });
});


const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const payload = req.body


    const result = await adminService.changeUserStatus(user as IUserRequest, payload as IChangeUserStatusPayload);

    return sendRes(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "admin data delete successfully",
        data: result
    });
});


const changeUserRole = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body
    const user = req.user
    const result = await adminService.changeUserRole(user as IUserRequest, payload as IChangeUserRolePayload);

    return sendRes(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "admin data delete successfully",
        data: result
    });
});






export const adminController = {
    getAllAdmins,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    changeUserStatus,
    changeUserRole,
};