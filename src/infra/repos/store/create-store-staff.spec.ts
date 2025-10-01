import { storeStaffTestFactory } from "@/src/domain/auth/store-staff.model.test-factory";
import { storesTestFactory } from "@/src/domain/auth/stores.model.test-factory";
import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { storeStaff } from "../../db/schema/auth";
import { createStoreStaffQuery } from "./create-store-staff.query";

describe("createStoreStaffQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a store staff member", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const store = await storesTestFactory.insertOne(db, {
        id: "test-store-id-1",
        name: "Test Store",
        websiteUrl: "https://teststore.com",
        physicalAddress: "123 Test St",
        description: "A test store",
        isVerified: false,
        createdBy: user.id,
      });

      const storeStaffData = storeStaffTestFactory.buildOne({
        storeId: store.id,
        userId: user.id,
        role: "manager",
      });

      const result = await createStoreStaffQuery(db, storeStaffData);

      expect(result.success).toBe(true);
      expect(result.storeStaff).toBeDefined();
      expect(result.storeStaff?.storeId).toBe(store.id);
      expect(result.storeStaff?.userId).toBe(user.id);
      expect(result.storeStaff?.role).toBe("manager");
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when creating a store staff member with duplicate id", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create dependencies first
      const user1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
        name: "Test User 2",
        email: "test2@example.com",
      });

      const store = await storesTestFactory.insertOne(db, {
        id: "test-store-id-1",
        name: "Test Store",
        websiteUrl: "https://teststore.com",
        physicalAddress: "123 Test St",
        description: "A test store",
        isVerified: false,
        createdBy: user1.id,
      });

      const storeStaffData1 = storeStaffTestFactory.buildOne({
        storeId: store.id,
        userId: user1.id,
      });

      const storeStaffData2 = storeStaffTestFactory.buildOne({
        storeId: store.id,
        userId: user2.id,
      });

      // Insert first store staff member
      await db.insert(storeStaff).values(storeStaffData1);

      // Try to create second store staff member with same id
      const result = await createStoreStaffQuery(db, storeStaffData2);

      expect(result.success).toBe(false);
      expect(result.storeStaff).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should fail when creating a store staff member with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidStoreStaffData = {
        storeId: null as unknown as string,
        userId: "",
        role: "staff" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createStoreStaffQuery(db, invalidStoreStaffData);

      expect(result.success).toBe(false);
      expect(result.storeStaff).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const store = await storesTestFactory.insertOne(db, {
        id: "test-store-id-1",
        name: "Test Store",
        websiteUrl: "https://teststore.com",
        physicalAddress: "123 Test St",
        description: "A test store",
        isVerified: false,
        createdBy: user.id,
      });

      const storeStaffData = storeStaffTestFactory.buildOne({
        storeId: store.id,
        userId: user.id,
      });

      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await createStoreStaffQuery(
        invalidDb as unknown as DB,
        storeStaffData
      );

      expect(result.success).toBe(false);
      expect(result.storeStaff).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should create a store staff member with default role", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const store = await storesTestFactory.insertOne(db, {
        id: "test-store-id-1",
        name: "Test Store",
        websiteUrl: "https://teststore.com",
        physicalAddress: "123 Test St",
        description: "A test store",
        isVerified: false,
        createdBy: user.id,
      });

      const storeStaffData = storeStaffTestFactory.buildOne({
        storeId: store.id,
        userId: user.id,
        role: undefined,
      });

      const result = await createStoreStaffQuery(db, storeStaffData);

      expect(result.success).toBe(true);
      expect(result.storeStaff).toBeDefined();
      expect(result.storeStaff?.storeId).toBe(store.id);
      expect(result.storeStaff?.userId).toBe(user.id);
      expect(result.storeStaff?.role).toBe("staff"); // Default role
      expect(result.error).toBeUndefined();
    });
  });
});
