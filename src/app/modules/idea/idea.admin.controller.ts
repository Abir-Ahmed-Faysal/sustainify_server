import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ideaAdminService } from "./idea.admin.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

/**
 * ADMIN CONTROLLER: HTTP handlers for admin-only idea operations
 * 
 * All handlers assume the user is already authenticated as ADMIN.
 * Permission checks are performed in the middleware layer (checkAuth(Role.ADMIN)).
 * Controller focuses on request parsing and response formatting.
 */

/**
 * GET /admin/ideas/:id
 * Fetch single idea details (admin has unrestricted access)
 */
const getIdeaByIdAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Idea ID is required");
  }

  const result = await ideaAdminService.getIdeaByIdAdmin(id);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Idea retrieved successfully (Admin)",
    data: result,
  });
});

/**
 * GET /admin/ideas
 * Fetch all ideas with advanced filtering, sorting, and pagination
 */
const getAllIdeasAdmin = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;

  const result = await ideaAdminService.getAllIdeasAdmin(query);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All ideas retrieved successfully (Admin)",
    meta: result.meta,
    data: result.data,
  });
});

/**
 * PATCH /admin/ideas/:id/status
 * Change idea status (UNDER_REVIEW → APPROVED/REJECTED) with optional feedback
 * 
 * Body: { status: IdeaStatus; feedback?: string }
 */
const changeIdeaStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { status, feedback } = req.body;

  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Idea ID is required");
  }

  if (!status) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Status is required");
  }

  const result = await ideaAdminService.changeIdeaStatus(id, status, feedback);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Idea status updated to ${status}`,
    data: result,
  });
});

/**
 * PATCH /admin/ideas/:id/featured
 * Toggle idea featured status for homepage promotion
 * 
 * Body: { isFeatured: boolean }
 */
const toggleIdeaFeatured = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { isFeatured } = req.body;

  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Idea ID is required");
  }

  if (typeof isFeatured !== "boolean") {
    throw new AppError(StatusCodes.BAD_REQUEST, "isFeatured must be a boolean");
  }

  const result = await ideaAdminService.toggleIdeaFeatured(id, isFeatured);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Idea ${isFeatured ? "featured" : "unfeatured"} successfully`,
    data: result,
  });
});

/**
 * PATCH /admin/ideas/:id
 * Update idea details (admin can update any idea)
 * 
 * Body: IIdeaUpdate
 */
const updateIdeaAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const payload = req.body;

  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Idea ID is required");
  }

  const result = await ideaAdminService.updateIdeaAsAdmin(id, payload);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Idea updated successfully",
    data: result,
  });
});

/**
 * DELETE /admin/ideas/:id
 * Delete idea (soft delete with cascading cleanup)
 */
const deleteIdeaAsAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Idea ID is required");
  }

  const result = await ideaAdminService.deleteIdeaAsAdmin(id);

  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Idea deleted successfully",
    data: result,
  });
});

export const ideaAdminController = {
  getIdeaByIdAdmin,
  getAllIdeasAdmin,
  changeIdeaStatus,
  toggleIdeaFeatured,
  updateIdeaAsAdmin,
  deleteIdeaAsAdmin,
};
