import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { commentService } from "./comment.service";
import { ICreateComment } from "./comment.interface";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserRequest;
  const payload = req.body
  const result = await commentService.createComment(user, payload as ICreateComment);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getCommentsByIdea = catchAsync(async (req: Request, res: Response) => {
  const { ideaId } = req.params;
  const result = await commentService.getCommentsByIdea(ideaId as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUserRequest;
  const result = await commentService.updateComment(id as string, user.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUserRequest;
  
  const result = await commentService.deleteComment(id as string, user.id, user.role);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

export const commentController = {
  createComment,
  getCommentsByIdea,
  updateComment,
  deleteComment,
};
