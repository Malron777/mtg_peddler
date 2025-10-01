import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema/tcg";
import { Collection } from "./collection.model";

export function buildOne(overrides: Partial<Collection>): Collection {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    name: "Test Collection",
    description: "A test collection for testing purposes",
    isPublic: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<Collection>
): Promise<Collection> {
  const collection = buildOne(overrides);
  const result = await db.insert(collections).values(collection).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<Collection>
): Promise<Collection> {
  const collection = buildOne(overrides);
  const result = await db.insert(collections).values(collection).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<Collection>
): Promise<Collection> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "../auth/user.model.test-factory"
  );

  // Create dependencies if not provided
  const userId = overrides.userId || (await buildUser(db, {})).id;

  // Build and insert with dependencies
  const collection = buildOne({
    ...overrides,
    userId,
  });
  const result = await db.insert(collections).values(collection).returning();
  return result[0];
}
