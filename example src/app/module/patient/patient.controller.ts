import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";

import { IUserRequest } from "../../interfaces/IUserRequest";
import { sendRes } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { patientService } from "./patient.service";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body
    

    const result = await patientService. updateMyProfile(user as IUserRequest, payload)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "profile update successfully", data: result })
})




export const  patientController = {
    updateMyProfile
}