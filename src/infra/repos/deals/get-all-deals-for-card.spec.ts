import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { dealItemTestFactory } from "@/src/domain/tcg/deal-item.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllDealsForCardQuery } from "./get-all-deals-for-card.query";

describe("getAllDealsForCardQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve deals for a specific card", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Card 1",
        setCode: "M21",
        setName: "Core Set 2021",
      });
      // Create deals
      const deal1 = await dealTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          sellerId: "test-seller-id-1",
          buyerId: "test-buyer-id-1",
          status: "negotiating" as const,
        }
      );
      const deal2 = await dealTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          sellerId: "test-seller-id-2",
          buyerId: "test-buyer-id-2",
          status: "negotiating" as const,
        }
      );
      const deal3 = await dealTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          sellerId: "test-seller-id-3",
          buyerId: "test-buyer-id-3",
          status: "negotiating" as const,
        }
      );

      const collection1 = await collectionTestFactory.buildAndInsertOne(db, {
        id: "test-collection-id-1",
        userId: "test-seller-id-1",
      });
      const collection2 = await collectionTestFactory.buildAndInsertOne(db, {
        id: "test-collection-id-2",
        userId: "test-seller-id-2",
      });
      const collection3 = await collectionTestFactory.buildAndInsertOne(db, {
        id: "test-collection-id-3",
        userId: "test-seller-id-3",
      });

      // Create collection items with the card
      const collectionItem1 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection1.id,
          cardScryfallId: card.scryfallId,
          quantity: 1,
        }
      );
      const collectionItem2 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection2.id,
          cardScryfallId: card.scryfallId,
          quantity: 2,
        }
      );
      const card2 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "test-card-scryfall-id-2",
        oracleId: "test-oracle-id-2",
        name: "Test Card 2",
        setCode: "M21",
        setName: "Core Set 2021",
      });
      const collectionItem3 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection3.id,
          cardScryfallId: card2.scryfallId,
          quantity: 1,
        }
      );

      // Create deal items linking deals to collection items with the card
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal1.id,
        collectionItemId: collectionItem1.id,
        agreedPrice: "10.00",
        quantity: 1,
      });
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal2.id,
        collectionItemId: collectionItem2.id,
        agreedPrice: "20.00",
        quantity: 2,
      });

      // Create deal item with different card
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal3.id,
        collectionItemId: collectionItem3.id,
        agreedPrice: "15.00",
        quantity: 1,
      });

      const result = await getAllDealsForCardQuery(db, card.scryfallId);

      expect(result.deals).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.deals[0].id).toBe(deal2.id); // Ordered by createdAt desc
      expect(result.deals[1].id).toBe(deal1.id);
    });
  });

  it("should return empty results when no deals contain the card", async () => {
    await runWithTestDb(async (db: DB) => {
      const cardScryfallId = "test-card-scryfall-id-not-found";

      // Create deal with different card
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating" as const,
      });
      const collectionItem =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
        });
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal.id,
        collectionItemId: collectionItem.id,
        agreedPrice: "10.00",
        quantity: 1,
      });

      const result = await getAllDealsForCardQuery(db, cardScryfallId);

      expect(result.deals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent card", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentCardScryfallId = "non-existent-card-scryfall-id";

      const result = await getAllDealsForCardQuery(
        db,
        nonExistentCardScryfallId
      );

      expect(result.deals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Card 1",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create 5 deals with the card
      for (let i = 1; i <= 5; i++) {
        const buyer = await userTestFactory.buildAndInsertOne(db, {
          id: `test-user-id-${i}`,
          name: `Test User ${i}`,
          email: `user${i}@example.com`,
        });
        const seller = await userTestFactory.buildAndInsertOne(db, {
          id: `test-seller-id-${i}`,
          name: `Test Seller ${i}`,
          email: `seller${i}@example.com`,
        });
        const deal = await dealTestFactory.buildAndInsertOne(db, {
          sellerId: seller.id,
          buyerId: buyer.id,
          status: "negotiating" as const,
        });
        const collection = await collectionTestFactory.buildAndInsertOne(db, {
          id: `test-collection-id-${i}`,
          userId: seller.id,
          name: `Test Collection ${i}`,
          description: `Test Collection Description ${i}`,
          isPublic: false,
        });
        const collectionItem =
          await collectionItemTestFactory.buildAndInsertOne(db, {
            collectionId: collection.id,
            cardScryfallId: card.scryfallId,
            quantity: i,
          });
        await dealItemTestFactory.buildAndInsertOne(db, {
          dealId: deal.id,
          collectionItemId: collectionItem.id,
          agreedPrice: `${i * 10}.00`,
          quantity: i,
        });
      }

      const result = await getAllDealsForCardQuery(db, card.scryfallId, {
        page: 2,
        pageSize: 2,
      });

      expect(result.deals).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order deals by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Card 1",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
        name: "Test User 1",
        email: "test1@example.com",
      });

      const deal1 = await dealTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          sellerId: "test-seller-id-1",
          buyerId: "test-buyer-id-1",
          status: "negotiating",
          createdAt: new Date("2023-01-01"),
        }
      );
      const deal2 = await dealTestFactory.buildAndInsertOneWithDependencies(
        db,
        {
          sellerId: "test-seller-id-2",
          buyerId: "test-buyer-id-2",
          status: "negotiating",
          createdAt: new Date("2023-01-02"),
        }
      );

      const collection1 = await collectionTestFactory.buildAndInsertOne(db, {
        id: "test-collection-id-1",
        userId: user.id,
      });
      const collection2 = await collectionTestFactory.buildAndInsertOne(db, {
        id: "test-collection-id-2",
        userId: user.id,
      });

      const collectionItem1 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection1.id,
          cardScryfallId: card.scryfallId,
          quantity: 1,
        }
      );
      const collectionItem2 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: collection2.id,
          cardScryfallId: card.scryfallId,
          quantity: 1,
        }
      );

      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal1.id,
        collectionItemId: collectionItem1.id,
        agreedPrice: "10.00",
        quantity: 1,
      });
      await dealItemTestFactory.buildAndInsertOne(db, {
        dealId: deal2.id,
        collectionItemId: collectionItem2.id,
        agreedPrice: "20.00",
        quantity: 1,
      });

      const result = await getAllDealsForCardQuery(db, card.scryfallId);

      expect(result.deals).toHaveLength(2);
      expect(result.deals[0].id).toBe(deal2.id); // Most recent first
      expect(result.deals[1].id).toBe(deal1.id);
    });
  });

  it("should handle empty cardScryfallId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllDealsForCardQuery(db, "");

      expect(result.deals).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
