import { z } from "zod";
import { IdeaStatus } from "../../../generated/prisma";

export const createIdeaZodSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" }),

  problemStatement: z
    .string()
    .min(10, { message: "Problem statement must be at least 10 characters" }),

  solution: z
    .string()
    .min(10, { message: "Solution must be at least 10 characters" }),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),

  image: z.url({ message: "Image must be a valid URL" }).optional(),

  price: z.coerce.number().positive({ message: "Price must be greater than 0" }).optional(),

  categoryId: z.uuid({ message: "Invalid category ID" }),
  status:z.enum([IdeaStatus.DRAFT],'only draft status granted').optional()
});


export const updateIdeaZodSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .optional(),

  problemStatement: z
    .string()
    .min(10, { message: "Problem statement must be at least 10 characters" })
    .optional(),

  solution: z
    .string()
    .min(10, { message: "Solution must be at least 10 characters" })
    .optional(),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .optional(),

  image: z.url({ message: "Image must be a valid URL" }).optional(),

  price: z.coerce.number().positive({ message: "Price must be greater than 0" }).optional(),

  categoryId: z.uuid({ message: "Invalid category ID" }).optional(),

  status: z
    .enum(["DRAFT", "UNDER_REVIEW", "APPROVED", "REJECTED"])
    .optional(),

  feedback: z.string().optional(),

  isFeatured: z.boolean().optional(),
});

export type IIdeaUpdate = z.infer<typeof updateIdeaZodSchema>;
export type IIdeaCreate = z.infer<typeof createIdeaZodSchema>;




export const ideaValidation = {
  createIdeaZodSchema,
  updateIdeaZodSchema,
};