import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { profileService } from "./profile.service";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { sendResponse } from "../../shared/sendRes";


const updateProfile = catchAsync(async (req: Request, res: Response) => {

    const user = req.user as IUserRequest;
    const payload = req.body;

    if (req.file) {
        payload.avatar = req.file.path;
    }
    
    const result = await profileService.updateProfile(user, payload);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});



export const profileController = {
   
    updateProfile,
};
