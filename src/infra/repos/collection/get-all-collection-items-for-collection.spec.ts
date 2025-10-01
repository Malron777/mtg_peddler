import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
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
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: user.id,
        name: "Test Collection",
        description: "A test collection",
        isPublic: false,
      });

      const card1 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Card 1",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card1.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const card2 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-2",
        oracleId: "test-oracle-id-2",
        name: "Test Card 2",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card2.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{U}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const card3 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-3",
        oracleId: "test-oracle-id-3",
        name: "Test Card 3",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card3.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{G}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      // Create collection items for the collection
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card1.scryfallId,
        quantity: 1,
        isFoil: false,
      });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card2.scryfallId,
        quantity: 2,
        isFoil: true,
      });

      // Create collection item for different collection
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: "test-collection-id-2",
        cardScryfallId: card3.scryfallId,
        quantity: 1,
        isFoil: false,
      });

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        collection.id
      );

      expect(result.collectionItems).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.collectionItems[0].collectionId).toBe(collection.id);
      expect(result.collectionItems[1].collectionId).toBe(collection.id);
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
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: user.id,
        name: "Test Collection",
        description: "A test collection",
        isPublic: false,
      });

      // Create 5 collection items for the collection
      for (let i = 1; i <= 5; i++) {
        const card = await cardTestFactory.insertOne(db, {
          scryfallId: `test-card-scryfall-id-${i}`,
          oracleId: `test-oracle-id-${i}`,
          name: `Test Card ${i}`,
          setCode: "M21",
          setName: "Core Set 2021",
          imageUris: { normal: `https://example.com/card${i}.jpg` },
          pricesLastUpdated: new Date("2023-01-01"),
          cachedData: { manaCost: `{${i}}`, type: "Instant" },
          lastFetchedAt: new Date("2023-01-01"),
        });

        await collectionItemTestFactory.buildAndInsertOne(db, {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: i,
        });
      }

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        collection.id,
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
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: user.id,
        name: "Test Collection",
        description: "A test collection",
        isPublic: false,
      });

      const card1 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Card 1",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card1.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const card2 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-2",
        oracleId: "test-oracle-id-2",
        name: "Test Card 2",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card2.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{U}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const item1 = await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card1.scryfallId,
        quantity: 1,
        createdAt: new Date("2023-01-01"),
      });

      const item2 = await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card2.scryfallId,
        quantity: 2,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllCollectionItemsForCollectionQuery(
        db,
        collection.id
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
