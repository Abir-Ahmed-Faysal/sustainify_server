import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string("Content is required").min(1, "Content cannot be empty"),
  ideaId: z.string("Idea ID is required"),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  content: z.string("Content is required").min(1, "Content cannot be empty"),
});

export const commentValidation = {
  createCommentSchema,
  updateCommentSchema,
};
