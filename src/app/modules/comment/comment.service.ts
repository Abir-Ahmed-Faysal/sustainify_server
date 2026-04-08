import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { Role } from "../../../generated/prisma";
import { ICreateComment } from "./comment.interface";

const createComment = async (user: IUserRequest, payload: ICreateComment) => {
  // Check if idea exists
  const idea = await prisma.idea.findUnique({ where: { id: payload.ideaId } });
  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // For paid ideas, check if user has access (is author or has paid)
  if (idea.isPaid && idea.authorId !== user.id) {
    const accessRecord = await prisma.access.findUnique({
      where: {
        userId_ideaId: {
          userId: user.id,
          ideaId: payload.ideaId,
        },
      },
    });

    if (!accessRecord) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You don't have access to this paid idea. Please purchase access first."
      );
    }
  }

  // Check parent comment if parentId is provided
  if (payload.parentId) {
    const parentComment = await prisma.comment.findUnique({ where: { id: payload.parentId } });
    if (!parentComment) {
      throw new AppError(StatusCodes.NOT_FOUND, "Parent comment not found");
    }
  }

  const newComment = await prisma.comment.create({
    data: {
      content: payload.content,
      userId: user.id,
      ideaId: payload.ideaId,
      parentId: payload.parentId || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      }
    }
  });

  return newComment;
};

const getCommentsByIdea = async (ideaId: string) => {
  const comments = await prisma.comment.findMany({
    where: { ideaId, isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      },
      replies: {
        where: { isDeleted: false },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  // Filter out replies from the top level, only return parent comments
  // The replies will be nested inside their respective parents because of the include
  return comments.filter(c => !c.parentId);
};

const updateComment = async (
  commentId: string,
  user: IUserRequest,
  payload: { content: string }
) => {

  // ✅ find comment (correct way)
  const existingComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      isDeleted: false,
    },
  });

  // ❌ not found
  if (!existingComment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Comment not found"
    );
  }

  // ❌ not owner
  if (existingComment.userId !== user.id) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not allowed to update this comment"
    );
  }

  // ✅ optional: empty content check
  if (!payload.content || payload.content.trim() === "") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Content cannot be empty"
    );
  }

  // ✅ update
  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: payload.content },
  });

  return updatedComment;
};

const deleteComment = async (
  commentId: string,
  user: IUserRequest
) => {

  const existingComment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      isDeleted: false,
    },
    include: {
      idea: {
        select: {
          authorId: true,
        },
      },
    },
  });

  // ❌ not found
  if (!existingComment) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Comment not found"
    );
  }

  // ✅ permission check
  const isCommentOwner = existingComment.userId === user.id;
  const isIdeaOwner = existingComment.idea.authorId === user.id;
  const isAdmin = user.role === Role.ADMIN;

  if (!isCommentOwner && !isIdeaOwner && !isAdmin) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this comment"
    );
  }

  // ✅ soft delete
  return prisma.comment.update({
    where: { id: commentId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};
export const commentService = {
  createComment,
  getCommentsByIdea,
  updateComment,
  deleteComment,
};
