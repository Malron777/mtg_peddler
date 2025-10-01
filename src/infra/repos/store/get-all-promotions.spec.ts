import { promotionTestFactory } from "@/src/domain/tcg/promotion.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllPromotionsQuery } from "./get-all-promotions.query";

describe("getAllPromotionsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve promotions with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test promotions
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "Promotion 1",
        description: "First promotion",
        discountPercentage: "10.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
      });
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        title: "Promotion 2",
        description: "Second promotion",
        discountPercentage: "20.00",
        startsAt: new Date("2023-02-01"),
        endsAt: new Date("2023-02-28"),
      });

      const result = await getAllPromotionsQuery(db);

      expect(result.promotions).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.promotions[0].title).toBe("Promotion 2"); // Ordered by createdAt desc
      expect(result.promotions[1].title).toBe("Promotion 1");
    });
  });

  it("should return empty results when no promotions exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllPromotionsQuery(db);

      expect(result.promotions).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 5 promotions
      for (let i = 1; i <= 5; i++) {
        await promotionTestFactory.buildAndInsertOne(db, {
          storeId: `test-store-id-${i}`,
          title: `Promotion ${i}`,
          description: `Promotion ${i}`,
          discountPercentage: `${i * 5}.00`,
          startsAt: new Date(`2023-0${i}-01`),
          endsAt: new Date(`2023-0${i}-28`),
        });
      }

      const result = await getAllPromotionsQuery(db, {
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
      await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "Promotion 1",
        description: "First promotion",
        discountPercentage: "10.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
      });

      const result = await getAllPromotionsQuery(db, {
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
      const promotion1 = await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        title: "First Promotion",
        description: "First promotion",
        discountPercentage: "10.00",
        startsAt: new Date("2023-01-01"),
        endsAt: new Date("2023-01-31"),
        createdAt: new Date("2023-01-01"),
      });

      const promotion2 = await promotionTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        title: "Second Promotion",
        description: "Second promotion",
        discountPercentage: "20.00",
        startsAt: new Date("2023-02-01"),
        endsAt: new Date("2023-02-28"),
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllPromotionsQuery(db);

      expect(result.promotions).toHaveLength(2);
      expect(result.promotions[0].id).toBe(promotion2.id); // Most recent first
      expect(result.promotions[1].id).toBe(promotion1.id);
    });
  });

  it("should handle large page sizes", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 3 promotions
      for (let i = 1; i <= 3; i++) {
        await promotionTestFactory.buildAndInsertOne(db, {
          storeId: `test-store-id-${i}`,
          title: `Promotion ${i}`,
          description: `Promotion ${i}`,
          discountPercentage: `${i * 5}.00`,
          startsAt: new Date(`2023-0${i}-01`),
          endsAt: new Date(`2023-0${i}-28`),
        });
      }

      const result = await getAllPromotionsQuery(db, {
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
