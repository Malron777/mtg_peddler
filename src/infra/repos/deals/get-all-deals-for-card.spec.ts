import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
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
      const cardScryfallId = "test-card-scryfall-id-1";

      // Create deals
      const deal1 = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating" as const,
      });
      const deal2 = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: "test-seller-id-2",
        buyerId: "test-buyer-id-2",
        status: "negotiating" as const,
      });
      const deal3 = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: "test-seller-id-3",
        buyerId: "test-buyer-id-3",
        status: "negotiating" as const,
      });

      // Create collection items with the card
      const collectionItem1 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-1",
          cardScryfallId,
          quantity: 1,
        }
      );
      const collectionItem2 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-2",
          cardScryfallId,
          quantity: 2,
        }
      );
      const collectionItem3 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-3",
          cardScryfallId: "test-card-scryfall-id-2",
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

      const result = await getAllDealsForCardQuery(db, cardScryfallId);

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
      const deal = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating" as const,
      });
      const collectionItem = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
        }
      );
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
      const cardScryfallId = "test-card-scryfall-id-1";

      // Create 5 deals with the card
      for (let i = 1; i <= 5; i++) {
        const deal = await dealTestFactory.buildAndInsertOne(db, {
          sellerId: `test-seller-id-${i}`,
          buyerId: `test-buyer-id-${i}`,
          status: "negotiating" as const,
        });
        const collectionItem =
          await collectionItemTestFactory.buildAndInsertOne(db, {
            collectionId: `test-collection-id-${i}`,
            cardScryfallId,
            quantity: i,
          });
        await dealItemTestFactory.buildAndInsertOne(db, {
          dealId: deal.id,
          collectionItemId: collectionItem.id,
          agreedPrice: `${i * 10}.00`,
          quantity: i,
        });
      }

      const result = await getAllDealsForCardQuery(db, cardScryfallId, {
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
      const cardScryfallId = "test-card-scryfall-id-1";

      const deal1 = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: "test-seller-id-1",
        buyerId: "test-buyer-id-1",
        status: "negotiating",
        createdAt: new Date("2023-01-01"),
      });
      const deal2 = await dealTestFactory.buildAndInsertOne(db, {
        sellerId: "test-seller-id-2",
        buyerId: "test-buyer-id-2",
        status: "negotiating",
        createdAt: new Date("2023-01-02"),
      });

      const collectionItem1 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-1",
          cardScryfallId,
          quantity: 1,
        }
      );
      const collectionItem2 = await collectionItemTestFactory.buildAndInsertOne(
        db,
        {
          collectionId: "test-collection-id-2",
          cardScryfallId,
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

      const result = await getAllDealsForCardQuery(db, cardScryfallId);

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
