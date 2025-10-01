import { promotionTestFactory } from "@/src/domain/tcg/promotion.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllActivePromotionsQuery } from "./get-all-active-promotions.query";

describe("getAllActivePromotionsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve all active promotions", async () => {
    await runWithTestDb(async (db: DB) => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now

      // Create active promotions
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "Active Promotion 1",
        description: "First active promotion",
        discountPercentage: "10.00",
        startsAt: startDate,
        endsAt: endDate,
      });
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        title: "Active Promotion 2",
        description: "Second active promotion",
        discountPercentage: "20.00",
        startsAt: startDate,
        endsAt: endDate,
      });

      // Create inactive promotion (ended)
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-3",
        title: "Inactive Promotion",
        description: "Ended promotion",
        discountPercentage: "15.00",
        startsAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
        endsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      const result = await getAllActivePromotionsQuery(db);

      expect(result.promotions).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.promotions[0].title).toBe("Active Promotion 2"); // Ordered by createdAt desc
      expect(result.promotions[1].title).toBe("Active Promotion 1");
    });
  });

  it("should return empty results when no active promotions exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const now = new Date();

      // Create only inactive promotions
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "Inactive Promotion 1",
        description: "Ended promotion",
        discountPercentage: "15.00",
        startsAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
        endsAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      });

      const result = await getAllActivePromotionsQuery(db);

      expect(result.promotions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Create 5 active promotions
      for (let i = 1; i <= 5; i++) {
        await promotionTestFactory.buildAndInsertOne(db, {
          storeId: `test-store-id-${i}`,
          title: `Active Promotion ${i}`,
          description: `Active promotion ${i}`,
          discountPercentage: `${i * 5}.00`,
          startsAt: startDate,
          endsAt: endDate,
        });
      }

      const result = await getAllActivePromotionsQuery(db, {
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

  it("should handle invalid pagination parameters", async () => {
    await runWithTestDb(async (db: DB) => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "Active Promotion",
        description: "Active promotion",
        discountPercentage: "10.00",
        startsAt: startDate,
        endsAt: endDate,
      });

      const result = await getAllActivePromotionsQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.promotions).toHaveLength(0);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order promotions by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const promotion1 = await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "First Active Promotion",
        description: "First promotion",
        discountPercentage: "10.00",
        startsAt: startDate,
        endsAt: endDate,
        createdAt: new Date("2023-01-01"),
      });

      const promotion2 = await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        title: "Second Active Promotion",
        description: "Second promotion",
        discountPercentage: "20.00",
        startsAt: startDate,
        endsAt: endDate,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllActivePromotionsQuery(db);

      expect(result.promotions).toHaveLength(2);
      expect(result.promotions[0].id).toBe(promotion2.id); // Most recent first
      expect(result.promotions[1].id).toBe(promotion1.id);
    });
  });

  it("should handle large page sizes", async () => {
    await runWithTestDb(async (db: DB) => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Create 3 active promotions
      for (let i = 1; i <= 3; i++) {
        await promotionTestFactory.buildAndInsertOne(db, {
          storeId: `test-store-id-${i}`,
          title: `Active Promotion ${i}`,
          description: `Active promotion ${i}`,
          discountPercentage: `${i * 5}.00`,
          startsAt: startDate,
          endsAt: endDate,
        });
      }

      const result = await getAllActivePromotionsQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.promotions).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
