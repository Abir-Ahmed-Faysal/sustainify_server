import { z } from "zod";

const updateProfileZodSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters").optional(),
        avatar: z.url({ message: "Invalid avatar URL" }).optional(),
        bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
        address: z.string().max(255, "Address must be at most 255 characters").optional(),
        themePreference: z.enum(["light", "dark"]).optional(),
    }),
});

const updateThemeZodSchema = z.object({
    body: z.object({
        themePreference: z.enum(["light", "dark"], {
            errorMap: () => ({ message: "Theme must be 'light' or 'dark'" }),
        }),
    }),
});

export const profileValidation = {
    updateProfileZodSchema,
    updateThemeZodSchema,
};
