import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getPriceHistoryForCardQuery } from "./get-price-history-for-card.query";

describe("getPriceHistoryForCardQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all price history for a specific card", async () => {
    await runWithTestDb(async (db: DB) => {
      const cardScryfallId = "test-scryfall-id-1";

      // Create multiple price history entries for the same card
      const priceHistory1 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          cardScryfallId,
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const priceHistory2 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          cardScryfallId,
          source: "tcg",
          price: "30.00",
          currency: "USD",
          fetchedAt: new Date("2023-01-02"),
        });

      const result = await getPriceHistoryForCardQuery(db, cardScryfallId);

      expect(result.priceHistory).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.priceHistory.some((ph) => ph.id === priceHistory1.id)).toBe(
        true
      );
      expect(result.priceHistory.some((ph) => ph.id === priceHistory2.id)).toBe(
        true
      );
    });
  });

  it("should return empty result when card has no price history", async () => {
    await runWithTestDb(async (db: DB) => {
      const cardScryfallId = "card-with-no-price-history";

      const result = await getPriceHistoryForCardQuery(db, cardScryfallId);

      expect(result.priceHistory).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty result for non-existent card", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPriceHistoryForCardQuery(
        db,
        "non-existent-card-id"
      );

      expect(result.priceHistory).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      const cardScryfallId = "test-scryfall-id-pagination";

      // Create multiple price history entries
      for (let i = 1; i <= 5; i++) {
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          cardScryfallId,
          source: "tcg",
          price: `${20 + i}.00`,
          currency: "USD",
          fetchedAt: new Date(`2023-01-${i.toString().padStart(2, "0")}`),
        });
      }

      const result = await getPriceHistoryForCardQuery(db, cardScryfallId, {
        page: 2,
        pageSize: 2,
      });

      expect(result.priceHistory).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order price history by fetchedAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const cardScryfallId = "test-scryfall-id-ordering";

      const priceHistory1 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          cardScryfallId,
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const priceHistory2 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          cardScryfallId,
          source: "tcg",
          price: "30.00",
          currency: "USD",
          fetchedAt: new Date("2023-01-02"),
        });

      const result = await getPriceHistoryForCardQuery(db, cardScryfallId);

      expect(result.priceHistory).toHaveLength(2);
      expect(result.priceHistory[0].id).toBe(priceHistory2.id); // Most recent first
      expect(result.priceHistory[1].id).toBe(priceHistory1.id);
    });
  });

  it("should handle empty cardScryfallId gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPriceHistoryForCardQuery(db, "");

      expect(result.priceHistory).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
