import { z } from "zod";

const createCommentSchema = z.object({
  content: z
    .string("Content is required")
    .min(1, "Content cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters"),
  ideaId: z.string("Idea ID is required").uuid("Invalid Idea ID format"),
  parentId: z.string().uuid("Invalid Parent ID format").optional(),
});

const updateCommentSchema = z.object({
  content: z
    .string("Content is required")
    .min(1, "Content cannot be empty")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

export const commentValidation = {
  createCommentSchema,
  updateCommentSchema,
};
