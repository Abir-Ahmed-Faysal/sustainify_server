/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IIdeaCreatePayload, IIdeaUpdate } from "./idea.interfaces";
import { IUserRequest } from "../../interfaces/user.interface";
import { IdeaStatus, Role } from "../../../generated/prisma";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { formatToLocalTime } from "../../utilities/dateTime";


const createIdea = async (user: IUserRequest, payload: IIdeaCreatePayload) => {
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

  // Transform categoryName to category.name for nested filtering
  if (query.categoryName) {
    query["category.name"] = query.categoryName;
    delete query.categoryName;
  }

  // Set professional default sorting if not provided
  if (!query.sortBy) {
    query.sortBy = "positiveRatio,createdAt";
    query.sortOrder = "desc,desc";
  }

  const ideaQueryBuilder = new QueryBuilder(ideaModel, query, {
    searchableFields: ["title", "problemStatement", "description"],
    filterableFields: ["categoryId", "isPaid", "status", "authorId", "isFeatured", "category.name"],
  });

  const result = await ideaQueryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ isDeleted: false, status: IdeaStatus.APPROVED })
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
  result.data = result.data.map((idea: any) => ({
    id: idea.id,
    title: idea.title,
    problemStatement: idea.problemStatement,
    image: idea.image,
    isPaid: idea.isPaid,
    price: idea.price,
    status: idea.status,
    isFeatured: idea.isFeatured,
    createdAt: formatToLocalTime(idea.createdAt),
    positiveRatio: idea.positiveRatio,
    totalUpVotes: idea.totalUpVotes,
    totalDownVotes: idea.totalDownVotes,
    author: idea.author,
    category: idea.category,
    _count: idea._count
  }));

  return result;
};

export const getIdeaById = async (id: string, user?: IUserRequest) => {
  // Fetch idea with author, category, and counts
  const idea = await prisma.idea.findUnique({
    where: { id, isDeleted: false, status: IdeaStatus.APPROVED },
    include: {
      comments: {
        include: {
          user: {
            select: {
              name: true,
              profile: true
            }
          }
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              avatar: true,
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },

      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
    },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Normalize idea to match IIdea interface
  const formatIdea = (item: typeof idea & { author: { profile: { avatar: string | null } | null } }) => ({
    ...item,
    author: {
      ...item.author,
      profile: item.author.profile ?? undefined, // Convert null → undefined for TypeScript
    },
    createdAt: formatToLocalTime(item.createdAt),
    updatedAt: formatToLocalTime(item.updatedAt),
  });

  // 1. Admins see full content
  if (user?.role === Role.ADMIN) {
    return { ...formatIdea(idea), unlock: true };
  }

  // 2. Authors see full content (their own idea)
  if (user && user.id === idea.authorId) {
    return { ...formatIdea(idea), unlock: true };
  }

  // 3. Free idea → return full content
  if (!idea.isPaid) {
    return { ...formatIdea(idea), unlock: true };
  }

  // 4. Paid idea → check if user has purchased
  let isPurchased = false;
  if (user) {
    const purchase = await prisma.access.findUnique({
      where: {
        userId_ideaId: {
          userId: user.id,
          ideaId: id,
        },
      },
    });
    if (purchase) isPurchased = true;
  }

  if (isPurchased) {
    return { ...formatIdea(idea), unlock: true };
  }

  // 4. Not purchased → return partial preview (with necessary fields for preview UI)
  // Note: 'solution' field is intentionally omitted to indicate partial data on client
  return {
    id: idea.id,
    title: idea.title,
    problemStatement: idea.problemStatement,
    description: idea.description.substring(0, 100) + "...", // Short preview
    image: idea.image,
    isPaid: idea.isPaid,
    price: idea.price,
    status: idea.status,
    isFeatured: idea.isFeatured,
    positiveRatio: idea.positiveRatio,
    totalUpVotes: idea.totalUpVotes,
    totalDownVotes: idea.totalDownVotes,
    unlock: false,
    author: {
      ...idea.author,
      profile: idea.author.profile ?? undefined,
    },
    category: idea.category,
    createdAt: formatToLocalTime(idea.createdAt),
    updatedAt: formatToLocalTime(idea.updatedAt),
    _count: idea._count,

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
