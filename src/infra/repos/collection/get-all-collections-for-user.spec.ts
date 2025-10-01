import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllCollectionsForUserQuery } from "./get-all-collections-for-user.query";

describe("getAllCollectionsForUserQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all collections for a specific user", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create users first to ensure the foreign keys exist
      const user1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        id: "different-user-id",
        name: "Different User",
        email: "different@example.com",
      });

      // Create collections for the user
      const collection1 = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: user1.id,
        name: "First Collection",
        description: "First collection description",
        isPublic: false,
      });

      const collection2 = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-2",
        userId: user1.id,
        name: "Second Collection",
        description: "Second collection description",
        isPublic: true,
      });

      // Create a collection for a different user
      await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-3",
        userId: user2.id,
        name: "Other User Collection",
        description: "Other user collection description",
        isPublic: false,
      });

      const result = await getAllCollectionsForUserQuery(db, user1.id);

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
      expect(result.collections.every((c) => c.userId === user1.id)).toBe(true);
    });
  });

  it("should return empty result when user has no collections", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "user-with-no-collections";

      const result = await getAllCollectionsForUserQuery(db, userId);

      expect(result.collections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty result for non-existent user", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCollectionsForUserQuery(
        db,
        "non-existent-user-id"
      );

      expect(result.collections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a user first to ensure the foreign key exists
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-pagination",
        name: "Test User Pagination",
        email: "pagination@example.com",
      });

      // Create multiple collections for the user
      for (let i = 1; i <= 5; i++) {
        await collectionTestFactory.insertOne(db, {
          id: `test-collection-id-${i}`,
          userId: user.id,
          name: `Test Collection ${i}`,
          description: `Test collection ${i} description`,
          isPublic: i % 2 === 0,
        });
      }

      const result = await getAllCollectionsForUserQuery(db, user.id, {
        page: 2,
        pageSize: 2,
      });

      expect(result.collections).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order collections by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create a user first to ensure the foreign key exists
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-ordering",
        name: "Test User Ordering",
        email: "ordering@example.com",
      });

      const collection1 = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: user.id,
        name: "First Collection",
        description: "First collection description",
        isPublic: false,
        createdAt: new Date("2023-01-01"),
      });

      const collection2 = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-2",
        userId: user.id,
        name: "Second Collection",
        description: "Second collection description",
        isPublic: true,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllCollectionsForUserQuery(db, user.id);

      expect(result.collections).toHaveLength(2);
      expect(result.collections[0].id).toBe(collection2.id); // Most recent first
      expect(result.collections[1].id).toBe(collection1.id);
    });
  });

  it("should handle empty userId gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCollectionsForUserQuery(db, "");

      expect(result.collections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
