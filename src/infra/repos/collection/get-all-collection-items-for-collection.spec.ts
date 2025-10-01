import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllCollectionItemsForCollectionQuery } from "./get-all-collection-items-for-collection.query";

describe("getAllCollectionItemsForCollectionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve collection items for a specific collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionId = "test-collection-id-1";

      // Create collection items for the collection
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId,
        cardScryfallId: "test-card-scryfall-id-1",
        quantity: 1,
        isFoil: false,
      });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId,
        cardScryfallId: "test-card-scryfall-id-2",
        quantity: 2,
        isFoil: true,
      });

      // Create collection item for different collection
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: "test-collection-id-2",
        cardScryfallId: "test-card-scryfall-id-3",
        quantity: 1,
        isFoil: false,
      });

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        collectionId
      );

      expect(result.collectionItems).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.collectionItems[0].collectionId).toBe(collectionId);
      expect(result.collectionItems[1].collectionId).toBe(collectionId);
    });
  });

  it("should return empty results for collection with no items", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionId = "test-collection-with-no-items";

      // Create collection item for different collection
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: "test-collection-id-2",
        cardScryfallId: "test-card-scryfall-id-1",
        quantity: 1,
      });

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        collectionId
      );

      expect(result.collectionItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentCollectionId = "non-existent-collection-id";

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        nonExistentCollectionId
      );

      expect(result.collectionItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionId = "test-collection-id-1";

      // Create 5 collection items for the collection
      for (let i = 1; i <= 5; i++) {
        await collectionItemTestFactory.buildAndInsertOne(db, {
          collectionId,
          cardScryfallId: `test-card-scryfall-id-${i}`,
          quantity: i,
        });
      }

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        collectionId,
        {
          page: 2,
          pageSize: 2,
        }
      );

      expect(result.collectionItems).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order collection items by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionId = "test-collection-id-1";

      const item1 = await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId,
        cardScryfallId: "test-card-scryfall-id-1",
        quantity: 1,
        createdAt: new Date("2023-01-01"),
      });

      const item2 = await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId,
        cardScryfallId: "test-card-scryfall-id-2",
        quantity: 2,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        collectionId
      );

      expect(result.collectionItems).toHaveLength(2);
      expect(result.collectionItems[0].id).toBe(item2.id); // Most recent first
      expect(result.collectionItems[1].id).toBe(item1.id);
    });
  });

  it("should handle empty collectionId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCollectionItemsForCollectionQuery(db, "");

      expect(result.collectionItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
