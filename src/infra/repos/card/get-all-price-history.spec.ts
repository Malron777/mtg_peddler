import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllPriceHistoryQuery } from "./get-all-price-history.query";

describe("getAllPriceHistoryQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all price history with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create multiple price history entries
      const priceHistory1 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const priceHistory2 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "30.00",
          currency: "USD",
          fetchedAt: new Date("2023-01-02"),
        });

      const result = await getAllPriceHistoryQuery(db);

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

  it("should return empty result when no price history exists", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllPriceHistoryQuery(db);

      expect(result.priceHistory).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create multiple price history entries
      for (let i = 1; i <= 5; i++) {
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: `${20 + i}.00`,
          currency: "USD",
          fetchedAt: new Date(`2023-01-${i.toString().padStart(2, "0")}`),
        });
      }

      const result = await getAllPriceHistoryQuery(db, {
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

  it("should handle invalid pagination options gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
        source: "tcg",
        price: "25.50",
        currency: "USD",
        fetchedAt: new Date("2023-01-01"),
      });

      const result = await getAllPriceHistoryQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.priceHistory).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order price history by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistory1 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
          createdAt: new Date("2023-01-01"),
        });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const priceHistory2 =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "30.00",
          currency: "USD",
          fetchedAt: new Date("2023-01-02"),
          createdAt: new Date("2023-01-02"),
        });

      const result = await getAllPriceHistoryQuery(db);

      expect(result.priceHistory).toHaveLength(2);
      expect(result.priceHistory[0].id).toBe(priceHistory2.id); // Most recent first
      expect(result.priceHistory[1].id).toBe(priceHistory1.id);
    });
  });

  it("should handle large page sizes gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a few price history entries
      for (let i = 1; i <= 3; i++) {
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: `${20 + i}.00`,
          currency: "USD",
          fetchedAt: new Date(`2023-01-${i.toString().padStart(2, "0")}`),
        });
      }

      const result = await getAllPriceHistoryQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.priceHistory).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
