import { z } from "zod";

const createCheckoutSessionZodSchema = z.object({
  ideaId: z.uuid("Invalid idea id")
});

export const paymentValidation = {
  createCheckoutSessionZodSchema,
};
