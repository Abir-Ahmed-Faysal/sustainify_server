import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// শুধু dev/test-এ dotenv load হবে
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(process.cwd(), ".env") });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string(),
  DATABASE_URL: z.string(),
});

export const envVars = envSchema.parse(process.env);