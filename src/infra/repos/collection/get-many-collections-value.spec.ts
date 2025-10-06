import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getManyCollectionsValueQuery } from "./get-many-collections-value.query";

describe("getManyCollectionsValueQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should calculate values for multiple collections", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      // Create test collections
      const collection1 = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Collection 1",
      });

      const collection2 = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Collection 2",
      });

      // Create test cards
      const card1 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      const card2 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-2",
        oracleId: "oracle-2",
        name: "Counterspell",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create price history
      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card1.scryfallId,
        source: "tcg",
        price: "1.00",
        currency: "USD",
      });

      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card2.scryfallId,
        source: "tcg",
        price: "2.00",
        currency: "USD",
      });

      // Create collection items
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection1.id,
        cardScryfallId: card1.scryfallId,
        quantity: 2,
        condition: "NM",
        isFoil: false,
        priceSource: "tcg",
        customPrice: null,
      });

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection2.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        priceSource: "tcg",
        customPrice: null,
      });

      const result = await getManyCollectionsValueQuery(db, [
        collection1.id,
        collection2.id,
      ]);

      expect(result.collections).toHaveLength(2);
      expect(result.totalValue).toBe(4.0); // (1.00 * 2) + (2.00 * 1)
      expect(result.totalItemCount).toBe(3);

      const collection1Result = result.collections.find(
        (c) => c.collectionId === collection1.id
      );
      const collection2Result = result.collections.find(
        (c) => c.collectionId === collection2.id
      );

      expect(collection1Result?.totalValue).toBe(2.0);
      expect(collection1Result?.itemCount).toBe(2);
      expect(collection1Result?.collectionName).toBe("Collection 1");

      expect(collection2Result?.totalValue).toBe(2.0);
      expect(collection2Result?.itemCount).toBe(1);
      expect(collection2Result?.collectionName).toBe("Collection 2");
    });
  });

  it("should handle empty collection IDs array", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getManyCollectionsValueQuery(db, []);

      expect(result.collections).toHaveLength(0);
      expect(result.totalValue).toBe(0);
      expect(result.totalItemCount).toBe(0);
    });
  });

  it("should handle collections with no items", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      // Create empty collection
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Empty Collection",
      });

      const result = await getManyCollectionsValueQuery(db, [collection.id]);

      expect(result.collections).toHaveLength(1);
      expect(result.totalValue).toBe(0);
      expect(result.totalItemCount).toBe(0);

      const collectionResult = result.collections[0];
      expect(collectionResult.collectionId).toBe(collection.id);
      expect(collectionResult.collectionName).toBe("Empty Collection");
      expect(collectionResult.totalValue).toBe(0);
      expect(collectionResult.itemCount).toBe(0);
    });
  });

  it("should handle mixed pricing sources across collections", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      // Create test collections
      const collection1 = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Market Price Collection",
      });

      const collection2 = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Custom Price Collection",
      });

      // Create test cards
      const card1 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      const card2 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-2",
        oracleId: "oracle-2",
        name: "Counterspell",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create price history for card1
      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card1.scryfallId,
        source: "tcg",
        price: "1.00",
        currency: "USD",
      });

      // Create collection items
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection1.id,
        cardScryfallId: card1.scryfallId,
        quantity: 2,
        condition: "NM",
        isFoil: false,
        priceSource: "tcg",
        customPrice: null,
      });

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection2.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        customPrice: "5.00",
        priceSource: "custom",
      });

      const result = await getManyCollectionsValueQuery(db, [
        collection1.id,
        collection2.id,
      ]);

      expect(result.totalValue).toBe(7.0); // (1.00 * 2) + (5.00 * 1)

      const collection1Result = result.collections.find(
        (c) => c.collectionId === collection1.id
      );
      const collection2Result = result.collections.find(
        (c) => c.collectionId === collection2.id
      );

      expect(collection1Result?.breakdown.marketPriceValue).toBe(2.0);
      expect(collection1Result?.breakdown.customPriceValue).toBe(0);

      expect(collection2Result?.breakdown.marketPriceValue).toBe(0);
      expect(collection2Result?.breakdown.customPriceValue).toBe(5.0);
    });
  });

  it("should handle foil cards with multiplier", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      // Create test collection
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Foil Collection",
      });

      // Create test card
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create price history
      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card.scryfallId,
        source: "tcg",
        price: "2.00",
        currency: "USD",
      });

      // Create foil collection item
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: true,
        priceSource: "tcg",
        customPrice: null,
      });

      const result = await getManyCollectionsValueQuery(db, [collection.id], {
        includeFoil: true,
      });

      expect(result.totalValue).toBe(3.0); // 2.00 * 1.5 (foil multiplier)
      expect(result.collections[0].breakdown.foilValue).toBe(3.0);
      expect(result.collections[0].breakdown.nonFoilValue).toBe(0);
    });
  });

  it("should handle non-existent collection IDs", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getManyCollectionsValueQuery(db, [
        "non-existent-id",
      ]);

      expect(result.collections).toHaveLength(0);
      expect(result.totalValue).toBe(0);
      expect(result.totalItemCount).toBe(0);
    });
  });
});
