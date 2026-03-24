import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";

const createCategory = catchAsync(async (req: Request, res: Response) => {

    const result = await categoryService.createCategory(req.body);

    return sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Category created successfully",
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await categoryService.getAllCategories();

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Categories retrieved successfully",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await categoryService.updateCategory(id, req.body);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Category updated successfully",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await categoryService.deleteCategory(id);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Category deleted successfully",
        data: result,
    });
});

export const categoryController = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
};
