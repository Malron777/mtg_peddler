import { promotionTestFactory } from "@/src/domain/tcg/promotion.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getPromotionQuery } from "./get-promotion.query";

describe("getPromotionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve a promotion", async () => {
    await runWithTestDb(async (db: DB) => {
      const promotion = await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "Test Promotion",
        description: "A test promotion for testing purposes",
        discountPercentage: "15.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
        collectionId: "test-collection-id-1",
      });

      const result = await getPromotionQuery(db, promotion.id);

      expect(result.success).toBe(true);
      expect(result.promotion).toBeDefined();
      expect(result.promotion?.id).toBe(promotion.id);
      expect(result.promotion?.storeId).toBe("test-store-id-1");
      expect(result.promotion?.title).toBe("Test Promotion");
      expect(result.promotion?.description).toBe(
        "A test promotion for testing purposes"
      );
      expect(result.promotion?.discountPercentage).toBe("15.00");
      expect(result.promotion?.collectionId).toBe("test-collection-id-1");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when promotion is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-promotion-id";

      const result = await getPromotionQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.promotion).toBeUndefined();
      expect(result.error).toBe("Promotion not found");
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPromotionQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.promotion).toBeUndefined();
      expect(result.error).toBe("Promotion not found");
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getPromotionQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await getPromotionQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.promotion).toBeUndefined();
      expect(result.error).toBe("Promotion not found");
    });
  });

  it("should retrieve a promotion with high discount", async () => {
    await runWithTestDb(async (db: DB) => {
      const promotion = await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "High Discount Promotion",
        description: "A promotion with high discount",
        discountPercentage: "50.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
      });

      const result = await getPromotionQuery(db, promotion.id);

      expect(result.success).toBe(true);
      expect(result.promotion).toBeDefined();
      expect(result.promotion?.discountPercentage).toBe("50.00");
      expect(result.error).toBeUndefined();
    });
  });
});
