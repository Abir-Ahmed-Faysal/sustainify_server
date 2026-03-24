import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICategory, ICategoryUpdate } from "./category.interfaces";

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

const getAllCategories = async () => {
    const result = await prisma.category.findMany();
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

    const result = await prisma.category.delete({
        where: { id },
    });
    return result;
};




export const categoryService = {
    createCategory, getAllCategories,
    updateCategory, deleteCategory
};