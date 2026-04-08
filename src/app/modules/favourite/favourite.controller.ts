import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { favouriteService } from "./favourite.service";
import { IFavourite } from "./favourite.interface";

const toggleFavourite = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserRequest;
  const payload = req.body as IFavourite;
  
  const result = await favouriteService.toggleFavourite(user, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.action === "REMOVED" ? "Removed from favorites successfully" : "Added to favorites successfully",
    data: result,
  });
});

const getMyFavourites = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserRequest;
  const result = await favouriteService.getMyFavourites(user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Favorites retrieved successfully",
    data: result,
  });
});

export const favouriteController = {
  toggleFavourite,
  getMyFavourites,
};
