import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateWantListQuery } from "./update-want-list.query";

describe("updateWantListQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update a want list", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "Original Want List",
          description: "Original description",
          priority: 1,
        });

      const updateData = {
        id: wantList.id,
        name: "Updated Want List",
        description: "Updated description",
        priority: 3,
      };

      const result = await updateWantListQuery(db, updateData);

      expect(result.id).toBe(wantList.id);
      expect(result.name).toBe("Updated Want List");
      expect(result.description).toBe("Updated description");
      expect(result.priority).toBe(3);
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should return undefined when updating non-existent want list", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-want-list-id",
        name: "Updated Name",
      };

      const result = await updateWantListQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "Original Want List",
          description: "Original description",
          priority: 1,
        });

      const updateData = {
        id: wantList.id,
        name: "Updated Name Only",
      };

      const result = await updateWantListQuery(db, updateData);

      expect(result.id).toBe(wantList.id);
      expect(result.name).toBe("Updated Name Only");
      expect(result.description).toBe("Original description");
      expect(result.priority).toBe(1);
    });
  });

  it("should handle empty update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "Original Want List",
        });

      const updateData = {
        id: wantList.id,
      };

      const result = await updateWantListQuery(db, updateData);

      expect(result.id).toBe(wantList.id);
      expect(result.name).toBe("Original Want List");
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should throw error with invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "Original Want List",
        });

      const updateData = {
        id: wantList.id,
        userId: null as unknown as string,
        priority: -1,
      };

      await expect(updateWantListQuery(db, updateData)).rejects.toThrow();
    });
  });
});
