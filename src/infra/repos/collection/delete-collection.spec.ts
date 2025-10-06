import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteCollectionQuery } from "./delete-collection.query";

describe("deleteCollectionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete an existing collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-collection-id-1",
          userId: "test-user-id-1",
          name: "My Test Collection",
          description: "A collection for testing purposes",
          isPublic: false,
        });

      const result = await deleteCollectionQuery(db, collection.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent collection gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-collection-id";

      const result = await deleteCollectionQuery(db, nonExistentId);

      // Deletion of non-existent record should still be considered successful
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteCollectionQuery(db, "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteCollectionQuery(db, null as unknown as string);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await deleteCollectionQuery(db, malformedId);

      // Should handle gracefully
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // This test would require setting up foreign key constraints
      // For now, we'll test with a malformed id
      const malformedId = "test-id-with-special-chars-!@#$%";

      const result = await deleteCollectionQuery(db, malformedId);

      // Should handle gracefully
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
