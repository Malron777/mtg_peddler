import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllCollectionItemsQuery } from "./get-all-collection-items.query";

describe("getAllCollectionItemsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve collection items with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test collection items
      await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
        collectionId: "test-collection-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
        quantity: 1,
        isFoil: false,
      });
      await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
        collectionId: "test-collection-id-2",
        cardScryfallId: "test-card-scryfall-id-2",
        quantity: 2,
        isFoil: true,
      });

      const result = await getAllCollectionItemsQuery(db);

      expect(result.collectionItems).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.collectionItems[0].cardScryfallId).toBe(
        "test-card-scryfall-id-2"
      ); // Ordered by createdAt desc
      expect(result.collectionItems[1].cardScryfallId).toBe(
        "test-card-scryfall-id-1"
      );
    });
  });

  it("should return empty results when no collection items exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCollectionItemsQuery(db);

      expect(result.collectionItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 5 collection items
      for (let i = 1; i <= 5; i++) {
        const card = await cardTestFactory.buildAndInsertOne(db, {
          scryfallId: `test-card-scryfall-id-${i}`,
        });
        const collection =
          await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
            id: `test-collection-id-${i}`,
          });
        await collectionItemTestFactory.buildAndInsertOne(db, {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: i,
        });
      }

      const result = await getAllCollectionItemsQuery(db, {
        page: 2,
        pageSize: 2,
      });

      expect(result.collectionItems).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination parameters", async () => {
    await runWithTestDb(async (db: DB) => {
      await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
        collectionId: "test-collection-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
        quantity: 1,
      });

      const result = await getAllCollectionItemsQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.collectionItems).toHaveLength(0);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order collection items by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const item1 =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
          createdAt: new Date("2023-01-01"),
        });

      const item2 =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-2",
          cardScryfallId: "test-card-scryfall-id-2",
          quantity: 2,
          createdAt: new Date("2023-01-02"),
        });

      const result = await getAllCollectionItemsQuery(db);

      expect(result.collectionItems).toHaveLength(2);
      expect(result.collectionItems[0].id).toBe(item2.id); // Most recent first
      expect(result.collectionItems[1].id).toBe(item1.id);
    });
  });

  it("should handle large page sizes", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 3 collection items
      for (let i = 1; i <= 3; i++) {
        const card = await cardTestFactory.buildAndInsertOne(db, {
          scryfallId: `test-card-scryfall-id-${i}`,
        });
        const collection =
          await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
            id: `test-collection-id-${i}`,
          });
        await collectionItemTestFactory.buildAndInsertOne(db, {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: i,
        });
      }

      const result = await getAllCollectionItemsQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.collectionItems).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
