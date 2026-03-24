import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { sendRes } from "../../shared/sendRes"
import { StatusCodes } from "http-status-codes"
import { statsService } from "./stats.service"
import { IUserRequest } from "../../interfaces/IUserRequest"


const getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await statsService.getDashboardStatsData(user as IUserRequest)

    return sendRes(res, {
        statusCode: StatusCodes.OK, success: true,
        message: "stats data fetch successfully", data: result
    })
})




export const statsController = {
    getDashboardStatsData
}