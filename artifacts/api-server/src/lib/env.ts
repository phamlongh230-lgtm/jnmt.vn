import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().regex(/^\d+$/, "PORT must be a positive integer").transform(Number),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid postgres URL"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters")
    .optional(),
  GROQ_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

if (parsed.data.NODE_ENV === "production" && !parsed.data.SESSION_SECRET) {
  console.error("SESSION_SECRET is required in production");
  process.exit(1);
}

export const env = parsed.data;
