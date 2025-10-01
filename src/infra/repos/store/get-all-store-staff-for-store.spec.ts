import { storeStaffTestFactory } from "@/src/domain/auth/store-staff.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllStoreStaffForStoreQuery } from "./get-all-store-staff-for-store.query";

describe("getAllStoreStaffForStoreQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve store staff for a specific store", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-id-1";

      // Create store staff for the store
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId,
        userId: "test-user-id-1",
        role: "manager",
      });
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId,
        userId: "test-user-id-2",
        role: "staff",
      });

      // Create store staff for different store
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        userId: "test-user-id-3",
        role: "manager",
      });

      const result = await getAllStoreStaffForStoreQuery(db, storeId);

      expect(result.storeStaff).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.storeStaff[0].storeId).toBe(storeId);
      expect(result.storeStaff[1].storeId).toBe(storeId);
    });
  });

  it("should return empty results for store with no staff", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-with-no-staff";

      // Create store staff for different store
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-2",
        userId: "test-user-id-1",
        role: "manager",
      });

      const result = await getAllStoreStaffForStoreQuery(db, storeId);

      expect(result.storeStaff).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent store", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentStoreId = "non-existent-store-id";

      const result = await getAllStoreStaffForStoreQuery(
        db,
        nonExistentStoreId
      );

      expect(result.storeStaff).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-id-1";

      // Create 5 store staff for the store
      for (let i = 1; i <= 5; i++) {
        await storeStaffTestFactory.buildAndInsertOne(db, {
          storeId,
          userId: `test-user-id-${i}`,
          role: i % 2 === 0 ? "staff" : "manager",
        });
      }

      const result = await getAllStoreStaffForStoreQuery(db, storeId, {
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

  it("should order store staff by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-id-1";

      const staff1 = await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId,
        userId: "test-user-id-1",
        role: "manager",
        createdAt: new Date("2023-01-01"),
      });

      const staff2 = await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId,
        userId: "test-user-id-2",
        role: "staff",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllStoreStaffForStoreQuery(db, storeId);

      expect(result.storeStaff).toHaveLength(2);
      expect(result.storeStaff[0].id).toBe(staff2.id); // Most recent first
      expect(result.storeStaff[1].id).toBe(staff1.id);
    });
  });

  it("should handle empty storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllStoreStaffForStoreQuery(db, "");

      expect(result.storeStaff).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
