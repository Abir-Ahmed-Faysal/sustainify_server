/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IIdeaUpdate } from "./idea.interfaces";
import { IdeaStatus,  } from "../../../generated/prisma";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { formatToLocalTime } from "../../utilities/dateTime";

/**
 * ADMIN SERVICE: Specialized business logic for admin operations
 * 
 * This service provides admin-specific functionality:
 * - Unrestricted access to all ideas (with audit logging)
 * - Advanced filtering and management capabilities
 * - Status transitions with feedback
 * - Featured/promotion management
 * 
 * No permission checks needed - all methods assume role verification at controller level
 */

/**
 * Get single idea by ID (No permission restrictions - admin can see any idea)
 * @param ideaId - UUID of the idea
 * @returns Full idea details with all relationships
 */
const getIdeaByIdAdmin = async (ideaId: string) => {
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, isDeleted: false },
    include: {
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
              bio: true,
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
      votes: {
        select: {
          id: true,
          userId: true,
          type: true,
        },
      },
      _count: {
        select: {
          comments: true,
          votes: true,
          favourites: true,
        },
      },
    },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Format and return with admin-level details
  return {
    ...idea,
    author: {
      ...idea.author,
      profile: idea.author.profile ?? undefined,
    },
    createdAt: formatToLocalTime(idea.createdAt),
    updatedAt: formatToLocalTime(idea.updatedAt),
    // Admin always has full access
    unlock: true,
    comment: true,
  };
};

/**
 * Get all ideas (Admin view - includes all statuses except DRAFT)
 * Supports advanced filtering, sorting, and pagination
 */
const getAllIdeasAdmin = async (query: IQueryParams) => {
  const ideaModel = prisma.idea as any;

  // Transform categoryName to category.name for nested filtering
  if (query.categoryName) {
    query["category.name"] = query.categoryName;
    delete query.categoryName;
  }

  // Set professional default sorting: newest first
  if (!query.sortBy) {
    query.sortBy = "createdAt";
    query.sortOrder = "desc";
  }

  const ideaQueryBuilder = new QueryBuilder(ideaModel, query, {
    searchableFields: ["title", "problemStatement", "description", "author.name", "feedback"],
    filterableFields: [
      "categoryId",
      "isPaid",
      "status",
      "authorId",
      "isFeatured",
      "category.name",
      "totalUpVotes",
      "price",
    ],
  });

  const result = await ideaQueryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ isDeleted: false, status: { not: IdeaStatus.DRAFT } }) // Exclude drafts for admin
    .include({
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        },
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
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          votes: true,
          favourites: true,
        },
      },
    })
    .execute();

  // Project fields with admin details
  result.data = result.data.map((idea: any) => ({
    id: idea.id,
    title: idea.title,
    problemStatement: idea.problemStatement,
    description: idea.description,
    image: idea.image,
    isPaid: idea.isPaid,
    price: idea.price,
    status: idea.status,
    feedback: idea.feedback, // Admin can see feedback
    isFeatured: idea.isFeatured,
    createdAt: formatToLocalTime(idea.createdAt),
    updatedAt: formatToLocalTime(idea.updatedAt),
    positiveRatio: idea.positiveRatio,
    totalUpVotes: idea.totalUpVotes,
    totalDownVotes: idea.totalDownVotes,
    author: {
      ...idea.author,
      profile: idea.author.profile ?? undefined,
    },
    category: idea.category,
    _count: idea._count,
  }));

  return result;
};

/**
 * Change idea status (DRAFT → UNDER_REVIEW → APPROVED/REJECTED)
 * Admin can set any valid status with optional feedback
 */
const changeIdeaStatus = async (
  ideaId: string,
  status: IdeaStatus,
  feedback?: string
) => {
  // Validate status transition
  if (
    status !== IdeaStatus.APPROVED &&
    status !== IdeaStatus.REJECTED &&
    status !== IdeaStatus.UNDER_REVIEW
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Invalid status. Admin can only set: APPROVED, REJECTED, or UNDER_REVIEW"
    );
  }

  // Check idea exists and is not deleted
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, isDeleted: false },
    select: {
      id: true,
      status: true,
      authorId: true,
    },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Prevent redundant status updates
  if (idea.status === status) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `Idea is already in ${status} status`
    );
  }

  // Use transaction to update status and handle cascading effects
  return await prisma.$transaction(async (tx) => {
    const updatedIdea = await tx.idea.update({
      where: { id: ideaId },
      data: {
        status,
        feedback: feedback || null,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // ✅ Clean up social interactions if idea is no longer APPROVED
    if (status !== IdeaStatus.APPROVED) {
      await tx.favourite.deleteMany({
        where: { ideaId: ideaId },
      });
      await tx.comment.deleteMany({
        where: { ideaId: ideaId },
      });
    }

    return updatedIdea;
  });
};

/**
 * Toggle idea featured status (promotion manager)
 * Admins can feature/unfeature ideas for homepage visibility
 */
const toggleIdeaFeatured = async (
  ideaId: string,
  isFeatured: boolean
) => {
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, isDeleted: false },
    select: {
      id: true,
      isFeatured: true,
      title: true,
    },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Prevent redundant updates
  if (idea.isFeatured === isFeatured) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `Idea is already ${isFeatured ? "featured" : "unfeatured"}`
    );
  }

  return prisma.idea.update({
    where: { id: ideaId },
    data: { isFeatured, updatedAt: new Date() },
  });
};

/**
 * Update idea as admin (Only admins can edit any idea)
 * Members can only edit their own non-published ideas
 */
const updateIdeaAsAdmin = async (
  ideaId: string,
  payload: IIdeaUpdate
) => {
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId, isDeleted: false },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  return prisma.idea.update({
    where: { id: ideaId },
    data: {
      ...payload,
      updatedAt: new Date(),
    },
  });
};

/**
 * Delete idea as admin (Hard or soft delete)
 * Performs cascading cleanup of all relationships
 */
const deleteIdeaAsAdmin = async (ideaId: string) => {
  const idea = await prisma.idea.findFirst({
    where: { id: ideaId },
  });

  if (!idea || idea.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Soft delete with cascading cleanup
  return await prisma.$transaction(async (tx) => {
    const deletedIdea = await tx.idea.update({
      where: { id: ideaId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Clear all associated data
    await tx.favourite.deleteMany({
      where: { ideaId: ideaId },
    });
    await tx.comment.deleteMany({
      where: { ideaId: ideaId },
    });
    await tx.vote.deleteMany({
      where: { ideaId: ideaId },
    });
    await tx.access.deleteMany({
      where: { ideaId: ideaId },
    });

    return deletedIdea;
  });
};

export const ideaAdminService = {
  getIdeaByIdAdmin,
  getAllIdeasAdmin,
  changeIdeaStatus,
  toggleIdeaFeatured,
  updateIdeaAsAdmin,
  deleteIdeaAsAdmin,
};
