import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteCollectionItemQuery } from "./delete-collection-item.query";

describe("deleteCollectionItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete a collection item", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionItem =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 2,
        });

      const result = await deleteCollectionItemQuery(db, collectionItem.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent collection item gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-collection-item-id";

      const result = await deleteCollectionItemQuery(db, nonExistentId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteCollectionItemQuery(db, "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteCollectionItemQuery(
        db,
        null as unknown as string
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await deleteCollectionItemQuery(db, malformedId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await deleteCollectionItemQuery(
        invalidDb as unknown as DB,
        "test-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
