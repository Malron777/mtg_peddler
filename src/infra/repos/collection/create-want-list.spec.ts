import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { wantLists } from "../../db/schema/tcg";
import { createWantListQuery } from "./create-want-list.query";

describe("createWantListQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a want list", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListData = wantListTestFactory.buildOne({
        userId: "test-user-id-1",
        name: "Test Want List",
        description: "A test want list for testing purposes",
        priority: 1,
      });

      const result = await createWantListQuery(db, wantListData);

      expect(result.success).toBe(true);
      expect(result.wantList).toBeDefined();
      expect(result.wantList?.userId).toBe("test-user-id-1");
      expect(result.wantList?.name).toBe("Test Want List");
      expect(result.wantList?.description).toBe(
        "A test want list for testing purposes"
      );
      expect(result.wantList?.priority).toBe(1);
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when creating a want list with duplicate id", async () => {
    await runWithTestDb(async (db: DB) => {
      const duplicateId = "duplicate-want-list-id";
      const wantListData1 = wantListTestFactory.buildOne({
        id: duplicateId,
        userId: "test-user-id-1",
        name: "First Want List",
      });

      const wantListData2 = wantListTestFactory.buildOne({
        id: duplicateId,
        userId: "test-user-id-2",
        name: "Second Want List",
      });

      // Insert first want list
      await db.insert(wantLists).values(wantListData1);

      // Try to create second want list with same id
      const result = await createWantListQuery(db, wantListData2);

      expect(result.success).toBe(false);
      expect(result.wantList).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should fail when creating a want list with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidWantListData = {
        id: "test-want-list-id",
        userId: null as unknown as string,
        name: "",
        description: null as unknown as string,
        priority: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createWantListQuery(db, invalidWantListData);

      expect(result.success).toBe(false);
      expect(result.wantList).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListData = wantListTestFactory.buildOne({
        userId: "test-user-id-1",
        name: "Test Want List",
      });

      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await createWantListQuery(
        invalidDb as unknown as DB,
        wantListData
      );

      expect(result.success).toBe(false);
      expect(result.wantList).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should create a want list with minimal required fields", async () => {
    await runWithTestDb(async (db: DB) => {
      const minimalWantListData = wantListTestFactory.buildOne({
        userId: "test-user-id-1",
        name: "Minimal Want List",
        description: undefined,
        priority: undefined,
      });

      const result = await createWantListQuery(db, minimalWantListData);

      expect(result.success).toBe(true);
      expect(result.wantList).toBeDefined();
      expect(result.wantList?.userId).toBe("test-user-id-1");
      expect(result.wantList?.name).toBe("Minimal Want List");
      expect(result.error).toBeUndefined();
    });
  });
});
