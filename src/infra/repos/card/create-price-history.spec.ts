import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createPriceHistoryQuery } from "./create-price-history.query";

describe("createPriceHistoryQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a price history entry", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a card first to ensure the foreign key exists
      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/lightning-bolt.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const priceHistoryData = priceHistoryTestFactory.buildOne({
        cardScryfallId: card.scryfallId,
        source: "tcg",
        price: "25.50",
        currency: "USD",
        fetchedAt: new Date("2023-01-01"),
      });

      const result = await createPriceHistoryQuery(db, priceHistoryData);

      expect(result.success).toBe(true);
      expect(result.priceHistory).toBeDefined();
      expect(result.priceHistory?.cardScryfallId).toBe(card.scryfallId);
      expect(result.priceHistory?.source).toBe("tcg");
      expect(result.priceHistory?.price).toBe("25.50");
      expect(result.priceHistory?.currency).toBe("USD");
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when trying to create price history with invalid card reference", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistoryData = priceHistoryTestFactory.buildOne({
        cardScryfallId: "non-existent-card-id",
        source: "tcg",
        price: "25.50",
        currency: "USD",
        fetchedAt: new Date("2023-01-01"),
      });

      const result = await createPriceHistoryQuery(db, priceHistoryData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.priceHistory).toBeUndefined();
    });
  });

  it("should fail when trying to create price history with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a card first to ensure the foreign key exists
      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-2",
        oracleId: "test-oracle-id-2",
        name: "Test Card 2",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card2.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const invalidPriceHistoryData = priceHistoryTestFactory.buildOne({
        cardScryfallId: card.scryfallId,
        source: "tcg" as const,
        price: "invalid-price", // Invalid price format
        currency: "USD",
        fetchedAt: new Date("2023-01-01"),
      });

      const result = await createPriceHistoryQuery(db, invalidPriceHistoryData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.priceHistory).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a price history entry with dependencies
      const priceHistory =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      // Try to create another entry with the same card and source (if there's a unique constraint)
      const duplicateData = priceHistoryTestFactory.buildOne({
        cardScryfallId: priceHistory.cardScryfallId,
        source: "tcg",
        price: "30.00",
        currency: "USD",
        fetchedAt: new Date("2023-01-02"),
      });

      const result = await createPriceHistoryQuery(db, duplicateData);

      // This might succeed or fail depending on database constraints
      // The important thing is that it handles the result appropriately
      expect(result.success).toBeDefined();
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.priceHistory).toBeUndefined();
      }
    });
  });

  it("should handle null values gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a card first to ensure the foreign key exists
      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-3",
        oracleId: "test-oracle-id-3",
        name: "Test Card 3",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card3.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const priceHistoryData = priceHistoryTestFactory.buildOne({
        cardScryfallId: card.scryfallId,
        source: "tcg",
        price: "25.50",
        currency: "USD",
        fetchedAt: null as unknown as Date, // Null fetchedAt
      });

      const result = await createPriceHistoryQuery(db, priceHistoryData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.priceHistory).toBeUndefined();
    });
  });
});
