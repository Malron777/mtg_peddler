import { dealItemTestFactory } from "@/src/domain/tcg/deal-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllDealItemsQuery } from "./get-all-deal-items.query";

describe("getAllDealItemsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve deal items with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test deal items
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: "test-deal-id-1",
        collectionItemId: "test-collection-item-id-1",
        agreedPrice: "10.00",
        quantity: 1,
      });
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: "test-deal-id-2",
        collectionItemId: "test-collection-item-id-2",
        agreedPrice: "20.00",
        quantity: 2,
      });

      const result = await getAllDealItemsQuery(db);

      expect(result.dealItems).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.dealItems[0].dealId).toBe("test-deal-id-2"); // Ordered by createdAt desc
      expect(result.dealItems[1].dealId).toBe("test-deal-id-1");
    });
  });

  it("should return empty results when no deal items exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllDealItemsQuery(db);

      expect(result.dealItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 5 deal items
      for (let i = 1; i <= 5; i++) {
        await dealItemTestFactory.buildAndInsertOne(db, {
          dealId: `test-deal-id-${i}`,
          collectionItemId: `test-collection-item-id-${i}`,
          agreedPrice: `${i * 10}.00`,
          quantity: i,
        });
      }

      const result = await getAllDealItemsQuery(db, {
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

  it("should handle invalid pagination parameters", async () => {
    await runWithTestDb(async (db: DB) => {
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: "test-deal-id-1",
        collectionItemId: "test-collection-item-id-1",
        agreedPrice: "10.00",
        quantity: 1,
      });

      const result = await getAllDealItemsQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.dealItems).toHaveLength(0);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order deal items by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const item1 = await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: "test-deal-id-1",
        collectionItemId: "test-collection-item-id-1",
        agreedPrice: "10.00",
        quantity: 1,
        createdAt: new Date("2023-01-01"),
      });

      const item2 = await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: "test-deal-id-2",
        collectionItemId: "test-collection-item-id-2",
        agreedPrice: "20.00",
        quantity: 2,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllDealItemsQuery(db);

      expect(result.dealItems).toHaveLength(2);
      expect(result.dealItems[0].id).toBe(item2.id); // Most recent first
      expect(result.dealItems[1].id).toBe(item1.id);
    });
  });

  it("should handle large page sizes", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 3 deal items
      for (let i = 1; i <= 3; i++) {
        await dealItemTestFactory.buildAndInsertOne(db, {
          dealId: `test-deal-id-${i}`,
          collectionItemId: `test-collection-item-id-${i}`,
          agreedPrice: `${i * 10}.00`,
          quantity: i,
        });
      }

      const result = await getAllDealItemsQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.dealItems).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
