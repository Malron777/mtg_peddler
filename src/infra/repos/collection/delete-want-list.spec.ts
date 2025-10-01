import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteWantListQuery } from "./delete-want-list.query";

describe("deleteWantListQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete a want list", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList = await wantListTestFactory.buildAndInsertOne(db, {
        userId: "test-user-id-1",
        name: "Test Want List",
      });

      const result = await deleteWantListQuery(db, wantList.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent want list gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-want-list-id";

      const result = await deleteWantListQuery(db, nonExistentId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteWantListQuery(db, "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteWantListQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await deleteWantListQuery(db, malformedId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await deleteWantListQuery(
        invalidDb as unknown as DB,
        "test-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
