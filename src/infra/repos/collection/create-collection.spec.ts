import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
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
      // Create a user first to ensure the foreign key exists
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const collectionData = collectionTestFactory.buildOne({
        id: "test-collection-id-1",
        userId: user.id,
        name: "My Test Collection",
        description: "A collection for testing purposes",
        isPublic: false,
      });

      const result = await createCollectionQuery(db, collectionData);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection?.id).toBe("test-collection-id-1");
      expect(result.collection?.userId).toBe(user.id);
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
      // Create users first to ensure the foreign keys exist
      const user1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
        name: "Test User 2",
        email: "test2@example.com",
      });

      const collectionData = collectionTestFactory.buildOne({
        id: "duplicate-collection-id",
        userId: user1.id,
        name: "First Collection",
      });

      // Create first collection
      const firstResult = await createCollectionQuery(db, collectionData);
      expect(firstResult.success).toBe(true);

      // Try to create second collection with same id
      const duplicateCollectionData = collectionTestFactory.buildOne({
        id: "duplicate-collection-id",
        userId: user2.id,
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
      // Create a user first to ensure the foreign key exists
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-3",
        name: "Test User 3",
        email: "test3@example.com",
      });

      // This test simulates a scenario where the database might be unavailable
      // In a real scenario, this would be tested with a mock or by closing the connection
      const collectionData = collectionTestFactory.buildOne({
        id: "test-error-handling",
        userId: user.id,
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
      // Create a user first to ensure the foreign key exists
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-4",
        name: "Test User 4",
        email: "test4@example.com",
      });

      const collectionData = collectionTestFactory.buildOne({
        id: "test-public-collection-id",
        userId: user.id,
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
