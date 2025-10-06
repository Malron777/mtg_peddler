import { storesTestFactory } from "@/src/domain/auth/stores.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllStoresQuery } from "./get-all-stores.query";

describe("getAllStoresQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all stores with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert test stores
      const store1 = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-1",
          name: "First Magic Store",
          websiteUrl: "https://firstmagicstore.com",
          physicalAddress: "123 First Street, Test City",
          description: "First test store for Magic: The Gathering cards",
          isVerified: false,
          createdBy: "test-user-id-1",
        }
      );

      const store2 = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-2",
          name: "Second Magic Store",
          websiteUrl: "https://secondmagicstore.com",
          physicalAddress: "456 Second Street, Test City",
          description: "Second test store for Magic: The Gathering cards",
          isVerified: true,
          createdBy: "test-user-id-2",
        }
      );

      const result = await getAllStoresQuery(db);

      expect(result.stores).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.stores.some((s) => s.id === store1.id)).toBe(true);
      expect(result.stores.some((s) => s.id === store2.id)).toBe(true);
    });
  });

  it("should return empty result when no stores exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllStoresQuery(db);

      expect(result.stores).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert multiple stores
      for (let i = 1; i <= 5; i++) {
        await storesTestFactory.buildAndInsertOneWithDependencies(db, {
          id: `test-store-id-${i}`,
          name: `Test Store ${i}`,
          websiteUrl: `https://teststore${i}.com`,
          physicalAddress: `${i}23 Test Street, Test City`,
          description: `Test store ${i} for Magic: The Gathering cards`,
          isVerified: i % 2 === 0,
          createdBy: `test-user-id-${i}`,
        });
      }

      const result = await getAllStoresQuery(db, { page: 2, pageSize: 2 });

      expect(result.stores).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination options gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      await storesTestFactory.buildAndInsertOneWithDependencies(db, {
        id: "test-store-id-1",
        name: "Test Store",
        websiteUrl: "https://teststore.com",
        physicalAddress: "123 Test Street, Test City",
        description: "Test store for Magic: The Gathering cards",
        isVerified: false,
        createdBy: "test-user-id-1",
      });

      const result = await getAllStoresQuery(db, { page: 0, pageSize: -1 });

      expect(result.stores).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order stores by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const store1 = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-1",
          name: "First Store",
          websiteUrl: "https://firststore.com",
          physicalAddress: "123 First Street, Test City",
          description: "First test store",
          isVerified: false,
          createdBy: "test-user-id-1",
          createdAt: new Date("2023-01-01"),
        }
      );

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const store2 = await storesTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          id: "test-store-id-2",
          name: "Second Store",
          websiteUrl: "https://secondstore.com",
          physicalAddress: "456 Second Street, Test City",
          description: "Second test store",
          isVerified: true,
          createdBy: "test-user-id-2",
          createdAt: new Date("2023-01-02"),
        }
      );

      const result = await getAllStoresQuery(db);

      expect(result.stores).toHaveLength(2);
      expect(result.stores[0].id).toBe(store2.id); // Most recent first
      expect(result.stores[1].id).toBe(store1.id);
    });
  });

  it("should handle large page sizes gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a few stores
      for (let i = 1; i <= 3; i++) {
        await storesTestFactory.buildAndInsertOneWithDependencies(db, {
          id: `test-store-id-${i}`,
          name: `Test Store ${i}`,
          websiteUrl: `https://teststore${i}.com`,
          physicalAddress: `${i}23 Test Street, Test City`,
          description: `Test store ${i}`,
          isVerified: i % 2 === 0,
          createdBy: `test-user-id-${i}`,
        });
      }

      const result = await getAllStoresQuery(db, { page: 1, pageSize: 1000 });

      expect(result.stores).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
