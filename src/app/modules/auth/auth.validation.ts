import { z } from "zod";

const registerValidationSchema = z.object({
  name: z.string("Name is required").min(3, "Name must be at least 3 characters long").max(40, "Name must be at most 30 characters long"),
  email: z
    .string("Email is required")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid email address"),
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const loginValidationSchema = z.object({
  email: z
    .string("Email is required")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid email address"),
  password: z.string("Password is required"),
});

export const authValidation = {
  registerValidationSchema,
  loginValidationSchema,
};
