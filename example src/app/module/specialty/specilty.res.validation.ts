import z from "zod";

const createSpecialtyZodSchema = z.object({
    title: z.string("title is required").min(3, "title must be at least 3 characters long"),
    description: z.string("description is required").min(3, "description must be at least 3 characters long").optional(),
})


export const specialtyValidation = createSpecialtyZodSchema