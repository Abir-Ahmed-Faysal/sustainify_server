import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { profileService } from "./profile.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";


const updateProfile = catchAsync(async (req: Request, res: Response) => {

    const user = req.user as IUserRequest;


    
    const result = await profileService.updateProfile(user, req.body);

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
