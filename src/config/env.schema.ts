import z from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  TEST_DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;
