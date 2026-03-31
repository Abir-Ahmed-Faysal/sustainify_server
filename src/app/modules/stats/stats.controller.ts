import { StatusCodes } from "http-status-codes"
import { sendResponse } from "../../shared/sendRes"
import { statsService } from "./stats.service"
import { catchAsync } from "../../shared/catchAsync"
import { Request, Response } from "express"
import { IUserRequest } from "../../interfaces/user.interface"

const getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUserRequest
    const result = await statsService.getDashboardStatsData(user)

    return sendResponse(res, {
        statusCode: StatusCodes.OK, success: true,
        message: "stats data fetch successfully", data: result
    })
})




export const statsController = {
    getDashboardStatsData
}