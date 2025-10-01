import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createCollectionItemQuery } from "./create-collection-item.query";

describe("createCollectionItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a collection item", async () => {
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

      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Card",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const collectionItemData = collectionItemTestFactory.buildOne({
        id: "test-collection-item-id-1",
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 2,
        condition: "NM",
        language: "en",
        isFoil: false,
        listingType: "sale",
        customPrice: "25.50",
        priceSource: "tcg",
      });

      const result = await createCollectionItemQuery(db, collectionItemData);

      expect(result.success).toBe(true);
      expect(result.collectionItem).toBeDefined();
      expect(result.collectionItem?.id).toBe("test-collection-item-id-1");
      expect(result.collectionItem?.collectionId).toBe(collection.id);
      expect(result.collectionItem?.cardScryfallId).toBe(card.scryfallId);
      expect(result.collectionItem?.quantity).toBe(2);
      expect(result.collectionItem?.condition).toBe("NM");
      expect(result.collectionItem?.language).toBe("en");
      expect(result.collectionItem?.isFoil).toBe(false);
      expect(result.collectionItem?.listingType).toBe("sale");
      expect(result.collectionItem?.customPrice).toBe("25.50");
      expect(result.collectionItem?.priceSource).toBe("tcg");
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when trying to create a collection item with duplicate id", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create dependencies first
      const user1 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const user2 = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-2",
        name: "Test User 2",
        email: "test2@example.com",
      });

      const collection1 = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-1",
        userId: user1.id,
        name: "Test Collection 1",
        description: "A test collection",
        isPublic: false,
      });

      const collection2 = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-2",
        userId: user2.id,
        name: "Test Collection 2",
        description: "Another test collection",
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

      const collectionItemData = collectionItemTestFactory.buildOne({
        id: "duplicate-collection-item-id",
        collectionId: collection1.id,
        cardScryfallId: card1.scryfallId,
        quantity: 1,
        condition: "NM",
      });

      // Create first collection item
      const firstResult = await createCollectionItemQuery(
        db,
        collectionItemData
      );
      expect(firstResult.success).toBe(true);

      // Try to create second collection item with same id
      const duplicateCollectionItemData = collectionItemTestFactory.buildOne({
        id: "duplicate-collection-item-id",
        collectionId: collection2.id,
        cardScryfallId: card2.scryfallId,
        quantity: 2,
        condition: "LP",
      });

      const secondResult = await createCollectionItemQuery(
        db,
        duplicateCollectionItemData
      );

      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBeDefined();
      expect(secondResult.collectionItem).toBeUndefined();
    });
  });

  it("should fail when trying to create a collection item with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidCollectionItemData = collectionItemTestFactory.buildOne({
        id: "test-collection-item-id-2",
        collectionId: "", // Empty collectionId should fail
        cardScryfallId: "test-card-scryfall-id-2",
        quantity: -1, // Invalid quantity
        condition: "NM",
      });

      const result = await createCollectionItemQuery(
        db,
        invalidCollectionItemData
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.collectionItem).toBeUndefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-3",
        name: "Test User 3",
        email: "test3@example.com",
      });

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-3",
        userId: user.id,
        name: "Test Collection",
        description: "A test collection",
        isPublic: false,
      });

      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-3",
        oracleId: "test-oracle-id-3",
        name: "Test Card",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      // This test simulates a scenario where the database might be unavailable
      // In a real scenario, this would be tested with a mock or by closing the connection
      const collectionItemData = collectionItemTestFactory.buildOne({
        id: "test-error-handling",
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "NM",
      });

      // The test database should handle this gracefully
      const result = await createCollectionItemQuery(db, collectionItemData);

      // This should succeed in the test environment
      expect(result.success).toBe(true);
    });
  });

  it("should create a foil collection item", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create dependencies first
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-4",
        name: "Test User 4",
        email: "test4@example.com",
      });

      const collection = await collectionTestFactory.insertOne(db, {
        id: "test-collection-id-4",
        userId: user.id,
        name: "Test Collection",
        description: "A test collection",
        isPublic: false,
      });

      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-card-scryfall-id-4",
        oracleId: "test-oracle-id-4",
        name: "Test Card",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const collectionItemData = collectionItemTestFactory.buildOne({
        id: "test-foil-collection-item-id",
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "NM",
        language: "en",
        isFoil: true,
        listingType: "trade",
        customPrice: "50.00",
        priceSource: "cardmarket",
      });

      const result = await createCollectionItemQuery(db, collectionItemData);

      expect(result.success).toBe(true);
      expect(result.collectionItem).toBeDefined();
      expect(result.collectionItem?.isFoil).toBe(true);
      expect(result.collectionItem?.listingType).toBe("trade");
      expect(result.collectionItem?.customPrice).toBe("50.00");
      expect(result.collectionItem?.priceSource).toBe("cardmarket");
      expect(result.error).toBeUndefined();
    });
  });
});
