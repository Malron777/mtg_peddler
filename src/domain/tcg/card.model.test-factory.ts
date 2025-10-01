import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema/tcg";
import { Card } from "./card.model";

export function buildOne(overrides: Partial<Card>): Card {
  return {
    ...overrides,
    scryfallId: crypto.randomUUID(),
    oracleId: crypto.randomUUID(),
    name: "Test Card",
    setCode: "TST",
    setName: "Test Set",
    imageUris: { normal: "https://example.com/image.jpg" },
    pricesLastUpdated: new Date(),
    cachedData: { test: "data" },
    lastFetchedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function insertOne(
  db: DB,
  overrides: Partial<Card>
): Promise<Card> {
  const card = buildOne(overrides);
  const result = await db.insert(cards).values(card).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<Card>
): Promise<Card> {
  const card = buildOne(overrides);
  const result = await db.insert(cards).values(card).returning();
  return result[0];
}
