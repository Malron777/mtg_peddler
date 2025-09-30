import { buildAppConfig } from "@/src/config/build-app-config";
import { TransactionRollbackError } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { buildDb, DB } from "./src/infra/db/db";

export const migrateTestDb = async () => {
  const config = buildAppConfig();
  const connectionString = config.TEST_DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  try {
    const db = drizzle(pool);
    const migrationMetadata = readMigrationFiles({
      migrationsSchema: "./src/infra/db/schema/index.ts",
      migrationsFolder: "./src/infra/db/drizzle",
    });
    for (const migration of migrationMetadata) {
      for (const migrationSql of migration.sql) {
        try {
          await db.execute(migrationSql);
        } catch (e) {}
      }
    }
  } finally {
    await pool.end();
  }
};

export async function configureTestDb() {
  const config = buildAppConfig();
  const connectionString = config.TEST_DATABASE_URL;
  return buildDb(connectionString);
}

export const buildRunWithTestDb = async () => {
  const db = await configureTestDb();
  return async function runWithTestDb(
    fn: (ephemeralDb: DB) => Promise<unknown>
  ) {
    try {
      await db.transaction(async (trx) => {
        await fn(trx as unknown as DB);
        trx.rollback();
      });
    } catch (e) {
      if (e instanceof TransactionRollbackError) return;
      throw e;
    }
  };
};

export type RunWithTestDb = Awaited<ReturnType<typeof buildRunWithTestDb>>;
