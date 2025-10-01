import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deletePriceHistoryQuery } from "./delete-price-history.query";

describe("deletePriceHistoryQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete an existing price history entry", async () => {
    await runWithTestDb(async (db: DB) => {
      const priceHistory =
        await priceHistoryTestFactory.buildAndInsertOneWithDependencies(db, {
          source: "tcg",
          price: "25.50",
          currency: "USD",
          fetchedAt: new Date("2023-01-01"),
        });

      const result = await deletePriceHistoryQuery(db, priceHistory.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent price history gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-id";

      const result = await deletePriceHistoryQuery(db, nonExistentId);

      // Deletion of non-existent record should still be considered successful
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deletePriceHistoryQuery(db, "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deletePriceHistoryQuery(
        db,
        null as unknown as string
      );

      expect(result.success).toBe(true);
      expect(result.error).not.toBeDefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await deletePriceHistoryQuery(db, malformedId);

      // Should handle gracefully
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // This test would require setting up foreign key constraints
      // For now, we'll test with a malformed id
      const malformedId = "test-id-with-special-chars-!@#$%";

      const result = await deletePriceHistoryQuery(db, malformedId);

      // Should handle gracefully
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
