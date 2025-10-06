import { storeStaffTestFactory } from "@/src/domain/auth/store-staff.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteStoreStaffQuery } from "./delete-store-staff.query";

describe("deleteStoreStaffQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete a store staff member", async () => {
    await runWithTestDb(async (db: DB) => {
      const storeStaff =
        await storeStaffTestFactory.buildAndInsertOneWithDependencies(db, {
          storeId: "test-store-id-1",
          userId: "test-user-id-1",
          role: "manager",
        });

      const result = await deleteStoreStaffQuery(
        db,
        storeStaff.storeId,
        storeStaff.userId
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent store staff gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteStoreStaffQuery(
        db,
        "non-existent-store-id",
        "non-existent-user-id"
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteStoreStaffQuery(db, "", "test-user-id-1");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty userId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteStoreStaffQuery(db, "test-store-id-1", "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteStoreStaffQuery(
        db,
        null as unknown as string,
        "test-user-id-1"
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null userId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteStoreStaffQuery(
        db,
        "test-store-id-1",
        null as unknown as string
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle malformed storeId", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedStoreId = "malformed-store-id-with-special-chars!@#$%";

      const result = await deleteStoreStaffQuery(
        db,
        malformedStoreId,
        "test-user-id-1"
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await deleteStoreStaffQuery(
        invalidDb as unknown as DB,
        "test-store-id",
        "test-user-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
