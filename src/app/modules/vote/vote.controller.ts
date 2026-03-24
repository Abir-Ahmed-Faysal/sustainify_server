import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { voteService } from "./vote.service";

const toggleVote = catchAsync(async (req: Request, res: Response) => {
  
  const user = req.user as IUserRequest;

  // Pass req.body as the second argument (payload)
  const result = await voteService.toggleVote(user, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.action === "REMOVED" ? "Vote removed successfully" : "Vote recorded successfully",
    data: result.idea,
  });
});

export const voteController = {
  toggleVote,
};
