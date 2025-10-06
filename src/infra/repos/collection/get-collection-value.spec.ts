import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getCollectionValueQuery } from "./get-collection-value.query";

describe("getCollectionValueQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should calculate collection value with market prices", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user and collection
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Test Collection",
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
        price: "1.50",
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
        collectionId: collection.id,
        cardScryfallId: card1.scryfallId,
        quantity: 2,
        condition: "NM",
        isFoil: false,
        priceSource: "tcg",
      });
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        priceSource: "tcg",
      });

      const result = await getCollectionValueQuery(db, collection.id);

      expect(result.collectionId).toBe(collection.id);
      expect(result.totalValue).toBe(5.0); // (1.50 * 2) + (2.00 * 1)
      expect(result.itemCount).toBe(3);
      expect(result.breakdown.marketPriceValue).toBe(5.0);
      expect(result.breakdown.customPriceValue).toBe(0);
      expect(result.breakdown.nonFoilValue).toBe(5.0);
      expect(result.breakdown.foilValue).toBe(0);
    });
  });

  it("should calculate collection value with custom prices", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user and collection
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Test Collection",
      });

      // Create test card
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create collection item with custom price
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 3,
        condition: "NM",
        isFoil: false,
        customPrice: "5.00",
        priceSource: "custom",
      });

      const result = await getCollectionValueQuery(db, collection.id);

      expect(result.collectionId).toBe(collection.id);
      expect(result.totalValue).toBe(15.0); // 5.00 * 3
      expect(result.itemCount).toBe(3);
      expect(result.breakdown.customPriceValue).toBe(15.0);
      expect(result.breakdown.marketPriceValue).toBe(0);
    });
  });

  it("should apply foil multiplier when includeFoil is true", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user and collection
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Test Collection",
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
      });

      const result = await getCollectionValueQuery(db, collection.id, {
        includeFoil: true,
      });

      expect(result.totalValue).toBe(3.0); // 2.00 * 1.5 (foil multiplier)
      expect(result.breakdown.foilValue).toBe(3.0);
      expect(result.breakdown.nonFoilValue).toBe(0);
    });
  });

  it("should not apply foil multiplier when includeFoil is false", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user and collection
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Test Collection",
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
      });

      const result = await getCollectionValueQuery(db, collection.id, {
        includeFoil: false,
      });

      expect(result.totalValue).toBe(2.0); // No foil multiplier applied
      expect(result.breakdown.foilValue).toBe(0);
      expect(result.breakdown.nonFoilValue).toBe(2.0);
    });
  });

  it("should return zero values for empty collection", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user and collection
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Empty Collection",
      });

      const result = await getCollectionValueQuery(db, collection.id);

      expect(result.collectionId).toBe(collection.id);
      expect(result.totalValue).toBe(0);
      expect(result.itemCount).toBe(0);
      expect(result.breakdown.foilValue).toBe(0);
      expect(result.breakdown.nonFoilValue).toBe(0);
      expect(result.breakdown.customPriceValue).toBe(0);
      expect(result.breakdown.marketPriceValue).toBe(0);
    });
  });

  it("should handle mixed pricing sources", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user and collection
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
      });

      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Mixed Collection",
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

      // Create collection items - one with custom price, one with market price
      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card1.scryfallId,
        quantity: 2,
        condition: "NM",
        isFoil: false,
        priceSource: "tcg",
      });

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
        condition: "NM",
        isFoil: false,
        customPrice: "5.00",
        priceSource: "custom",
      });

      const result = await getCollectionValueQuery(db, collection.id);

      expect(result.totalValue).toBe(7.0); // (1.00 * 2) + (5.00 * 1)
      expect(result.breakdown.marketPriceValue).toBe(2.0);
      expect(result.breakdown.customPriceValue).toBe(5.0);
    });
  });
});
