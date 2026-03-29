import { z } from "zod";
import dotenv from "dotenv";
import path from "path";


if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(process.cwd(), ".env") });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string(),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  FRONTEND_URL: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  EMAIL_SENDER_SMTP_USER: z.string(),
  EMAIL_SENDER_SMTP_PASS: z.string(),
  EMAIL_SENDER_SMTP_HOST: z.string(),
  EMAIL_SENDER_SMTP_PORT: z.string(),
  EMAIL_SENDER_SMTP_FROM: z.string(),
});

export const envVars = envSchema.parse(process.env);