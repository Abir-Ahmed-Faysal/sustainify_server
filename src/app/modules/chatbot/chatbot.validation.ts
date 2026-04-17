import z from "zod";

export const sendChatMessageValidation = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
  conversationId: z.string().optional(),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageValidation>;
