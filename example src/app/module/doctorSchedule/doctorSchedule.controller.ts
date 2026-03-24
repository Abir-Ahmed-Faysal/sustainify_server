import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendRes } from "../../shared/sendRes";
import { doctorScheduleService } from "./doctorSchedule.service";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { IQueryParams } from "../../interfaces/query.interface";

// 🔹 Create My
const createMyDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const payload = req.body;

  const result = await doctorScheduleService.createMyDoctorSchedule(user, payload);

  sendRes(res, {
    statusCode: 201,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

// 🔹 Get My
const getMyDoctorSchedules = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const query = req.query


  const result =
    await doctorScheduleService.getMyDoctorSchedules(user as IUserRequest, query as IQueryParams);

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "My schedules fetched successfully",
    data: result.data,
    meta: result.meta
  });
});

// 🔹 Admin Get All
const getAllDoctorSchedules = catchAsync(async (req: Request, res: Response) => {

  const query = req.query


  const result =
    await doctorScheduleService.getAllDoctorSchedules(query as IQueryParams);

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "All doctor's schedules fetched successfully",
    data: result.data,
    meta: result.meta
  });
});

// 🔹 Get By Id
const getDoctorScheduleById = catchAsync(async (req: Request, res: Response) => {
  const { scheduleId } = req.params;
  const { doctorId } = req.params;

  const result =
    await doctorScheduleService.getDoctorScheduleById(doctorId as string, scheduleId as string);

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "Schedule fetched successfully",
    data: result,
  });
});

// 🔹 Update My
const updateMyDoctorSchedule = catchAsync(async (req: Request, res: Response) => {


  const user = req.user!;
  const payload = req.body;

  const result =
    await doctorScheduleService.updateMyDoctorSchedule(

      user as IUserRequest,
      payload
    );

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "Schedule updated successfully",
    data: result,
  });
});

// 🔹 Delete My
const deleteMyDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const { id: scheduleId } = req.params;

  const result =
    await doctorScheduleService.deleteMyDoctorSchedule(scheduleId as string, user as IUserRequest);

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const doctorScheduleController = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};