import { z } from "zod";

const createCategoryZodSchema = z.object({
    name: z.string( "Name is required" ).min(3,"Name must be at least 3 characters long"),
    image: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const updateCategoryZodSchema = z.object({
    name: z.string( "Name is required" ).min(3,"Name must be at least 3 characters long").optional(),
    image: z.string().url("Invalid URL").optional().or(z.literal(""))
});



export const categoryValidation = {
    createCategoryZodSchema,
    updateCategoryZodSchema,
};