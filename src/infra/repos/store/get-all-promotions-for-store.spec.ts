import { storesTestFactory } from "@/src/domain/auth/stores.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { promotionTestFactory } from "@/src/domain/tcg/promotion.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllPromotionsForStoreQuery } from "./get-all-promotions-for-store.query";

describe("getAllPromotionsForStoreQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve promotions for a specific store", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-id-1";
      const collectionId = "test-collection-id-1";

      // Create promotions for the store
      await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
        storeId,
        title: "Store Promotion 1",
        description: "First store promotion",
        discountPercentage: "10.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
        collectionId,
      });
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId,
        title: "Store Promotion 2",
        description: "Second store promotion",
        discountPercentage: "20.00",
        startsAt: new Date("2023-02-01"),
        endsAt: new Date("2023-02-28"),
        collectionId,
      });

      // Create promotion for different store
      await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
        storeId: "test-store-id-2",
        title: "Other Store Promotion",
        description: "Promotion for different store",
        discountPercentage: "25.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
      });

      const result = await getAllPromotionsForStoreQuery(db, storeId);

      expect(result.promotions).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.promotions[0].storeId).toBe(storeId);
      expect(result.promotions[1].storeId).toBe(storeId);
    });
  });

  it("should return empty results for store with no promotions", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-with-no-promotions";

      // Create promotion for different store
      await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
        storeId: "test-store-id-2",
        title: "Other Store Promotion",
        description: "Promotion for different store",
        discountPercentage: "25.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
      });

      const result = await getAllPromotionsForStoreQuery(db, storeId);

      expect(result.promotions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent store", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentStoreId = "non-existent-store-id";

      const result = await getAllPromotionsForStoreQuery(
        db,
        nonExistentStoreId
      );

      expect(result.promotions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const store = await storesTestFactory.buildAndInsertOneWithDependencies(
        db
      );
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db);

      // Create 5 promotions for the store
      for (let i = 1; i <= 5; i++) {
        await promotionTestFactory.buildAndInsertOne(db, {
          storeId: store.id,
          title: `Store Promotion ${i}`,
          description: `Store promotion ${i}`,
          discountPercentage: `${i * 5}.00`,
          startsAt: new Date(`2023-0${i}-01`),
          endsAt: new Date(`2023-0${i}-28`),
          collectionId: collection.id,
        });
      }

      const result = await getAllPromotionsForStoreQuery(db, store.id, {
        page: 2,
        pageSize: 2,
      });

      expect(result.promotions).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order promotions by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-id-1";
      const collectionId = "test-collection-id-1";

      const promotion1 =
        await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
          storeId,
          title: "First Store Promotion",
          description: "First promotion",
          discountPercentage: "10.00",
          startsAt: new Date("2023-01-01"),
          endsAt: new Date("2023-01-31"),
          createdAt: new Date("2023-01-01"),
          collectionId,
        });

      const promotion2 = await promotionTestFactory.buildAndInsertOne(db, {
        storeId,
        title: "Second Store Promotion",
        description: "Second promotion",
        discountPercentage: "20.00",
        startsAt: new Date("2023-02-01"),
        endsAt: new Date("2023-02-28"),
        createdAt: new Date("2023-01-02"),
        collectionId,
      });

      const result = await getAllPromotionsForStoreQuery(db, storeId);

      expect(result.promotions).toHaveLength(2);
      expect(result.promotions[0].id).toBe(promotion2.id); // Most recent first
      expect(result.promotions[1].id).toBe(promotion1.id);
    });
  });

  it("should handle empty storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllPromotionsForStoreQuery(db, "");

      expect(result.promotions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
