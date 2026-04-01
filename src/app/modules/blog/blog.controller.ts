import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { BlogService } from "./blog.service";
import { IUserRequest } from "../../interfaces/user.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IUserRequest
  const result = await BlogService.createBlog(user, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Blog created successfully",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {

  const query = req.query as Record<string, string>
  
  const result = await BlogService.getAllBlogs(query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blogs fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BlogService.getBlogById(id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug  = req.params.slug  as string;
  const result = await BlogService.getBlogBySlug(slug);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog fetched successfully",
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const id  = req.params.id as string;
  const result = await BlogService.updateBlog(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog updated successfully",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const id  = req.params.id as string;
  const result = await BlogService.deleteBlog(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Blog deleted successfully",
    data: result,
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
