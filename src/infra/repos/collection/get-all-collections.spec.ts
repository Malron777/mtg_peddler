import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllCollectionsQuery } from "./get-all-collections.query";

describe("getAllCollectionsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all collections with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert test collections
      const collection1 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-collection-id-1",
          userId: "test-user-id-1",
          name: "First Collection",
          description: "First collection description",
          isPublic: false,
        });

      const collection2 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-collection-id-2",
          userId: "test-user-id-2",
          name: "Second Collection",
          description: "Second collection description",
          isPublic: true,
        });

      const result = await getAllCollectionsQuery(db);

      expect(result.collections).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.collections.some((c) => c.id === collection1.id)).toBe(
        true
      );
      expect(result.collections.some((c) => c.id === collection2.id)).toBe(
        true
      );
    });
  });

  it("should return empty result when no collections exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCollectionsQuery(db);

      expect(result.collections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert multiple collections
      for (let i = 1; i <= 5; i++) {
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: `test-collection-id-${i}`,
          userId: `test-user-id-${i}`,
          name: `Test Collection ${i}`,
          description: `Test collection ${i} description`,
          isPublic: i % 2 === 0,
        });
      }

      const result = await getAllCollectionsQuery(db, { page: 2, pageSize: 2 });

      expect(result.collections).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination options gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
        id: "test-collection-id-1",
        userId: "test-user-id-1",
        name: "Test Collection",
        description: "Test collection description",
        isPublic: false,
      });

      const result = await getAllCollectionsQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.collections).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order collections by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const collection1 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-collection-id-1",
          userId: "test-user-id-1",
          name: "First Collection",
          description: "First collection description",
          isPublic: false,
          createdAt: new Date("2023-01-01"),
        });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const collection2 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-collection-id-2",
          userId: "test-user-id-2",
          name: "Second Collection",
          description: "Second collection description",
          isPublic: true,
          createdAt: new Date("2023-01-02"),
        });

      const result = await getAllCollectionsQuery(db);

      expect(result.collections).toHaveLength(2);
      expect(result.collections[0].id).toBe(collection2.id); // Most recent first
      expect(result.collections[1].id).toBe(collection1.id);
    });
  });

  it("should handle large page sizes gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a few collections
      for (let i = 1; i <= 3; i++) {
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          id: `test-collection-id-${i}`,
          userId: `test-user-id-${i}`,
          name: `Test Collection ${i}`,
          description: `Test collection ${i} description`,
          isPublic: i % 2 === 0,
        });
      }

      const result = await getAllCollectionsQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.collections).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
