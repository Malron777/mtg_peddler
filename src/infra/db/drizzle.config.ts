import { dependencies } from "@/src/config/dependencies";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/infra/db/drizzle",
  schema: "./src/infra/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dependencies.config.DATABASE_URL,
  },
});
