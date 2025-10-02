import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllCollectionsContainingCardQuery } from "./get-all-collections-containing-cards.query";

describe("getAllCollectionsContainingCardsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve collections containing a specific card", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db);
      const card2 = await cardTestFactory.buildAndInsertOne(db);

      // Create collections
      const collection1 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "Collection 1",
        });
      const collection2 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-2",
          name: "Collection 2",
        });
      const collection3 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-3",
          name: "Collection 3",
        });

      // Add the card to collections 1 and 2
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection1.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
      });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection2.id,
        cardScryfallId: card.scryfallId,
        quantity: 2,
      });

      // Add different card to collection 3
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection3.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
      });

      const result = await getAllCollectionsContainingCardQuery(
        db,
        card.scryfallId
      );

      expect(result.collections).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.collections[0].name).toBe("Collection 2"); // Ordered by createdAt desc
      expect(result.collections[1].name).toBe("Collection 1");
    });
  });

  it("should return empty results when no collections contain the card", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db);

      // Create collection with different card
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "Collection 1",
        });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
      });

      const result = await getAllCollectionsContainingCardQuery(
        db,
        "not-the-same-card-scryfall-id"
      );

      expect(result.collections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent card", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentCardScryfallId = "non-existent-card-scryfall-id";

      const result = await getAllCollectionsContainingCardQuery(
        db,
        nonExistentCardScryfallId
      );

      expect(result.collections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db);

      // Create 5 collections with the card
      for (let i = 1; i <= 5; i++) {
        const collection =
          await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
            userId: `test-user-id-${i}`,
            name: `Collection ${i}`,
          });
        await collectionItemTestFactory.buildAndInsertOne(db, {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: i,
        });
      }

      const result = await getAllCollectionsContainingCardQuery(
        db,
        card.scryfallId,
        {
          page: 2,
          pageSize: 2,
        }
      );

      expect(result.collections).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order collections by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db);

      const collection1 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-1",
          name: "First Collection",
          createdAt: new Date("2023-01-01"),
        });
      const collection2 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(db, {
          userId: "test-user-id-2",
          name: "Second Collection",
          createdAt: new Date("2023-01-02"),
        });

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection1.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
      });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection2.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
      });

      const result = await getAllCollectionsContainingCardQuery(
        db,
        card.scryfallId
      );

      expect(result.collections).toHaveLength(2);
      expect(result.collections[0].id).toBe(collection2.id); // Most recent first
      expect(result.collections[1].id).toBe(collection1.id);
    });
  });

  it("should handle empty cardScryfallId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCollectionsContainingCardQuery(db, "");

      expect(result.collections).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
