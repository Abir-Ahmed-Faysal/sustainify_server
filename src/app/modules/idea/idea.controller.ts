import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ideaService } from "./idea.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";

const createIdea = catchAsync(async (req: Request, res: Response) => {
    const authorId = req.user.id as string;
    const result = await ideaService.createIdea(authorId, req.body);

    return sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Idea created successfully",
        data: result,
    });
});

const getAllIdeas = catchAsync(async (req: Request, res: Response) => {
    const result = await ideaService.getAllIdeas();

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Ideas retrieved successfully",
        data: result,
    });
});

const getIdeaById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await ideaService.getIdeaById(id);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Idea retrieved successfully",
        data: result,
    });
});

const updateIdea = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const authorId = req.user.id;
    const authorRole = req.user.role;
    
    const result = await ideaService.updateIdea(id, authorId, authorRole, req.body);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Idea updated successfully",
        data: result,
    });
});

const deleteIdea = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const authorId = req.user.id;
    const authorRole = req.user.role;
    
    const result = await ideaService.deleteIdea(id, authorId, authorRole);

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
};
