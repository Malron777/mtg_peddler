import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllCardsForCollectionQuery } from "./get-all-cards-for-collection.query";

describe("getAllCardsForCollectionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all cards for a collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {});
      // Create a collection
      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: user.id,
        name: "Test Collection",
        description: "A test collection",
        isPublic: false,
      });

      // Create cards
      const card1 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/lightning-bolt.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const card2 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-2",
        oracleId: "test-oracle-id-2",
        name: "Counterspell",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/counterspell.jpg" },
        pricesLastUpdated: new Date("2023-01-02"),
        cachedData: { manaCost: "{U}{U}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-02"),
      });

      // Create collection items
      await collectionItemTestFactory.insertOne(db, {
        id: "collection-item-1",
        collectionId: collection.id,
        cardScryfallId: card1.scryfallId,
        quantity: 2,
        condition: "NM",
        isFoil: false,
      });

      await collectionItemTestFactory.insertOne(db, {
        id: "collection-item-2",
        collectionId: collection.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
        condition: "LP",
        isFoil: true,
      });

      const result = await getAllCardsForCollectionQuery(db, collection.id);

      expect(result.cards).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.cards.some((c) => c.scryfallId === card1.scryfallId)).toBe(
        true
      );
      expect(result.cards.some((c) => c.scryfallId === card2.scryfallId)).toBe(
        true
      );
    });
  });

  it("should return empty result when collection has no cards", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {});

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-2",
        userId: user.id,
        name: "Empty Collection",
        description: "An empty collection",
        isPublic: false,
      });

      const result = await getAllCardsForCollectionQuery(db, collection.id);

      expect(result.cards).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty result for non-existent collection", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCardsForCollectionQuery(
        db,
        "non-existent-collection-id"
      );

      expect(result.cards).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {});

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-3",
        userId: user.id,
        name: "Large Collection",
        description: "A large collection",
        isPublic: false,
      });

      // Create multiple cards
      for (let i = 1; i <= 5; i++) {
        const card = await cardTestFactory.insertOne(db, {
          scryfallId: `test-scryfall-id-${i}`,
          oracleId: `test-oracle-id-${i}`,
          name: `Test Card ${i}`,
          setCode: "M21",
          setName: "Core Set 2021",
          imageUris: { normal: `https://example.com/card${i}.jpg` },
          pricesLastUpdated: new Date(
            `2023-01-${i.toString().padStart(2, "0")}`
          ),
          cachedData: { manaCost: `{${i}}`, type: "Instant" },
          lastFetchedAt: new Date(`2023-01-${i.toString().padStart(2, "0")}`),
        });

        await collectionItemTestFactory.insertOne(db, {
          id: `collection-item-${i}`,
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 1,
          condition: "NM",
          isFoil: false,
        });
      }

      const result = await getAllCardsForCollectionQuery(db, collection.id, {
        page: 2,
        pageSize: 2,
      });

      expect(result.cards).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle duplicate cards in collection (same card, different conditions)", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {});

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-4",
        userId: user.id,
        name: "Duplicate Collection",
        description: "Collection with duplicate cards",
        isPublic: false,
      });

      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-duplicate",
        oracleId: "test-oracle-id-duplicate",
        name: "Duplicate Card",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/duplicate.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      // Add same card with different conditions
      await collectionItemTestFactory.insertOne(db, {
        id: "collection-item-1",
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
      });

      await collectionItemTestFactory.insertOne(db, {
        id: "collection-item-2",
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "LP",
        isFoil: true,
      });

      const result = await getAllCardsForCollectionQuery(db, collection.id);

      // Should only return the card once (distinct by scryfallId)
      expect(result.cards).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.cards[0].scryfallId).toBe(card.scryfallId);
    });
  });
});
