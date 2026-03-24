import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { sendRes } from "../../shared/sendRes"
import { scheduleService } from "./schedule.service"
import { IQueryParams } from "../../interfaces/query.interface"


const createSchedule = catchAsync(async (req: Request, res: Response) => {

    const payload = req.body
    const result = await scheduleService.createSchedule(payload)

    return sendRes(res, { statusCode: 201, message: "successfully", success: true, data: result })
})




const getAllSchedule = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await scheduleService.getAllSchedule(query as IQueryParams)
    return sendRes(res, { statusCode: 201, message: "successfully", success: true, data: result.data, meta: result.meta })
})




const getScheduleById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params
    const result = await scheduleService.getScheduleById(id as string)
    return sendRes(res, { statusCode: 201, message: "successfully", success: true, data: result })
})


// !error if delete the schedule the doctor booked
const updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id
    const payload = req.body
    const result = await scheduleService.updateSchedule(id as string, payload)
    return sendRes(res, { statusCode: 201, message: "successfully", success: true, data: result })
})


const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id
    const result = await scheduleService.deleteSchedule(id as string)
    return sendRes(res, { statusCode: 201, message: "delete successfully", success: true, data: result })
})


export const scheduleController = {
    createSchedule, updateSchedule, deleteSchedule, getScheduleById, getAllSchedule
}