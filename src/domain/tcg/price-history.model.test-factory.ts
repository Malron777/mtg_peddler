import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema/tcg";
import { cardTestFactory } from "./card.model.test-factory";
import { PriceHistory } from "./price-history.model";

export const priceHistoryTestFactory = {
  buildOne(overrides: Partial<PriceHistory>): PriceHistory {
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
  },

  async insertOne(
    db: DB,
    overrides: Partial<PriceHistory>
  ): Promise<PriceHistory> {
    const priceHistoryItem = this.buildOne(overrides);
    const result = await db
      .insert(priceHistory)
      .values(priceHistoryItem)
      .returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<PriceHistory>
  ): Promise<PriceHistory> {
    const priceHistoryItem = this.buildOne(overrides);
    const result = await db
      .insert(priceHistory)
      .values(priceHistoryItem)
      .returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<PriceHistory>
  ): Promise<PriceHistory> {
    // Create dependencies if not provided
    const cardScryfallId =
      overrides.cardScryfallId ||
      (await cardTestFactory.buildAndInsertOne(db, {})).scryfallId;

    // Build and insert with dependencies
    const priceHistoryItem = this.buildOne({
      ...overrides,
      cardScryfallId,
    });
    const result = await db
      .insert(priceHistory)
      .values(priceHistoryItem)
      .returning();
    return result[0];
  },
};
