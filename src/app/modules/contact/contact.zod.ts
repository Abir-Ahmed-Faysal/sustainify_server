import z from "zod";

/**
 * Schema for creating a contact message
 */
export const createContactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must not exceed 200 characters")
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(5000, "Message must not exceed 5000 characters")
    .trim(),
});

export type CreateContactType = z.infer<typeof createContactSchema>;
