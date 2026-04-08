/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { contactService } from "./contact.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

/**
 * Create a new contact message (public endpoint)
 */
const createContact = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await contactService.createContact(payload);
  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Contact message sent successfully",
    data: result as any,
  });
});

/**
 * Get all contact messages with pagination (admin only)
 */
const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await contactService.getAllContacts(query);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Contact messages retrieved successfully",
    meta: result.meta as any,
    data: result.data as any,
  });
});

/**
 * Get a single contact message by ID (admin only)
 */
const getContactById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError(400, "Contact ID is required");
  }
  const result = await contactService.getContactById(id as string);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Contact message retrieved successfully",
    data: result as any,
  });
});

/**
 * Mark a contact message as read (admin only)
 */
const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError(400, "Contact ID is required");
  }
  const result = await contactService.markAsRead(id as string);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Contact message marked as read",
    data: result as any,
  });
});

/**
 * Delete a contact message (admin only)
 */
const deleteContact = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError(400, "Contact ID is required");
  }
  const result = await contactService.deleteContact(id as string);
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Contact message deleted successfully",
    data: result as any,
  });
});

/**
 * Get unread contact messages count (admin only)
 */
const getUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const result = await contactService.getUnreadCount();
  return sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Unread count retrieved successfully",
    data: result as any,
  });
});

export const contactController = {
  createContact,
  getAllContacts,
  getContactById,
  markAsRead,
  deleteContact,
  getUnreadCount,
};

