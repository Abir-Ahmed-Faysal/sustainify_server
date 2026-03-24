import { z } from "zod";

const updateProfileZodSchema = z.object({
    avatar: z.url({ message: "Invalid avatar URL" }).optional(),
    bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
    address: z.string().max(255, "Address must be at most 255 characters").optional(),
});

export const profileValidation = {
    updateProfileZodSchema,
};
