import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema/tcg";
import { CollectionItem } from "./collection-item.model";

export function buildOne(overrides: Partial<CollectionItem>): CollectionItem {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    collectionId: crypto.randomUUID(),
    cardScryfallId: crypto.randomUUID(),
    quantity: 1,
    condition: "NM",
    language: "en",
    isFoil: false,
    listingType: "sale",
    customPrice: "10.00",
    priceSource: "tcg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<CollectionItem>
): Promise<CollectionItem> {
  const item = buildOne(overrides);
  const result = await db.insert(collectionItems).values(item).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<CollectionItem>
): Promise<CollectionItem> {
  const item = buildOne(overrides);
  const result = await db.insert(collectionItems).values(item).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<CollectionItem>
): Promise<CollectionItem> {
  // Import the required factories
  const { buildAndInsertOne: buildCollection } = await import(
    "./collection.model.test-factory"
  );
  const { buildAndInsertOne: buildCard } = await import(
    "./card.model.test-factory"
  );

  // Create dependencies if not provided
  const collectionId =
    overrides.collectionId || (await buildCollection(db, {})).id;
  const cardScryfallId =
    overrides.cardScryfallId || (await buildCard(db, {})).scryfallId;

  // Build and insert with dependencies
  const item = buildOne({
    ...overrides,
    collectionId,
    cardScryfallId,
  });
  const result = await db.insert(collectionItems).values(item).returning();
  return result[0];
}
