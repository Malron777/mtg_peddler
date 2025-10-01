import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema/tcg";
import { Card } from "./card.model";

export const cardTestFactory = {
  buildOne(overrides: Partial<Card>): Card {
    return {
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
      ...overrides,
    };
  },

  async insertOne(db: DB, overrides: Partial<Card>): Promise<Card> {
    const card = this.buildOne(overrides);
    const result = await db.insert(cards).values(card).returning();
    return result[0];
  },

  async buildAndInsertOne(db: DB, overrides: Partial<Card>): Promise<Card> {
    const card = this.buildOne(overrides);
    const result = await db.insert(cards).values(card).returning();
    return result[0];
  },
};
