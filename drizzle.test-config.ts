import { buildAppConfig } from "@/src/config/build-app-config";
import { defineConfig } from "drizzle-kit";

const config = buildAppConfig();

// const _db = new Pool({
//   connectionString: config.TEST_DATABASE_URL,
// });

export default defineConfig({
  out: "./src/infra/db/drizzle",
  schema: "./src/infra/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: config.TEST_DATABASE_URL },
});
