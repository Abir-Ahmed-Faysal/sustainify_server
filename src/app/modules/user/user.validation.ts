import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  address: z.string().optional(),
});

const toggleUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const userValidation = {
  updateProfileSchema,
  toggleUserStatusSchema,
};
