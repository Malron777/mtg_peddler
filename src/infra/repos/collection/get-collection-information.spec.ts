import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { dealItemTestFactory } from "@/src/domain/tcg/deal-item.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { randomUUID } from "crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { priceHistory } from "../../db/schema";
import { getCollectionInformationQuery } from "./get-collection-information.query";

describe("getCollectionInformationQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return empty result for user with no collections", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const user = await userTestFactory.buildAndInsertOne(testDb);

      const result = await getCollectionInformationQuery(testDb, user.id);

      expect(result.collections).toHaveLength(0);
      expect(result.totalCards).toBe(0);
      expect(result.totalValue).toBe(0);
      expect(result.totalDeals).toBe(0);
    });
  });

  it("should return collection information with card counts and values", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const user = await userTestFactory.buildAndInsertOne(testDb);
      const card1 = await cardTestFactory.buildAndInsertOne(testDb);
      const card2 = await cardTestFactory.buildAndInsertOne(testDb);
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb, {
          userId: user.id,
        });

      // Create collection items
      const item1 = await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection.id,
        cardScryfallId: card1.scryfallId,
        quantity: 2,
        customPrice: "10.00",
      });

      const item2 = await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection.id,
        cardScryfallId: card2.scryfallId,
        quantity: 1,
        customPrice: "5.00",
      });

      // Add price history for market price calculation
      await testDb.insert(priceHistory).values([
        {
          id: randomUUID(),
          cardScryfallId: card1.scryfallId,
          source: "tcg",
          price: "8.00",
          currency: "USD",
          fetchedAt: new Date(),
        },
        {
          id: randomUUID(),
          cardScryfallId: card2.scryfallId,
          source: "tcg",
          price: "3.00",
          currency: "USD",
          fetchedAt: new Date(),
        },
      ]);

      const result = await getCollectionInformationQuery(testDb, user.id);

      expect(result.collections).toHaveLength(1);
      expect(result.totalCards).toBe(3); // 2 + 1
      expect(result.totalValue).toBe(25); // (2 * 10) + (1 * 5)
      expect(result.totalDeals).toBe(0);

      const collectionInfo = result.collections[0];
      expect(collectionInfo.id).toBe(collection.id);
      expect(collectionInfo.name).toBe(collection.name);
      expect(collectionInfo.cardCount).toBe(3);
      expect(collectionInfo.totalValue).toBe(25);
      expect(collectionInfo.dealCount).toBe(0);
      expect(collectionInfo.breakdown.customPriceValue).toBe(25);
      expect(collectionInfo.breakdown.marketPriceValue).toBe(0);
    });
  });

  it("should calculate deal counts correctly", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const user = await userTestFactory.buildAndInsertOne(testDb);
      const buyer = await userTestFactory.buildAndInsertOne(testDb);
      const card = await cardTestFactory.buildAndInsertOne(testDb);
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb, {
          userId: user.id,
        });

      // Create collection item
      const item = await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        customPrice: "10.00",
      });

      // Create deals
      const deal1 = await dealTestFactory.buildAndInsertOne(testDb, {
        sellerId: user.id,
        buyerId: buyer.id,
        totalAmount: "10.00",
      });

      const deal2 = await dealTestFactory.buildAndInsertOne(testDb, {
        sellerId: user.id,
        buyerId: buyer.id,
        totalAmount: "15.00",
      });

      // Create deal items
      await dealItemTestFactory.buildAndInsertOne(testDb, {
        dealId: deal1.id,
        collectionItemId: item.id,
        agreedPrice: "10.00",
        quantity: 1,
      });

      await dealItemTestFactory.buildAndInsertOne(testDb, {
        dealId: deal2.id,
        collectionItemId: item.id,
        agreedPrice: "15.00",
        quantity: 1,
      });

      const result = await getCollectionInformationQuery(testDb, user.id);

      expect(result.collections).toHaveLength(1);
      expect(result.totalDeals).toBe(2);

      const collectionInfo = result.collections[0];
      expect(collectionInfo.dealCount).toBe(2);
    });
  });

  it("should handle multiple collections correctly", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const user = await userTestFactory.buildAndInsertOne(testDb);
      const card = await cardTestFactory.buildAndInsertOne(testDb);

      // Create multiple collections
      const collection1 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb, {
          userId: user.id,
          name: "Collection 1",
        });

      const collection2 =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb, {
          userId: user.id,
          name: "Collection 2",
        });

      // Add items to both collections
      await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection1.id,
        cardScryfallId: card.scryfallId,
        quantity: 2,
        customPrice: "10.00",
      });

      await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection2.id,
        cardScryfallId: card.scryfallId,
        quantity: 3,
        customPrice: "5.00",
      });

      const result = await getCollectionInformationQuery(testDb, user.id);

      expect(result.collections).toHaveLength(2);
      expect(result.totalCards).toBe(5); // 2 + 3
      expect(result.totalValue).toBe(35); // (2 * 10) + (3 * 5)
      expect(result.totalDeals).toBe(0);

      // Check individual collection totals
      const collection1Info = result.collections.find(
        (c) => c.id === collection1.id
      );
      const collection2Info = result.collections.find(
        (c) => c.id === collection2.id
      );

      expect(collection1Info?.cardCount).toBe(2);
      expect(collection1Info?.totalValue).toBe(20);
      expect(collection2Info?.cardCount).toBe(3);
      expect(collection2Info?.totalValue).toBe(15);
    });
  });

  it("should handle foil cards with multiplier", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const user = await userTestFactory.buildAndInsertOne(testDb);
      const card = await cardTestFactory.buildAndInsertOne(testDb);
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb, {
          userId: user.id,
        });

      // Create foil and non-foil items
      await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        isFoil: false,
        customPrice: "10.00",
      });

      await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 1,
        isFoil: true,
        customPrice: "15.00",
      });

      const result = await getCollectionInformationQuery(testDb, user.id, {
        includeFoil: true,
      });

      expect(result.collections).toHaveLength(1);
      expect(result.totalCards).toBe(2);
      expect(result.totalValue).toBe(25); // 10 + 15

      const collectionInfo = result.collections[0];
      expect(collectionInfo.breakdown.foilValue).toBe(15);
      expect(collectionInfo.breakdown.nonFoilValue).toBe(10);
    });
  });

  it("should use market prices when custom prices are not available", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const user = await userTestFactory.buildAndInsertOne(testDb);
      const card = await cardTestFactory.buildAndInsertOne(testDb);
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb, {
          userId: user.id,
        });

      // Create item without custom price
      await collectionItemTestFactory.buildAndInsertOne(testDb, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 2,
        customPrice: null,
        priceSource: "tcg",
      });

      // Add price history
      await testDb.insert(priceHistory).values({
        id: randomUUID(),
        cardScryfallId: card.scryfallId,
        source: "tcg",
        price: "12.50",
        currency: "USD",
        fetchedAt: new Date(),
      });

      const result = await getCollectionInformationQuery(testDb, user.id);

      expect(result.collections).toHaveLength(1);
      expect(result.totalCards).toBe(2);
      expect(result.totalValue).toBe(25); // 2 * 12.50

      const collectionInfo = result.collections[0];
      expect(collectionInfo.breakdown.marketPriceValue).toBe(25);
      expect(collectionInfo.breakdown.customPriceValue).toBe(0);
    });
  });

  it("should handle collections with no items", async () => {
    await runWithTestDb(async (testDb: DB) => {
      const user = await userTestFactory.buildAndInsertOne(testDb);
      const collection =
        await collectionTestFactory.buildAndInsertOneWithDependencies(testDb, {
          userId: user.id,
        });

      const result = await getCollectionInformationQuery(testDb, user.id);

      expect(result.collections).toHaveLength(1);
      expect(result.totalCards).toBe(0);
      expect(result.totalValue).toBe(0);
      expect(result.totalDeals).toBe(0);

      const collectionInfo = result.collections[0];
      expect(collectionInfo.cardCount).toBe(0);
      expect(collectionInfo.totalValue).toBe(0);
      expect(collectionInfo.dealCount).toBe(0);
    });
  });
});
