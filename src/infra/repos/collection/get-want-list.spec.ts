import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getWantListQuery } from "./get-want-list.query";

describe("getWantListQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve a want list", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "Test Want List",
          description: "A test want list",
          priority: 1,
        });

      const result = await getWantListQuery(db, wantList.id);

      expect(result.success).toBe(true);
      expect(result.wantList).toBeDefined();
      expect(result.wantList?.id).toBe(wantList.id);
      expect(result.wantList?.userId).toBe("test-user-id-1");
      expect(result.wantList?.name).toBe("Test Want List");
      expect(result.wantList?.description).toBe("A test want list");
      expect(result.wantList?.priority).toBe(1);
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when want list is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-want-list-id";

      const result = await getWantListQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.wantList).toBeUndefined();
      expect(result.error).toBe("Want list not found");
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getWantListQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.wantList).toBeUndefined();
      expect(result.error).toBe("Want list not found");
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getWantListQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await getWantListQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.wantList).toBeUndefined();
      expect(result.error).toBe("Want list not found");
    });
  });

  it("should retrieve a want list with high priority", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "High Priority Want List",
          priority: 5,
        });

      const result = await getWantListQuery(db, wantList.id);

      expect(result.success).toBe(true);
      expect(result.wantList).toBeDefined();
      expect(result.wantList?.priority).toBe(5);
      expect(result.error).toBeUndefined();
    });
  });
});
