import { z } from "zod";

const toggleFavouriteZodSchema = z.object({
  ideaId: z.string("Idea ID is required"),
});

export const favouriteValidation = {
  toggleFavouriteZodSchema,
};
