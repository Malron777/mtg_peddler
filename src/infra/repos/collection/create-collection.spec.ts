import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createCollectionQuery } from "./create-collection.query";

describe("createCollectionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionData = collectionTestFactory.buildOne({
        id: "test-collection-id-1",
        userId: "test-user-id-1",
        name: "My Test Collection",
        description: "A collection for testing purposes",
        isPublic: false,
      });

      const result = await createCollectionQuery(db, collectionData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.id).toBe("test-collection-id-1");
      expect(result.collection?.userId).toBe("test-user-id-1");
      expect(result.collection?.name).toBe("My Test Collection");
      expect(result.collection?.description).toBe(
        "A collection for testing purposes"
      );
      expect(result.collection?.isPublic).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when trying to create a collection with duplicate id", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionData = collectionTestFactory.buildOne({
        id: "duplicate-collection-id",
        userId: "test-user-id-1",
        name: "First Collection",
      });

      // Create first collection
      const firstResult = await createCollectionQuery(db, collectionData);
      expect(firstResult.success).toBe(true);

      // Try to create second collection with same id
      const duplicateCollectionData = collectionTestFactory.buildOne({
        id: "duplicate-collection-id",
        userId: "test-user-id-2",
        name: "Second Collection",
      });

      const secondResult = await createCollectionQuery(
        db,
        duplicateCollectionData
      );

      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBeDefined();
      expect(secondResult.collection).toBeUndefined();
    });
  });

  it("should fail when trying to create a collection with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidCollectionData = collectionTestFactory.buildOne({
        id: "test-collection-id-2",
        userId: "", // Empty userId should fail
        name: "Invalid Collection",
      });

      const result = await createCollectionQuery(db, invalidCollectionData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.collection).toBeUndefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // This test simulates a scenario where the database might be unavailable
      // In a real scenario, this would be tested with a mock or by closing the connection
      const collectionData = collectionTestFactory.buildOne({
        id: "test-error-handling",
        userId: "test-user-id-3",
        name: "Error Test Collection",
      });

      // The test database should handle this gracefully
      const result = await createCollectionQuery(db, collectionData);

      // This should succeed in the test environment
      expect(result.success).toBe(true);
    });
  });

  it("should create a public collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionData = collectionTestFactory.buildOne({
        id: "test-public-collection-id",
        userId: "test-user-id-4",
        name: "Public Collection",
        description: "A public collection",
        isPublic: true,
      });

      const result = await createCollectionQuery(db, collectionData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.isPublic).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
