import { promotionTestFactory } from "@/src/domain/tcg/promotion.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deletePromotionQuery } from "./delete-promotion.query";

describe("deletePromotionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete a promotion", async () => {
    await runWithTestDb(async (db: DB) => {
      const promotion = await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "Test Promotion",
        description: "A test promotion",
        discountPercentage: "10.00",
      });

      const result = await deletePromotionQuery(db, promotion.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent promotion gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-promotion-id";

      const result = await deletePromotionQuery(db, nonExistentId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deletePromotionQuery(db, "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deletePromotionQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await deletePromotionQuery(db, malformedId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await deletePromotionQuery(
        invalidDb as unknown as DB,
        "test-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
