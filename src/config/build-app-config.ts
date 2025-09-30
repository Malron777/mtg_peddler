import { config } from "dotenv";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { AppConfig } from "./app-config";
import { envSchema } from "./env.schema";

export function buildAppConfig(): AppConfig {
  try {
    config();
    const env = envSchema.parse(process.env);
    return {
      DATABASE_URL: env.DATABASE_URL,
      TEST_DATABASE_URL: env.TEST_DATABASE_URL,
      BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: env.BETTER_AUTH_URL,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      throw new Error(
        `\n\nOne or more env-vars are invalid. Check your .env file. \n${validationError.message}\n\n`
      );
    }
    throw error;
  }
}
