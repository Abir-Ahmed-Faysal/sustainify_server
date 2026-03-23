import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendRes";
const register = catchAsync(async (req: Request, res: Response) => {


    const result = await authService.register(req.body)



    //Todo set token on the headers

    return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User registered successfully",
        data: result
    })
})

export const authController = {
    register
}