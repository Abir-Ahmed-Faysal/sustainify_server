import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IIdea, IIdeaUpdate } from "./idea.interfaces";
import { IUserRequest } from "../../interfaces/user.interface";
import { Role } from "../../../generated/prisma";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";


const createIdea = async (user: IUserRequest, payload: IIdea) => {
    const categoryExists = await prisma.category.findUnique({
        where: { id: payload.categoryId },
    });

    if (!categoryExists) {
        throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }

    const price = Number(payload?.price)

    if (price) {
        payload.isPaid = true
    }

    const result = await prisma.idea.create({
        data: {
            ...payload,
            authorId: user.id,
        },
    });
    return result;
};

const getAllIdeas = async (query: IQueryParams) => {
    const ideaModel = prisma.idea as any; // Cast for QueryBuilder compatibility
    
    const ideaQueryBuilder = new QueryBuilder(ideaModel, query, {
        searchableFields: ["title", "problemStatement", "description"],
        filterableFields: ["categoryId", "isPaid", "status", "authorId", "isFeatured"],
    });

    const result = await ideaQueryBuilder
        .search()
        .filter()
        .sort()
        .paginate()
        .where({ isDeleted: false })
        .include({
            category: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                }
            },
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    profile: {
                        select: {
                            avatar: true,
                        }
                    }
                }
            },
            _count: {
                select: {
                    comments: true,
                    votes: true,
                }
            }
        })
        .execute();

    // Securely project fields to hide sensitive data in list view
    // Note: QueryBuilder might have already fetched these if not using .fields()
    // We filter the data array in the result.
    result.data = result.data.map((idea: any) => ({
        id: idea.id,
        title: idea.title,
        problemStatement: idea.problemStatement,
        image: idea.image,
        isPaid: idea.isPaid,
        price: idea.price,
        status: idea.status,
        isFeatured: idea.isFeatured,
        createdAt: idea.createdAt,
        positiveRatio: idea.positiveRatio,
        totalUpVotes: idea.totalUpVotes,
        totalDownVotes: idea.totalDownVotes,
        author: idea.author,
        category: idea.category,
        _count: idea._count
    }));

    return result;
};

const getIdeaById = async (id: string, user?: IUserRequest) => {
    const idea = await prisma.idea.findUnique({
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
            category: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                }
            }
        }
    });

    if (!idea) {
        throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
    }

    if (user?.role === Role.ADMIN) {
        return idea;
    }

    // 2. If Free Idea -> Return full content
    if (!idea.isPaid) {
        return idea;
    }

    // 3. If Paid Idea:
    let isPurchased = false;
    if (user) {
        const purchase = await prisma.access.findUnique({
            where: {
                userId_ideaId: {
                    userId: user.id,
                    ideaId: id,
                }
            }
        });
        if (purchase) {
            isPurchased = true;
        }
    }

    if (isPurchased) {
        return idea;
    }

    // Not purchased -> Return partial data only
    return {
        id: idea.id,
        title: idea.title,
        problemStatement: idea.problemStatement,
        description: idea.description.substring(0, 100) + "...", // Short preview
        image: idea.image,
        isPaid: idea.isPaid,
        price: idea.price,
        status: idea.status,
        author: idea.author,
        category: idea.category,
        createdAt: idea.createdAt,
    };
};

const updateIdea = async (id: string, user: IUserRequest, payload: IIdeaUpdate) => {

    

    const idea = await prisma.idea.findUnique({
        where: { id, isDeleted: false },
    });

    if (!idea) {
        throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
    }

    // Only the author or an ADMIN can update the idea
    if (idea.authorId !== user.id && user.role !== Role.ADMIN) {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to update this idea");
    }

    const result = await prisma.idea.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteIdea = async (id: string, user: IUserRequest) => {
    // Find the idea
    const idea = await prisma.idea.findUnique({
        where: { id },
    });

    if (!idea || idea.isDeleted) {
        throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
    }

    // Only the author or an admin can delete
    if (idea.authorId !== user.id && user.role !== Role.ADMIN) {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to delete this idea");
    }

    // Soft delete the idea
    const result = await prisma.idea.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
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
