import { storeStaffTestFactory } from "@/src/domain/auth/store-staff.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllStoreStaffQuery } from "./get-all-store-staff.query";

describe("getAllStoreStaffQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve store staff with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test store staff
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        userId: "test-user-id-1",
        role: "manager",
      });
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        userId: "test-user-id-2",
        role: "staff",
      });

      const result = await getAllStoreStaffQuery(db);

      expect(result.storeStaff).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.storeStaff[0].storeId).toBe("test-store-id-2"); // Ordered by createdAt desc
      expect(result.storeStaff[1].storeId).toBe("test-store-id-1");
    });
  });

  it("should return empty results when no store staff exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllStoreStaffQuery(db);

      expect(result.storeStaff).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 5 store staff
      for (let i = 1; i <= 5; i++) {
        await storeStaffTestFactory.buildAndInsertOne(db, {
          storeId: `test-store-id-${i}`,
          userId: `test-user-id-${i}`,
          role: i % 2 === 0 ? "staff" : "manager",
        });
      }

      const result = await getAllStoreStaffQuery(db, {
        page: 2,
        pageSize: 2,
      });

      expect(result.storeStaff).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination parameters", async () => {
    await runWithTestDb(async (db: DB) => {
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        userId: "test-user-id-1",
        role: "manager",
      });

      const result = await getAllStoreStaffQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.storeStaff).toHaveLength(0);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order store staff by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const staff1 = await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        userId: "test-user-id-1",
        role: "manager",
        createdAt: new Date("2023-01-01"),
      });

      const staff2 = await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        userId: "test-user-id-2",
        role: "staff",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllStoreStaffQuery(db);

      expect(result.storeStaff).toHaveLength(2);
      expect(result.storeStaff[0].id).toBe(staff2.id); // Most recent first
      expect(result.storeStaff[1].id).toBe(staff1.id);
    });
  });

  it("should handle large page sizes", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 3 store staff
      for (let i = 1; i <= 3; i++) {
        await storeStaffTestFactory.buildAndInsertOne(db, {
          storeId: `test-store-id-${i}`,
          userId: `test-user-id-${i}`,
          role: i % 2 === 0 ? "staff" : "manager",
        });
      }

      const result = await getAllStoreStaffQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.storeStaff).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
