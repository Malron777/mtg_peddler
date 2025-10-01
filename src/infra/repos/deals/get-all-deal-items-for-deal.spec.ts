import { dealItemTestFactory } from "@/src/domain/tcg/deal-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllDealItemsForDealQuery } from "./get-all-deal-items-for-deal.query";

describe("getAllDealItemsForDealQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve deal items for a specific deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealId = "test-deal-id-1";

      // Create deal items for the deal
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId,
        collectionItemId: "test-collection-item-id-1",
        agreedPrice: "10.00",
        quantity: 1,
      });
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId,
        collectionItemId: "test-collection-item-id-2",
        agreedPrice: "20.00",
        quantity: 2,
      });

      // Create deal item for different deal
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: "test-deal-id-2",
        collectionItemId: "test-collection-item-id-3",
        agreedPrice: "15.00",
        quantity: 1,
      });

      const result = await getAllDealItemsForDealQuery(db, dealId);

      expect(result.dealItems).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.dealItems[0].dealId).toBe(dealId);
      expect(result.dealItems[1].dealId).toBe(dealId);
    });
  });

  it("should return empty results for deal with no items", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealId = "test-deal-with-no-items";

      // Create deal item for different deal
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: "test-deal-id-2",
        collectionItemId: "test-collection-item-id-1",
        agreedPrice: "10.00",
        quantity: 1,
      });

      const result = await getAllDealItemsForDealQuery(db, dealId);

      expect(result.dealItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentDealId = "non-existent-deal-id";

      const result = await getAllDealItemsForDealQuery(db, nonExistentDealId);

      expect(result.dealItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealId = "test-deal-id-1";

      // Create 5 deal items for the deal
      for (let i = 1; i <= 5; i++) {
        await dealItemTestFactory.buildAndInsertOne(db, {
          dealId,
          collectionItemId: `test-collection-item-id-${i}`,
          agreedPrice: `${i * 10}.00`,
          quantity: i,
        });
      }

      const result = await getAllDealItemsForDealQuery(db, dealId, {
        page: 2,
        pageSize: 2,
      });

      expect(result.dealItems).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order deal items by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealId = "test-deal-id-1";

      const item1 = await dealItemTestFactory.buildAndInsertOne(db, {
        dealId,
        collectionItemId: "test-collection-item-id-1",
        agreedPrice: "10.00",
        quantity: 1,
        createdAt: new Date("2023-01-01"),
      });

      const item2 = await dealItemTestFactory.buildAndInsertOne(db, {
        dealId,
        collectionItemId: "test-collection-item-id-2",
        agreedPrice: "20.00",
        quantity: 2,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllDealItemsForDealQuery(db, dealId);

      expect(result.dealItems).toHaveLength(2);
      expect(result.dealItems[0].id).toBe(item2.id); // Most recent first
      expect(result.dealItems[1].id).toBe(item1.id);
    });
  });

  it("should handle empty dealId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllDealItemsForDealQuery(db, "");

      expect(result.dealItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
