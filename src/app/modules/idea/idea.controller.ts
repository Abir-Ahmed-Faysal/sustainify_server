import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ideaService } from "./idea.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";

const createIdea = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (files.image && files.image.length > 0) {
            payload.image = files.image[0].path;
        }

        if (files.attachments && files.attachments.length > 0) {
            payload.attachments = files.attachments.map((file) => file.path);
        }
    }

    const result = await ideaService.createIdea(req.user as IUserRequest, payload);

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
    const user = req.user as IUserRequest;
    const payload = req.body;

    if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (files.image && files.image.length > 0) {
            payload.image = files.image[0].path;
        }

        if (files.attachments && files.attachments.length > 0) {
            const newAttachments = files.attachments.map((file) => file.path);
            if (Array.isArray(payload.attachments)) {
                payload.attachments = [...payload.attachments, ...newAttachments];
            } else {
                payload.attachments = newAttachments;
            }
        }
    }
    
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

export const ideaController = {
    createIdea,
    getAllIdeas,
    getIdeaById,
    updateIdea,
    deleteIdea,
};
