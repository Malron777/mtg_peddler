import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema/tcg";
import { Promotion } from "./promotion.model";

export function buildOne(overrides: Partial<Promotion>): Promotion {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    storeId: crypto.randomUUID(),
    title: "Test Promotion",
    description: "A test promotion for testing purposes",
    discountPercentage: "10.00",
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    collectionId: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<Promotion>
): Promise<Promotion> {
  const promotion = buildOne(overrides);
  const result = await db.insert(promotions).values(promotion).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<Promotion>
): Promise<Promotion> {
  const promotion = buildOne(overrides);
  const result = await db.insert(promotions).values(promotion).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<Promotion>
): Promise<Promotion> {
  // Import the required factories
  const { buildAndInsertOne: buildStore } = await import(
    "../auth/stores.model.test-factory"
  );

  // Create dependencies if not provided
  const storeId = overrides.storeId || (await buildStore(db, {})).id;

  // Optional dependencies
  const collectionId = overrides.collectionId;

  // Build and insert with dependencies
  const promotion = buildOne({
    ...overrides,
    storeId,
    collectionId,
  });
  const result = await db.insert(promotions).values(promotion).returning();
  return result[0];
}
