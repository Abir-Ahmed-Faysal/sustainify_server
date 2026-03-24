import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendRes } from "../../shared/sendRes";
import { AppointmentService } from "./appointment.service";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { IQueryParams } from "../../interfaces/query.interface";
import { StatusCodes } from "http-status-codes";

//  All
const getAllAppointments = catchAsync(async (req: Request, res: Response) => {

  const query = req.query
  const result = await AppointmentService.getAllAppointments(query as IQueryParams);

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "All appointments fetched successfully",
    data: result,
  });
});


//  My
const getMyAppointments = catchAsync(async (req: Request, res: Response) => {
  const user = req.user

  const result = await AppointmentService.getMyAppointments(user as IUserRequest);

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "My appointments fetched successfully",
    data: result,
  });
});


//  My Single
const getMySingleAppointment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const { id: appointmentId } = req.params;

  const result = await AppointmentService.getMySingleAppointment(appointmentId as string, user as IUserRequest);

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "Appointment fetched successfully",
    data: result,
  });
});


const bookAppointment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const payload = req.body

  const result = await AppointmentService.bookAppointment(payload, user as IUserRequest)

  sendRes(res, {
    statusCode: 201,
    success: true,
    message: "Appointment booked successfully",
    data: result,
  });
});


const changeAppointmentStatus = catchAsync(async (req: Request, res: Response) => {

  const { id: appointmentId } = req.params;
  const user = req.user
  const requestedStatus = req.body


  const result = await AppointmentService.changeAppointmentStatus(
    appointmentId as string,
    requestedStatus,
    user as IUserRequest,
  );

  sendRes(res, {
    statusCode: 200,
    success: true,
    message: "Appointment status changed successfully",
    data: result,
  });
});

const bookAppointmentWithPayLater = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body
  const user = req.user
  const result = await AppointmentService.bookAppointmentWithPayLater(payload, user as IUserRequest)

  return sendRes(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Appointment Booked Successfully",
    data: result
  })

})

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const { id: appointmentId } = req.params

  const result = await AppointmentService.initiatePayment(appointmentId as string, user as IUserRequest)


  return sendRes(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment Initiated Successfully",
    data: result
  })
})





export const AppointmentController = {
  getAllAppointments,
  getMyAppointments,
  getMySingleAppointment,
  bookAppointment,
  changeAppointmentStatus,
  initiatePayment,
  bookAppointmentWithPayLater
};