import { StatusCodes } from "http-status-codes"
import { catchAsync } from "../../shared/catchAsync"
import { sendRes } from "../../shared/sendRes"
import { Request, Response } from "express"
import { prescriptionService } from "./prescription.service"
import { IUserRequest } from "../../interfaces/IUserRequest"



const getAllPrescriptions = catchAsync(async (req: Request, res: Response) => {

    const result = await prescriptionService.getAllPrescriptions()

    return sendRes(res, { statusCode: StatusCodes.OK, message: "successfully", success: true, data: result })
})


const getMyPrescriptions = catchAsync(async (req: Request, res: Response) => {

    const user = req.user

    const result = await prescriptionService.getMyPrescriptions(user as IUserRequest)

    return sendRes(res, { statusCode: StatusCodes.OK, message: "successfully", success: true, data: result })
})


const createPrescription = catchAsync(async (req: Request, res: Response) => {

    const user = req.user
    const payload = req.body

    const result = await prescriptionService.createPrescription(    user as IUserRequest, payload)

    return sendRes(res, { statusCode: StatusCodes.CREATED, message: "successfully", success: true, data: result })
})


const updatePrescription = catchAsync(async (req: Request, res: Response) => {

    const user = req.user
    const payload = req.body
    const { id: prescriptionId } = req.params

    const result = await prescriptionService.updatePrescription(prescriptionId as string, payload, user as IUserRequest)

    return sendRes(res, { statusCode: StatusCodes.OK, message: "successfully", success: true, data: result })
})


const deletePrescription = catchAsync(async (req: Request, res: Response) => {

    const user = req.user
    const { id: prescriptionId } = req.params

    const result = await prescriptionService.deletePrescription(user as IUserRequest, prescriptionId as string)

    return sendRes(res, { statusCode: StatusCodes.OK, message: "successfully deleted", success: true, data: result })
})

export const prescriptionController = {
    getAllPrescriptions,
    getMyPrescriptions,
    createPrescription,
    updatePrescription,
    deletePrescription
}