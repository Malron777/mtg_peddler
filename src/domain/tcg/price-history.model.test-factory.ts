import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema/tcg";
import { PriceHistory } from "./price-history.model";

export function buildOne(overrides: Partial<PriceHistory>): PriceHistory {
  return {
    ...overrides,
    id: crypto.randomUUID(),
    cardScryfallId: crypto.randomUUID(),
    source: "tcg",
    price: "25.50",
    currency: "USD",
    fetchedAt: new Date(),
    createdAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<PriceHistory>
): Promise<PriceHistory> {
  const priceHistoryItem = buildOne(overrides);
  const result = await db
    .insert(priceHistory)
    .values(priceHistoryItem)
    .returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<PriceHistory>
): Promise<PriceHistory> {
  const priceHistoryItem = buildOne(overrides);
  const result = await db
    .insert(priceHistory)
    .values(priceHistoryItem)
    .returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<PriceHistory>
): Promise<PriceHistory> {
  // Import the required factories
  const { buildAndInsertOne: buildCard } = await import(
    "./card.model.test-factory"
  );

  // Create dependencies if not provided
  const cardScryfallId =
    overrides.cardScryfallId || (await buildCard(db, {})).scryfallId;

  // Build and insert with dependencies
  const priceHistoryItem = buildOne({
    ...overrides,
    cardScryfallId,
  });
  const result = await db
    .insert(priceHistory)
    .values(priceHistoryItem)
    .returning();
  return result[0];
}
