import { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import z from "zod";
import * as schema from "./schema/index";

export function buildDb(connectionString: string) {
  z.string()
    .url("DB connection string is not a valid URL")
    .parse(connectionString);
  return drizzle(connectionString, { schema });
}

export type RealDB = ReturnType<typeof buildDb>;

export type Trx = PgTransaction<
  NodePgQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export type DB = RealDB | Trx;
