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
          email: true
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

const updateComment = async (commentId: string, userId: string, payload: { content: string }) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "Comment not found");
  }

  if (comment.userId !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to update this comment");
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: payload.content }
  });

  return updatedComment;
};

const deleteComment = async (commentId: string, userId: string, userRole: Role) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });

  if (!comment || comment.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "Comment not found");
  }

  // Only the author or an ADMIN can delete the comment
  if (comment.userId !== userId && userRole !== Role.ADMIN) {
    throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to delete this comment");
  }

  const deletedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      isDeleted: true,
      deletedAt: new Date()
    }
  });

  return deletedComment;
};

export const commentService = {
  createComment,
  getCommentsByIdea,
  updateComment,
  deleteComment,
};
