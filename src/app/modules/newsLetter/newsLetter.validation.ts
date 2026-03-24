import { z } from "zod";

const subscribeZodSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const newsLetterValidation = {
  subscribeZodSchema,
};
