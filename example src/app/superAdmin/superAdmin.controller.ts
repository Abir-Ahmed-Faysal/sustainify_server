import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import { sendRes } from "../shared/sendRes";
import { adminService } from "./SuperAdmin.service";
import { catchAsync } from "../shared/catchAsync";
import { IUserRequest } from "../interfaces/IUserRequest";

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
const {user}= req

    const result = await adminService.updateAdmin(req.params.id as string,user as IUserRequest, req.body);

    return sendRes(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "admin data update successfully",
        data: result
    });
});



const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
    const { user } = req
    const result = await adminService.deleteAdmin(req.params.id as string, user as IUserRequest);



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
    deleteAdmin
};