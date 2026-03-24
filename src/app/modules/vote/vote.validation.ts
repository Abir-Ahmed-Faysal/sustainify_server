import { z } from "zod";
import { VoteType } from "../../../generated/prisma";

const voteZodSchema = z.object({
  ideaId: z.uuid("Invalid Idea ID format"),

  type: z.enum([VoteType.UP, VoteType.DOWN], "Vote type must be UP or DOWN"),
});

export const voteValidation = {
  voteZodSchema,
};
