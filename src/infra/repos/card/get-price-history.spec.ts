import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getPriceHistoryQuery } from "./get-price-history.query";

describe("getPriceHistoryQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing price history entry", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistory =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const result = await getPriceHistoryQuery(db, priceHistory.id);

      expect(result.success).toBe(true);
      expect(result.priceHistory).toBeDefined();
      expect(result.priceHistory?.id).toBe(priceHistory.id);
      expect(result.priceHistory?.source).toBe("tcg");
      expect(result.priceHistory?.price).toBe("25.50");
      expect(result.priceHistory?.currency).toBe("USD");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when price history is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-id";

      const result = await getPriceHistoryQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Price history not found");
      expect(result.priceHistory).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPriceHistoryQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Price history not found");
      expect(result.priceHistory).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPriceHistoryQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.priceHistory).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getPriceHistoryQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Price history not found");
      expect(result.priceHistory).toBeUndefined();
    });
  });
});
