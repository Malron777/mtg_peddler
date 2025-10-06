import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getCollectionQuery } from "./get-collection.query";

describe("getCollectionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-collection-id-1",
          name: "My Test Collection",
          description: "A collection for testing purposes",
          isPublic: false,
        });

      const result = await getCollectionQuery(db, collection.id);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.id).toBe(collection.id);
      expect(result.collection?.name).toBe("My Test Collection");
      expect(result.collection?.description).toBe(
        "A collection for testing purposes"
      );
      expect(result.collection?.isPublic).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when collection is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-collection-id";

      const result = await getCollectionQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Collection not found");
      expect(result.collection).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getCollectionQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Collection not found");
      expect(result.collection).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getCollectionQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.collection).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getCollectionQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Collection not found");
      expect(result.collection).toBeUndefined();
    });
  });

  it("should retrieve a public collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-public-collection-id",
          name: "Public Collection",
          description: "A public collection",
          isPublic: true,
        });

      const result = await getCollectionQuery(db, collection.id);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.isPublic).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
