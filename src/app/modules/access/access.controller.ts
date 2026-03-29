import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { accessService } from "./access.service";
import { IQueryParams } from "../../interfaces/query.interface";

/**
 * Check if the authenticated user has accessed a specific idea
 * GET /api/v1/access/:ideaId
 */
const checkMyAccess = catchAsync(async (req: Request, res: Response) => {
    const { ideaId } = req.params as { ideaId: string };
    const user = req.user as IUserRequest;

    const hasAccess = await accessService.checkMyAccessToIdea(user.id, ideaId);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Your access status retrieved",
        data: hasAccess,
    });
});

/**
 * Get all ideas pursued and paid for by the authenticated user
 * GET /api/v1/access/my
 */
const getMyPaidPursuedIdeas = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUserRequest;
    const queryParams = req.query as unknown as IQueryParams;

    const result = await accessService.getMyPaidPursuedIdeas(user.id, queryParams);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Your paid pursued ideas retrieved",
        meta: result.meta,
        data: result.data,
    });
});

export const accessController = {
    checkMyAccess,
    getMyPaidPursuedIdeas,
};
