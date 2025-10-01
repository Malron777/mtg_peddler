import { promotionTestFactory } from "@/src/domain/tcg/promotion.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { promotions } from "../../db/schema/tcg";
import { createPromotionQuery } from "./create-promotion.query";

describe("createPromotionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a promotion", async () => {
    await runWithTestDb(async (db: DB) => {
      const promotionData = promotionTestFactory.buildOne({
        storeId: "test-store-id-1",
        title: "Test Promotion",
        description: "A test promotion for testing purposes",
        discountPercentage: "15.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
        collectionId: "test-collection-id-1",
      });

      const result = await createPromotionQuery(db, promotionData);

      expect(result.success).toBe(true);
      expect(result.promotion).toBeDefined();
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

  it("should fail when creating a promotion with duplicate id", async () => {
    await runWithTestDb(async (db: DB) => {
      const duplicateId = "duplicate-promotion-id";
      const promotionData1 = promotionTestFactory.buildOne({
        id: duplicateId,
        storeId: "test-store-id-1",
        title: "First Promotion",
      });

      const promotionData2 = promotionTestFactory.buildOne({
        id: duplicateId,
        storeId: "test-store-id-2",
        title: "Second Promotion",
      });

      // Insert first promotion
      await db.insert(promotions).values(promotionData1);

      // Try to create second promotion with same id
      const result = await createPromotionQuery(db, promotionData2);

      expect(result.success).toBe(false);
      expect(result.promotion).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should fail when creating a promotion with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidPromotionData = {
        id: "test-promotion-id",
        storeId: null as unknown as string,
        title: "",
        description: null as unknown as string,
        discountPercentage: "-10.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2022-12-31"), // End date before start date
        collectionId: null as unknown as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createPromotionQuery(db, invalidPromotionData);

      expect(result.success).toBe(false);
      expect(result.promotion).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const promotionData = promotionTestFactory.buildOne({
        storeId: "test-store-id-1",
        title: "Test Promotion",
      });

      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await createPromotionQuery(
        invalidDb as unknown as DB,
        promotionData
      );

      expect(result.success).toBe(false);
      expect(result.promotion).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should create a promotion with minimal required fields", async () => {
    await runWithTestDb(async (db: DB) => {
      const minimalPromotionData = promotionTestFactory.buildOne({
        storeId: "test-store-id-1",
        title: "Minimal Promotion",
        description: undefined,
        collectionId: undefined,
      });

      const result = await createPromotionQuery(db, minimalPromotionData);

      expect(result.success).toBe(true);
      expect(result.promotion).toBeDefined();
      expect(result.promotion?.storeId).toBe("test-store-id-1");
      expect(result.promotion?.title).toBe("Minimal Promotion");
      expect(result.error).toBeUndefined();
    });
  });
});
