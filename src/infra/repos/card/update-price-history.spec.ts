import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updatePriceHistoryQuery } from "./update-price-history.query";

describe("updatePriceHistoryQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing price history entry", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistory =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const updateData = {
        id: priceHistory.id,
        cardScryfallId: priceHistory.cardScryfallId,
        price: "30.00",
        currency: "EUR",
        source: "scg" as const,
      };

      const result = await updatePriceHistoryQuery(db, updateData);

      expect(result.id).toBe(priceHistory.id);
      expect(result.price).toBe("30.00");
      expect(result.currency).toBe("EUR");
      expect(result.source).toBe("scg");
      expect(result.cardScryfallId).toBe(priceHistory.cardScryfallId); // Should remain unchanged
    });
  });

  it("should return undefined when trying to update non-existent price history", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-id",
        price: "30.00",
        currency: "EUR",
      };

      const result = await updatePriceHistoryQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistory =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const updateData = {
        id: priceHistory.id,
        price: "30.00",
      };

      const result = await updatePriceHistoryQuery(db, updateData);

      expect(result.id).toBe(priceHistory.id);
      expect(result.price).toBe("30.00");
      expect(result.currency).toBe(priceHistory.currency); // Should remain unchanged
      expect(result.source).toBe(priceHistory.source); // Should remain unchanged
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistory =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const updateData = {
        id: priceHistory.id,
      };

      const result = await updatePriceHistoryQuery(db, updateData);

      expect(result.id).toBe(priceHistory.id);
      expect(result.price).toBe(priceHistory.price); // Should remain unchanged
      expect(result.currency).toBe(priceHistory.currency); // Should remain unchanged
      expect(result.source).toBe(priceHistory.source); // Should remain unchanged
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistory =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const updateData = {
        id: priceHistory.id,
        price: "invalid-price", // Invalid price format
        currency: "", // Empty currency
      };

      await expect(updatePriceHistoryQuery(db, updateData)).rejects.toThrow();
    });
  });
});
