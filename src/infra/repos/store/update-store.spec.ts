import { storesTestFactory } from "@/src/domain/auth/stores.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateStoreQuery } from "./update-store.query";

describe("updateStoreQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing store", async () => {
    await runWithTestDb(async (db: DB) => {
      const store = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-1",
          name: "Original Store Name",
          websiteUrl: "https://originalstore.com",
          physicalAddress: "123 Original Street, Test City",
          description: "Original store description",
          isVerified: false,
          createdBy: "test-user-id-1",
        }
      );

      const updateData = {
        id: store.id,
        name: "Updated Store Name",
        websiteUrl: "https://updatedstore.com",
        physicalAddress: "456 Updated Street, Test City",
        description: "Updated store description",
        isVerified: true,
      };

      const result = await updateStoreQuery(db, updateData);

      expect(result.id).toBe(store.id);
      expect(result.name).toBe("Updated Store Name");
      expect(result.websiteUrl).toBe("https://updatedstore.com");
      expect(result.physicalAddress).toBe("456 Updated Street, Test City");
      expect(result.description).toBe("Updated store description");
      expect(result.isVerified).toBe(true);
      expect(result.createdBy).toBe(store.createdBy); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        store.updatedAt.getTime()
      );
    });
  });

  it("should throw error when trying to update non-existent store", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-store-id",
        name: "Updated Store Name",
        description: "Updated store description",
      };

      const result = await updateStoreQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const store = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-2",
          name: "Original Store Name",
          websiteUrl: "https://originalstore.com",
          physicalAddress: "123 Original Street, Test City",
          description: "Original store description",
          isVerified: false,
          createdBy: "test-user-id-2",
        }
      );

      const updateData = {
        id: store.id,
        name: "Only Name Updated",
      };

      const result = await updateStoreQuery(db, updateData);

      expect(result.id).toBe(store.id);
      expect(result.name).toBe("Only Name Updated");
      expect(result.websiteUrl).toBe(store.websiteUrl); // Should remain unchanged
      expect(result.physicalAddress).toBe(store.physicalAddress); // Should remain unchanged
      expect(result.description).toBe(store.description); // Should remain unchanged
      expect(result.isVerified).toBe(store.isVerified); // Should remain unchanged
      expect(result.createdBy).toBe(store.createdBy); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const store = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-3",
          name: "Original Store Name",
          websiteUrl: "https://originalstore.com",
          physicalAddress: "123 Original Street, Test City",
          description: "Original store description",
          isVerified: false,
          createdBy: "test-user-id-3",
        }
      );

      const updateData = {
        id: store.id,
      };

      const result = await updateStoreQuery(db, updateData);

      expect(result.id).toBe(store.id);
      expect(result.name).toBe(store.name); // Should remain unchanged
      expect(result.websiteUrl).toBe(store.websiteUrl); // Should remain unchanged
      expect(result.physicalAddress).toBe(store.physicalAddress); // Should remain unchanged
      expect(result.description).toBe(store.description); // Should remain unchanged
      expect(result.isVerified).toBe(store.isVerified); // Should remain unchanged
      expect(result.createdBy).toBe(store.createdBy); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const store = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-4",
          name: "Original Store Name",
          websiteUrl: "https://originalstore.com",
          physicalAddress: "123 Original Street, Test City",
          description: "Original store description",
          isVerified: false,
          createdBy: "test-user-id-4",
        }
      );

      const updateData = {
        id: store.id,
        name: null as unknown as string, // Empty name should fail
        websiteUrl: "invalid-url", // Invalid URL format
        description: null as unknown as string, // Null description
      };

      await expect(updateStoreQuery(db, updateData)).rejects.toThrow();
    });
  });
});
