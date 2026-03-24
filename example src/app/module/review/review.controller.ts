import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { sendRes } from "../../shared/sendRes"
import { StatusCodes } from "http-status-codes"
import { ReviewService } from "./review.service"
import { IUserRequest } from "../../interfaces/IUserRequest"

const giveReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const payload = req.body

    const result = await ReviewService.giveReview(user as IUserRequest, payload)


    return sendRes(res, { statusCode: StatusCodes.CREATED, success: true, message: "review given successfully", data: result })
})


const myReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user

    const result = await ReviewService.myReview(user as IUserRequest)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "review data retrieve successfully", data: result })
})

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const payload = req.body
    const { id: reviewId } = req.params

    const result = await ReviewService.updateReview(user as IUserRequest, reviewId as string, payload)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "review updated successfully", data: result })

})


const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const { id: reviewId } = req.params 

    const result = await ReviewService.deleteReview(user as IUserRequest, reviewId as string)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "review deleted successfully", data: result })

})



export const ReviewController = {
    giveReview,
    myReview,
    updateReview,
    deleteReview

}