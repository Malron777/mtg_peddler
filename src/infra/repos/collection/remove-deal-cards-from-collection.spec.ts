import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { dealItemTestFactory } from "@/src/domain/tcg/deal-item.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { collectionItems } from "../../db/schema/tcg";
import { removeDealCardsFromCollectionQuery } from "./remove-deal-cards-from-collection.query";

describe("removeDealCardsFromCollectionQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should remove cards from collection based on deal items", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@example.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@example.com",
        name: "Test Buyer",
      });

      // Create deal
      const deal = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "accepted",
        totalAmount: "100.00",
      });

      // Create collection
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: seller.id,
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

      // Create collection items
      const collectionItem1 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection.id,
          cardScryfallId: card1.scryfallId,
          quantity: 3,
          condition: "NM",
          isFoil: false,
          listingType: "trade",
        }
      );

      const collectionItem2 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection.id,
          cardScryfallId: card2.scryfallId,
          quantity: 2,
          condition: "NM",
          isFoil: false,
          listingType: "trade",
        }
      );

      // Create deal items
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal.id,
        collectionItemId: collectionItem1.id,
        agreedPrice: "1.50",
        quantity: 2,
      });

      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal.id,
        collectionItemId: collectionItem2.id,
        agreedPrice: "2.00",
        quantity: 1,
      });

      const result = await removeDealCardsFromCollectionQuery(
        db,
        deal.id,
        collection.id
      );

      expect(result.success).toBe(true);
      expect(result.removedCards).toHaveLength(2);
      expect(result.totalCardsRemoved).toBe(3); // 2 + 1

      const card1Removal = result.removedCards.find(
        (c) => c.cardScryfallId === card1.scryfallId
      );
      const card2Removal = result.removedCards.find(
        (c) => c.cardScryfallId === card2.scryfallId
      );

      expect(card1Removal?.quantityRemoved).toBe(2);
      expect(card1Removal?.originalQuantity).toBe(3);

      expect(card2Removal?.quantityRemoved).toBe(1);
      expect(card2Removal?.originalQuantity).toBe(2);

      // Verify collection items were updated
      const updatedCollectionItems = await db
        .select()
        .from(collectionItems)
        .where(eq(collectionItems.collectionId, collection.id));

      expect(updatedCollectionItems).toHaveLength(2);

      const updatedItem1 = updatedCollectionItems.find(
        (item) => item.id === collectionItem1.id
      );
      const updatedItem2 = updatedCollectionItems.find(
        (item) => item.id === collectionItem2.id
      );

      expect(updatedItem1?.quantity).toBe(1); // 3 - 2
      expect(updatedItem2?.quantity).toBe(1); // 2 - 1
    });
  });

  it("should completely remove collection items when quantity matches", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@example.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@example.com",
        name: "Test Buyer",
      });

      // Create deal
      const deal = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "accepted",
        totalAmount: "50.00",
      });

      // Create collection
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: seller.id,
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

      // Create collection item
      const collectionItem = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 2,
          condition: "NM",
          isFoil: false,
          listingType: "trade",
        }
      );

      // Create deal item for exact quantity
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal.id,
        collectionItemId: collectionItem.id,
        agreedPrice: "1.50",
        quantity: 2,
      });

      const result = await removeDealCardsFromCollectionQuery(
        db,
        deal.id,
        collection.id
      );

      expect(result.success).toBe(true);
      expect(result.removedCards).toHaveLength(1);
      expect(result.totalCardsRemoved).toBe(2);

      // Verify collection item was completely removed
      const remainingCollectionItems = await db
        .select()
        .from(collectionItems)
        .where(eq(collectionItems.collectionId, collection.id));

      expect(remainingCollectionItems).toHaveLength(0);
    });
  });

  it("should handle dry run without actually removing cards", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@example.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@example.com",
        name: "Test Buyer",
      });

      // Create deal
      const deal = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "accepted",
        totalAmount: "50.00",
      });

      // Create collection
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: seller.id,
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

      // Create collection item
      const collectionItem = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 3,
          condition: "NM",
          isFoil: false,
          listingType: "trade",
        }
      );

      // Create deal item
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal.id,
        collectionItemId: collectionItem.id,
        agreedPrice: "1.50",
        quantity: 2,
      });

      const result = await removeDealCardsFromCollectionQuery(
        db,
        deal.id,
        collection.id,
        { dryRun: true }
      );

      expect(result.success).toBe(true);
      expect(result.removedCards).toHaveLength(1);
      expect(result.totalCardsRemoved).toBe(2);

      // Verify collection item was NOT actually modified
      const unchangedCollectionItems = await db
        .select()
        .from(collectionItems)
        .where(eq(collectionItems.collectionId, collection.id));

      expect(unchangedCollectionItems).toHaveLength(1);
      expect(unchangedCollectionItems[0].quantity).toBe(3); // Original quantity unchanged
    });
  });

  it("should return error when deal does not exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await removeDealCardsFromCollectionQuery(
        db,
        "non-existent-deal",
        "collection-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Deal not found");
      expect(result.removedCards).toHaveLength(0);
      expect(result.totalCardsRemoved).toBe(0);
    });
  });

  it("should return error when deal has no items", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@example.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@example.com",
        name: "Test Buyer",
      });

      // Create empty deal
      const deal = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "accepted",
        totalAmount: "0.00",
      });

      const result = await removeDealCardsFromCollectionQuery(
        db,
        deal.id,
        "collection-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("No items found in deal");
      expect(result.removedCards).toHaveLength(0);
      expect(result.totalCardsRemoved).toBe(0);
    });
  });

  it("should return error when no matching collection items found", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@example.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@example.com",
        name: "Test Buyer",
      });

      // Create deal
      const deal = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "accepted",
        totalAmount: "50.00",
      });

      // Create collection
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: seller.id,
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

      // Create collection item
      const collectionItem = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 2,
          condition: "NM",
          isFoil: false,
          listingType: "trade",
        }
      );

      // Create deal item
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal.id,
        collectionItemId: collectionItem.id,
        agreedPrice: "1.50",
        quantity: 1,
      });

      // Try to remove from different collection
      const result = await removeDealCardsFromCollectionQuery(
        db,
        deal.id,
        "different-collection-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("No matching collection items found");
      expect(result.removedCards).toHaveLength(0);
      expect(result.totalCardsRemoved).toBe(0);
    });
  });

  it("should limit removal to available quantity", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test users
      const seller = await userTestFactory.buildAndInsertOne(db, {
        email: "seller@example.com",
        name: "Test Seller",
      });

      const buyer = await userTestFactory.buildAndInsertOne(db, {
        email: "buyer@example.com",
        name: "Test Buyer",
      });

      // Create deal
      const deal = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: seller.id,
        buyerId: buyer.id,
        status: "accepted",
        totalAmount: "50.00",
      });

      // Create collection
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: seller.id,
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

      // Create collection item with quantity 2
      const collectionItem = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection.id,
          cardScryfallId: card.scryfallId,
          quantity: 2,
          condition: "NM",
          isFoil: false,
          listingType: "trade",
        }
      );

      // Create deal item requesting quantity 5 (more than available)
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal.id,
        collectionItemId: collectionItem.id,
        agreedPrice: "1.50",
        quantity: 5,
      });

      const result = await removeDealCardsFromCollectionQuery(
        db,
        deal.id,
        collection.id
      );

      expect(result.success).toBe(true);
      expect(result.removedCards).toHaveLength(1);
      expect(result.totalCardsRemoved).toBe(2); // Limited to available quantity

      const cardRemoval = result.removedCards[0];
      expect(cardRemoval.quantityRemoved).toBe(2); // Limited to available quantity
      expect(cardRemoval.originalQuantity).toBe(2);

      // Verify collection item was completely removed
      const remainingCollectionItems = await db
        .select()
        .from(collectionItems)
        .where(eq(collectionItems.collectionId, collection.id));

      expect(remainingCollectionItems).toHaveLength(0);
    });
  });
});
