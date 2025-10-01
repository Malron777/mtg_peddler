import { storeStaffTestFactory } from "@/src/domain/auth/store-staff.model.test-factory";
import { storesTestFactory } from "@/src/domain/auth/stores.model.test-factory";
import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
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
      const store1 = await storesTestFactory.buildAndInsertOneWithDependencies(
        db
      );
      const store2 = await storesTestFactory.buildAndInsertOneWithDependencies(
        db
      );
      const user1 = await userTestFactory.buildAndInsertOne(db);
      const user2 = await userTestFactory.buildAndInsertOne(db);
      const user3 = await userTestFactory.buildAndInsertOne(db);
      // Create store staff for the store
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: store1.id,
        userId: user1.id,
        role: "manager",
      });
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: store1.id,
        userId: user2.id,
        role: "staff",
      });

      // Create store staff for different store
      await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: store2.id,
        userId: user3.id,
        role: "manager",
      });

      const result = await getAllStoreStaffForStoreQuery(db, store1.id);

      expect(result.storeStaff).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.storeStaff[0].storeId).toBe(store1.id);
      expect(result.storeStaff[1].storeId).toBe(store1.id);
    });
  });

  it("should return empty results for store with no staff", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeId = "test-store-with-no-staff";

      // Create store staff for different store
      await storeStaffTestFactory.buildAndInsertOneWithDependencies(db, {
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
      const store = await storesTestFactory.buildAndInsertOneWithDependencies(
        db
      );

      // Create 5 store staff for the store
      for (let i = 1; i <= 5; i++) {
        const user = await userTestFactory.buildAndInsertOne(db, {
          id: `test-user-id-${i}`,
        });
        await storeStaffTestFactory.buildAndInsertOne(db, {
          storeId: store.id,
          userId: user.id,
          role: i % 2 === 0 ? "staff" : "manager",
        });
      }

      const result = await getAllStoreStaffForStoreQuery(db, store.id, {
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

      const staff1 =
        await storeStaffTestFactory.buildAndInsertOneWithDependencies(db, {
          storeId,
          userId: "test-user-id-1",
          role: "manager",
          createdAt: new Date("2023-01-01"),
        });

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
      });
      const staff2 = await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId,
        userId: user2.id,
        role: "staff",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllStoreStaffForStoreQuery(db, storeId);

      expect(result.storeStaff).toHaveLength(2);
      expect(result.storeStaff[0].userId).toBe(staff2.userId); // Most recent first
      expect(result.storeStaff[0].storeId).toBe(staff2.storeId);
      expect(result.storeStaff[1].userId).toBe(staff1.userId);
      expect(result.storeStaff[1].storeId).toBe(staff1.storeId);
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
