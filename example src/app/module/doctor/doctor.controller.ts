import { StatusCodes } from "http-status-codes"
import { doctorService } from "./doctor.service"
import { sendRes } from "../../shared/sendRes"
import { catchAsync } from "../../shared/catchAsync"
import { Request, Response } from "express"
import { IQueryParams } from "../../interfaces/query.interface"
import { IUserRequest } from "../../interfaces/IUserRequest"

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {

    const query = req.query

    console.log(query);

    const result = await doctorService.getAllDoctors(query as IQueryParams)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "doctors  data retrieves successfully", data: result.data, meta: result.meta })
})

const getDoctor = catchAsync(async (req: Request, res: Response) => {

    const result = await doctorService.getDoctorById(req.params.id as string)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "doctor data retrieve successfully", data: result })
})



const updateDoctor = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await doctorService.updateDoctor(user as IUserRequest, req.body)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "doctor data create successfully", data: result })
})



const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await doctorService.updateDoctor(user as IUserRequest, req.body)

    return sendRes(res, { statusCode: StatusCodes.OK, success: true, message: "doctor data delete successfully", data: result })
})


export const doctorController = {
    getAllDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor
}