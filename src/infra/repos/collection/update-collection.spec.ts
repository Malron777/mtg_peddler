import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateCollectionQuery } from "./update-collection.query";

describe("updateCollectionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: "test-user-id-1",
        name: "Original Name",
        description: "Original Description",
        isPublic: false,
      });

      const updateData = {
        id: collection.id,
        name: "Updated Name",
        description: "Updated Description",
        isPublic: true,
      };

      const result = await updateCollectionQuery(db, updateData);

      expect(result.id).toBe(collection.id);
      expect(result.name).toBe("Updated Name");
      expect(result.description).toBe("Updated Description");
      expect(result.isPublic).toBe(true);
      expect(result.userId).toBe(collection.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        collection.updatedAt.getTime()
      );
    });
  });

  it("should throw error when trying to update non-existent collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-collection-id",
        name: "Updated Name",
      };

      await expect(updateCollectionQuery(db, updateData)).rejects.toThrow();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-2",
        userId: "test-user-id-2",
        name: "Original Name",
        description: "Original Description",
        isPublic: false,
      });

      const updateData = {
        id: collection.id,
        name: "Only Name Updated",
      };

      const result = await updateCollectionQuery(db, updateData);

      expect(result.id).toBe(collection.id);
      expect(result.name).toBe("Only Name Updated");
      expect(result.description).toBe(collection.description); // Should remain unchanged
      expect(result.isPublic).toBe(collection.isPublic); // Should remain unchanged
      expect(result.userId).toBe(collection.userId); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-3",
        userId: "test-user-id-3",
        name: "Original Name",
        description: "Original Description",
        isPublic: false,
      });

      const updateData = {
        id: collection.id,
      };

      const result = await updateCollectionQuery(db, updateData);

      expect(result.id).toBe(collection.id);
      expect(result.name).toBe(collection.name); // Should remain unchanged
      expect(result.description).toBe(collection.description); // Should remain unchanged
      expect(result.isPublic).toBe(collection.isPublic); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-4",
        userId: "test-user-id-4",
        name: "Original Name",
        description: "Original Description",
        isPublic: false,
      });

      const updateData = {
        id: collection.id,
        name: "", // Empty name should fail
        description: null as unknown as string, // Null description
      };

      await expect(updateCollectionQuery(db, updateData)).rejects.toThrow();
    });
  });
});
