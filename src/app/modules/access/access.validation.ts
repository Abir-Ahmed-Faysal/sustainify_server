import { z } from "zod";

export const checkMyAccessSchema = z.object({
    params: z.object({
        ideaId: z.string().uuid({ message: "Invalid ideaId format" }),
    }),
});

export const getMyPursuedIdeasSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.string().optional(),
    }).strict().optional(),
});

export type TCheckMyAccessSchema = z.infer<typeof checkMyAccessSchema>;
export type TGetMyPursuedIdeasSchema = z.infer<typeof getMyPursuedIdeasSchema>;
