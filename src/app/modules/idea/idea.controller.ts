import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ideaService } from "./idea.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import AppError from "../../errorHelpers/AppError";

const createIdea = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    
    const user = req?.user as IUserRequest

    const result = await ideaService.createIdea(user , payload);

    return sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Idea created successfully",
        data: result,
    });
});

const getAllIdeas = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await ideaService.getAllIdeas(query);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Ideas retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});


const getMyIdeas = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const user = req.user as IUserRequest

    const result = await ideaService.getMyIdeas(query, user);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "My Ideas retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});


const getMyIdeaById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user as IUserRequest

    const result = await ideaService.getMyIdeaById(id, user);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "My Ideas retrieved successfully",
        data: result
    });
});


const getIdeaById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user as IUserRequest;
    console.log("idea →req", id, "user→", user);
    const result = await ideaService.getIdeaById(id, user);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Idea retrieved successfully",
        data: result,
    });
});

const updateIdea = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user as IUserRequest;
    const payload = req.body;

    const result = await ideaService.updateIdea(id, user, payload);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Idea updated successfully",
        data: result,
    });
});

const deleteIdea = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user as IUserRequest;

    const result = await ideaService.deleteIdea(id, user);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Idea deleted successfully",
        data: result,
    });
});


const updateIdeaStatus = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user as IUserRequest;
    const status = req.body

    const result = await ideaService.changeStatus(id, user, status);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Idea deleted successfully",
        data: result,
    });
});


const toggleIsFeatured = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = req.user as IUserRequest;

  // ✅ Validate payload
  const { isFeatured } = req.body as { isFeatured: boolean };
  if (typeof isFeatured !== "boolean") {
    throw new AppError(StatusCodes.BAD_REQUEST, "isFeatured must be boolean");
  }

  // ✅ Call service
  const result = await ideaService.toggleIsFeatured(id, user, { isFeatured });

  // ✅ Send response
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Idea ${isFeatured ? "featured" : "unfeatured"} successfully`,
    data: result,
  });
});


const updateIdeaStatusByAdmin = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user as IUserRequest;
    const status = req.body

    const result = await ideaService.changeStatus(id, user, status);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Idea deleted successfully",
        data: result,
    });
});



export const ideaController = {
    createIdea,
    getAllIdeas,
    getIdeaById,
    updateIdea,
    deleteIdea,
    getMyIdeas,
    getMyIdeaById,
    updateIdeaStatus,
    updateIdeaStatusByAdmin,
    toggleIsFeatured
};
