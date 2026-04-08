/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICategory, ICategoryUpdate } from "./category.interfaces";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { formatToLocalTime } from "../../utilities/dateTime";

const createCategory = async (payload: ICategory) => {

    const isExist = await prisma.category.findUnique({
        where: { name: payload.name },
    });

    if (isExist) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Category already exists");
    }

    const result = await prisma.category.create({
        data: payload,
    });
    return result;
};


const getAllCategories = async (query: IQueryParams) => {
    const categoryModel = prisma.category as any;

    const categoryQueryBuilder = new QueryBuilder(categoryModel, query, {
        searchableFields: ["name"],
        filterableFields: ["name"],
    });

    const result = await categoryQueryBuilder
        .search()
        .filter()
        .sort()
        .paginate()
        .execute();

    // Add formatted dates
    result.data = result.data.map((category: any) => ({
        ...category,
        createdAt: formatToLocalTime(category.createdAt),
        updatedAt: formatToLocalTime(category.updatedAt),
    }));

    return result;
};

const updateCategory = async (id: string, payload: ICategoryUpdate) => {
    const isExist = await prisma.category.findUnique({
        where: { id },
    });

    if (!isExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }

    const result = await prisma.category.update({
        where: { id },
        data: payload,
    });
    return result;
};



const deleteCategory = async (id: string) => {
    const isExist = await prisma.category.findUnique({
        where: { id },
    });

    if (!isExist) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }

  // ✅ Use transaction to safely handle category deletion
  return await prisma.$transaction(async (tx) => {
    // Check if there are active ideas in this category
    const activeIdeaCount = await tx.idea.count({
      where: { 
        categoryId: id,
        isDeleted: false 
      },
    });

    if (activeIdeaCount > 0) {
      throw new AppError(
        StatusCodes.CONFLICT,
        `Cannot delete category: ${activeIdeaCount} active ideas belong to it. Please re-categorize or delete the ideas first.`
      );
    }

    // Perform the deletion
    const result = await tx.category.delete({
      where: { id },
    });
    
    return result;
  });
};




export const categoryService = {
    createCategory, getAllCategories,
    updateCategory, deleteCategory
};