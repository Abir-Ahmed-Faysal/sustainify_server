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

  attachments: z.array(z.string().url()).optional(),

  categoryId: z.string().uuid({ message: "Invalid category ID" }),
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

  attachments: z.array(z.string().url()).optional(),

  categoryId: z.string().uuid({ message: "Invalid category ID" }).optional(),

});

export const updateIdeaStatus= z.object({
  status:z.enum([IdeaStatus.UNDER_REVIEW,IdeaStatus.DRAFT],"only change the status as under review or draft")
})



export const toggleIsFeatured= z.object({
  isFeatured: z.boolean()
})


export const updateIdeaStatusByAdmin= z.object({
  status: z.enum([IdeaStatus.APPROVED,IdeaStatus.REJECTED,IdeaStatus.UNDER_REVIEW]),
  feedback: z.string().optional(),
}).refine((data) => {
  if (data.status === IdeaStatus.REJECTED) {
    return !!data.feedback && data.feedback.trim() !== "";
  }
  return true;
}, {
  message: "Feedback is required when rejecting an idea",
});



export type IIdeaUpdate = z.infer<typeof updateIdeaZodSchema>;
export type IIdeaCreate = z.infer<typeof createIdeaZodSchema>;




export const ideaValidation = {
  createIdeaZodSchema,
  updateIdeaZodSchema,
};