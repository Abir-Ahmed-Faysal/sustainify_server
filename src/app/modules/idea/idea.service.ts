import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IIdea, IIdeaUpdate } from "./idea.interfaces";

const createIdea = async (authorId: string, payload: IIdea) => {
    const categoryExists = await prisma.category.findUnique({
        where: { id: payload.categoryId },
    });

    if (!categoryExists) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }

    const result = await prisma.idea.create({
        data: {
            ...payload,
            authorId,
        },
    });
    return result;
};

const getAllIdeas = async () => {
    const result = await prisma.idea.findMany({
        where: { isDeleted: false },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: {
                        select: {
                            avatar: true,
                        }
                    }
                }
            },
            category: true,
        }
    });
    return result;
};

const getIdeaById = async (id: string) => {
    const result = await prisma.idea.findUnique({
        where: { id, isDeleted: false },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: {
                        select: {
                            avatar: true,
                        }
                    }
                }
            },
            category: true,
        }
    });

    if (!result) {
        throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
    }

    return result;
};

const updateIdea = async (id: string, authorId: string, authorRole: string, payload: IIdeaUpdate) => {
    const idea = await prisma.idea.findUnique({
        where: { id, isDeleted: false },
    });

    if (!idea) {
        throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
    }

    // Only the author or an ADMIN can update the idea
    if (idea.authorId !== authorId && authorRole !== "ADMIN") {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to update this idea");
    }

    const result = await prisma.idea.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteIdea = async (id: string, authorId: string, authorRole: string) => {
    const idea = await prisma.idea.findUnique({
        where: { id, isDeleted: false },
    });

    if (!idea) {
        throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
    }
    
    // Only the author or an ADMIN can delete the idea
    if (idea.authorId !== authorId && authorRole !== "ADMIN") {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to delete this idea");
    }

    const result = await prisma.idea.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        }
    });
    return result;
};

export const ideaService = {
    createIdea,
    getAllIdeas,
    getIdeaById,
    updateIdea,
    deleteIdea,
};
