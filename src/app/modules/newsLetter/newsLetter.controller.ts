import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { newsLetterService } from "./newsLetter.service";

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const result = await newsLetterService.subscribe(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Subscribed to newsletter successfully",
    data: result,
  });
});

const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const result = await newsLetterService.getAllSubscribers();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Newsletter subscribers retrieved successfully",
    data: result,
  });
});

export const newsLetterController = {
  subscribe,
  getAllSubscribers,
};
