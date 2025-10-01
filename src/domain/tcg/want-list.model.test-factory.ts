import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema/tcg";
import { WantList } from "./want-list.model";

export function buildOne(overrides: Partial<WantList>): WantList {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    name: "Test Want List",
    description: "A test want list for testing purposes",
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<WantList>
): Promise<WantList> {
  const wantList = buildOne(overrides);
  const result = await db.insert(wantLists).values(wantList).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<WantList>
): Promise<WantList> {
  const wantList = buildOne(overrides);
  const result = await db.insert(wantLists).values(wantList).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<WantList>
): Promise<WantList> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "../auth/user.model.test-factory"
  );

  // Create dependencies if not provided
  const userId = overrides.userId || (await buildUser(db, {})).id;

  // Build and insert with dependencies
  const wantList = buildOne({
    ...overrides,
    userId,
  });
  const result = await db.insert(wantLists).values(wantList).returning();
  return result[0];
}
