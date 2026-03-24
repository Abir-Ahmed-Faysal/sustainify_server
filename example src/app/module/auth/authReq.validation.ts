import { z } from "zod";

export const ILoginZodSchema = z.object({
  email: z
    .string()
    .min(1, "email is required"),

  password: z
    .string("must be string")
    
});



export type ILogin= z.infer<typeof ILoginZodSchema>