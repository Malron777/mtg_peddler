import { DB } from "@/src/infra/db/db";
import { dealItems } from "@/src/infra/db/schema/tcg";
import { DealItem } from "./deal-item.model";

export function buildOne(overrides: Partial<DealItem>): DealItem {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    dealId: crypto.randomUUID(),
    collectionItemId: crypto.randomUUID(),
    agreedPrice: "50.00",
    quantity: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<DealItem>
): Promise<DealItem> {
  const item = buildOne(overrides);
  const result = await db.insert(dealItems).values(item).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<DealItem>
): Promise<DealItem> {
  const item = buildOne(overrides);
  const result = await db.insert(dealItems).values(item).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<DealItem>
): Promise<DealItem> {
  // Import the required factories
  const { buildAndInsertOne: buildDeal } = await import(
    "./deal.model.test-factory"
  );
  const { buildAndInsertOne: buildCollectionItem } = await import(
    "./collection-item.model.test-factory"
  );

  // Create dependencies if not provided
  const dealId = overrides.dealId || (await buildDeal(db, {})).id;
  const collectionItemId =
    overrides.collectionItemId || (await buildCollectionItem(db, {})).id;

  // Build and insert with dependencies
  const item = buildOne({
    ...overrides,
    dealId,
    collectionItemId,
  });
  const result = await db.insert(dealItems).values(item).returning();
  return result[0];
}
