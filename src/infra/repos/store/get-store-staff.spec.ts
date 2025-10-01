import { storeStaffTestFactory } from "@/src/domain/auth/store-staff.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getStoreStaffQuery } from "./get-store-staff.query";

describe("getStoreStaffQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve a store staff member", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeStaff = await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        userId: "test-user-id-1",
        role: "manager",
      });

      const result = await getStoreStaffQuery(
        db,
        storeStaff.storeId,
        storeStaff.userId
      );

      expect(result.success).toBe(true);
      expect(result.storeStaff).toBeDefined();
      expect(result.storeStaff?.id).toBe(storeStaff.id);
      expect(result.storeStaff?.storeId).toBe("test-store-id-1");
      expect(result.storeStaff?.userId).toBe("test-user-id-1");
      expect(result.storeStaff?.role).toBe("manager");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when store staff is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getStoreStaffQuery(
        db,
        "non-existent-store-id",
        "non-existent-user-id"
      );

      expect(result.success).toBe(false);
      expect(result.storeStaff).toBeUndefined();
      expect(result.error).toBe("Store staff not found");
    });
  });

  it("should handle empty storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getStoreStaffQuery(db, "", "test-user-id-1");

      expect(result.success).toBe(false);
      expect(result.storeStaff).toBeUndefined();
      expect(result.error).toBe("Store staff not found");
    });
  });

  it("should handle empty userId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getStoreStaffQuery(db, "test-store-id-1", "");

      expect(result.success).toBe(false);
      expect(result.storeStaff).toBeUndefined();
      expect(result.error).toBe("Store staff not found");
    });
  });

  it("should handle null storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getStoreStaffQuery(
        db,
        null as unknown as string,
        "test-user-id-1"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle null userId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getStoreStaffQuery(
        db,
        "test-store-id-1",
        null as unknown as string
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedStoreId = "malformed-store-id-with-special-chars!@#$%";

      const result = await getStoreStaffQuery(
        db,
        malformedStoreId,
        "test-user-id-1"
      );

      expect(result.success).toBe(false);
      expect(result.storeStaff).toBeUndefined();
      expect(result.error).toBe("Store staff not found");
    });
  });

  it("should retrieve a store staff member with staff role", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeStaff = await storeStaffTestFactory.buildAndInsertOne(db, {
        storeId: "test-store-id-1",
        userId: "test-user-id-1",
        role: "staff",
      });

      const result = await getStoreStaffQuery(
        db,
        storeStaff.storeId,
        storeStaff.userId
      );

      expect(result.success).toBe(true);
      expect(result.storeStaff).toBeDefined();
      expect(result.storeStaff?.role).toBe("staff");
      expect(result.error).toBeUndefined();
    });
  });
});
