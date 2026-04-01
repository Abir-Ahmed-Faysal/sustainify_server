import { z } from "zod";

const createBlog = z.object({
    title: z.string("Title is required"
    ),
    content: z.string( "Content is required"
    ),
    image: z.string().optional(),
    isPublished: z.boolean().optional(),
});

const updateBlog = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    image: z.string().optional(),
    isPublished: z.boolean().optional(),
});




export const BlogValidation = {
  createBlog,
  updateBlog,
};
