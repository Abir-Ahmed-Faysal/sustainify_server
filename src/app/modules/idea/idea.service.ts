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
    searchableFields: ["title", "problemStatement", "description", "author.name"],
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
    description: idea.description,
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
    attachments: idea.attachments,
    _count: idea._count
  }));

  return result;
};
const getMyIdeas = async (query: IQueryParams, user: IUserRequest) => {
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
    .where({ isDeleted: false, authorId: user.id })
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
    description: idea.description,
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
    attachments: idea.attachments,
    _count: idea._count
  }));

  return result;
};


const getMyIdeaById = async (id: string, user: IUserRequest) => {

  const idea = await prisma.idea.findUnique({
    where: { authorId: user.id, id, isDeleted: false }
  })
  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "idea not found")
  }
  return idea
}


const changeStatus = async (
  id: string,
  user: IUserRequest,
  status: IdeaStatus
) => {

  // only allow UNDER_REVIEW
  if (status !== IdeaStatus.UNDER_REVIEW) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only send idea for review"
    );
  }

  const findIdea = await prisma.idea.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
      authorId: user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (findIdea.status === status) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Idea already in this status"
    );
  }

  return prisma.idea.update({
    where: { id },
    data: { status },
  });
};


const changeStatusByAdmin = async (
  id: string,
  user: IUserRequest,
  status: IdeaStatus
) => {

  if (user.role !== Role.ADMIN) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only admin can change this status"
    );
  }

  if (
    status !== IdeaStatus.APPROVED &&
    status !== IdeaStatus.REJECTED
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Admin can only approve or reject ideas"
    );
  }

  const findIdea = await prisma.idea.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (findIdea.status === status) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Idea already in this status"
    );
  }

  return prisma.idea.update({
    where: { id },
    data: { status },
  });
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
    return { ...formatIdea(idea), unlock: true, comment: true };
  }

  // 2. Authors see full content (their own idea)
  if (user && user.id === idea.authorId) {
    return { ...formatIdea(idea), unlock: true, comment: true };
  }

  // 3. Free idea → return full content
  if (!idea.isPaid) {
    return { ...formatIdea(idea), unlock: true, comment: true };
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
    return { ...formatIdea(idea), unlock: true, comment: true };
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
    comment: false,
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


const toggleIsFeatured = async (
  ideaId: string,
  user: IUserRequest,
  payload: { isFeatured: boolean }
) => {

  // ✅ Only Admin
  if (user.role !== Role.ADMIN) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only admin can feature an idea"
    );
  }

  // ✅ Check idea exists
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      isFeatured: true,
    },
  });

  if (!idea) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Idea not found"
    );
  }

  // ✅ Update isFeatured
  const updatedIdea = await prisma.idea.update({
    where: { id: ideaId },
    data: { isFeatured: payload.isFeatured },
  });

  return updatedIdea;
};


export const ideaService = {
  changeStatus,
  createIdea,
  getAllIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  getMyIdeas,
  getMyIdeaById,
  changeStatusByAdmin,
  toggleIsFeatured
};
