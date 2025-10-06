import { storesTestFactory } from "@/src/domain/auth/stores.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { promotionTestFactory } from "@/src/domain/tcg/promotion.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllActivePromotionsForStoreQuery } from "./get-all-active-promotions-for-store.query";

describe("getAllActivePromotionsForStoreQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve active promotions for a specific store", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-id-1";
      const collectionId = "test-collection-id-1";
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now

      // Create active promotions for the store
      await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
        storeId,
        title: "Active Promotion 1",
        description: "First active promotion",
        discountPercentage: "10.00",
        startsAt: startDate,
        endsAt: endDate,
        collectionId,
      });
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId,
        title: "Active Promotion 2",
        description: "Second active promotion",
        discountPercentage: "20.00",
        startsAt: startDate,
        endsAt: endDate,
        collectionId,
      });

      // Create inactive promotion (ended)
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId,
        title: "Inactive Promotion",
        description: "Ended promotion",
        discountPercentage: "15.00",
        startsAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
        endsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        collectionId,
      });

      // Create promotion for different store
      await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
        storeId: "test-store-id-2",
        title: "Other Store Promotion",
        description: "Promotion for different store",
        discountPercentage: "25.00",
        startsAt: startDate,
        endsAt: endDate,
      });

      const result = await getAllActivePromotionsForStoreQuery(db, storeId);

      expect(result.promotions).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.promotions[0].storeId).toBe(storeId);
      expect(result.promotions[1].storeId).toBe(storeId);
    });
  });

  it("should return empty results for store with no active promotions", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-with-no-active-promotions";
      const now = new Date();

      // Create inactive promotion for the store
      await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
        storeId,
        title: "Inactive Promotion",
        description: "Ended promotion",
        discountPercentage: "15.00",
        startsAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
        endsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      const result = await getAllActivePromotionsForStoreQuery(db, storeId);

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

      const result = await getAllActivePromotionsForStoreQuery(
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
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Create 5 active promotions for the store
      for (let i = 1; i <= 5; i++) {
        const collection =
          await collectionTestFactory.buildAndInsertOneWithDependencies(db);
        await promotionTestFactory.buildAndInsertOne(db, {
          storeId: store.id,
          title: `Active Promotion ${i}`,
          description: `Active promotion ${i}`,
          discountPercentage: `${i * 5}.00`,
          startsAt: startDate,
          endsAt: endDate,
          collectionId: collection.id,
        });
      }

      const result = await getAllActivePromotionsForStoreQuery(db, store.id, {
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
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const promotion1 =
        await promotionTestFactory.buildAndInsertOneWithDependencies(db, {
          storeId,
          title: "First Active Promotion",
          description: "First promotion",
          discountPercentage: "10.00",
          startsAt: startDate,
          endsAt: endDate,
          createdAt: new Date("2023-01-01"),
          collectionId,
        });

      const collection2 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-collection-id-2",
        });

      const promotion2 = await promotionTestFactory.buildAndInsertOne(db, {
        storeId,
        title: "Second Active Promotion",
        description: "Second promotion",
        discountPercentage: "20.00",
        startsAt: startDate,
        endsAt: endDate,
        createdAt: new Date("2023-01-02"),
        collectionId: collection2.id,
      });

      const result = await getAllActivePromotionsForStoreQuery(db, storeId);

      expect(result.promotions).toHaveLength(2);
      expect(result.promotions[0].id).toBe(promotion2.id); // Most recent first
      expect(result.promotions[1].id).toBe(promotion1.id);
    });
  });

  it("should handle empty storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllActivePromotionsForStoreQuery(db, "");

      expect(result.promotions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
