import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { collectionTestFactory } from "@/src/domain/tcg/collection.model.test-factory";
import { priceHistoryTestFactory } from "@/src/domain/tcg/price-history.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getCardsByPriceQuery } from "./get-cards-by-price.query";

describe("getCardsByPriceQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return cards within specified price range", async () => {
    await runWithTestDb(async (db: DB) => {
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

      const card3 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-3",
        oracleId: "oracle-3",
        name: "Black Lotus",
        setCode: "LEA",
        setName: "Limited Edition Alpha",
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

      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card3.scryfallId,
        source: "tcg",
        price: "1000.00",
        currency: "USD",
      });

      const result = await getCardsByPriceQuery(db, {
        minPrice: 1.0,
        maxPrice: 5.0,
      });

      expect(result.cards).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);

      const cardNames = result.cards.map((c) => c.card.name);
      expect(cardNames).toContain("Lightning Bolt");
      expect(cardNames).toContain("Counterspell");
      expect(cardNames).not.toContain("Black Lotus");

      expect(result.priceRange.min).toBe(1.5);
      expect(result.priceRange.max).toBe(2.0);
    });
  });

  it("should return cards with minimum price only", async () => {
    await runWithTestDb(async (db: DB) => {
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
        price: "0.50",
        currency: "USD",
      });

      const result = await getCardsByPriceQuery(db, { minPrice: 1.0 });

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].card.name).toBe("Lightning Bolt");
      expect(result.cards[0].currentPrice).toBe(1.5);
    });
  });

  it("should return cards with maximum price only", async () => {
    await runWithTestDb(async (db: DB) => {
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
        price: "5.00",
        currency: "USD",
      });

      const result = await getCardsByPriceQuery(db, { maxPrice: 2.0 });

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].card.name).toBe("Lightning Bolt");
      expect(result.cards[0].currentPrice).toBe(1.5);
    });
  });

  it("should handle pagination correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create multiple test cards
      for (let i = 1; i <= 5; i++) {
        const card = await cardTestFactory.buildAndInsertOne(db, {
          scryfallId: `card-${i}`,
          oracleId: `oracle-${i}`,
          name: `Test Card ${i}`,
          setCode: "M21",
          setName: "Core Set 2021",
        });

        await priceHistoryTestFactory.buildAndInsertOne(db, {
          cardScryfallId: card.scryfallId,
          source: "tcg",
          price: `${i}.00`,
          currency: "USD",
        });
      }

      const result = await getCardsByPriceQuery(db, { page: 2, pageSize: 2 });

      expect(result.cards).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should sort cards by price in ascending order", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test cards
      const card1 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Expensive Card",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      const card2 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-2",
        oracleId: "oracle-2",
        name: "Cheap Card",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create price history
      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card1.scryfallId,
        source: "tcg",
        price: "5.00",
        currency: "USD",
      });

      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card2.scryfallId,
        source: "tcg",
        price: "1.00",
        currency: "USD",
      });

      const result = await getCardsByPriceQuery(db, {
        sortBy: "price",
        sortOrder: "asc",
      });

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].card.name).toBe("Cheap Card");
      expect(result.cards[0].currentPrice).toBe(1.0);
      expect(result.cards[1].card.name).toBe("Expensive Card");
      expect(result.cards[1].currentPrice).toBe(5.0);
    });
  });

  it("should sort cards by price in descending order", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test cards
      const card1 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Expensive Card",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      const card2 = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-2",
        oracleId: "oracle-2",
        name: "Cheap Card",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create price history
      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card1.scryfallId,
        source: "tcg",
        price: "5.00",
        currency: "USD",
      });

      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card2.scryfallId,
        source: "tcg",
        price: "1.00",
        currency: "USD",
      });

      const result = await getCardsByPriceQuery(db, {
        sortBy: "price",
        sortOrder: "desc",
      });

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].card.name).toBe("Expensive Card");
      expect(result.cards[0].currentPrice).toBe(5.0);
      expect(result.cards[1].card.name).toBe("Cheap Card");
      expect(result.cards[1].currentPrice).toBe(1.0);
    });
  });

  it("should include availability information when onlyAvailable is true", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test user
      const user = await userTestFactory.buildAndInsertOne(db, {
        email: "test@example.com",
        name: "Test User",
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
        price: "1.50",
        currency: "USD",
      });

      // Create public collection with the card
      const collection = await collectionTestFactory.buildAndInsertOne(db, {
        userId: user.id,
        name: "Public Collection",
        isPublic: true,
      });

      await collectionItemTestFactory.buildAndInsertOne(db, {
        collectionId: collection.id,
        cardScryfallId: card.scryfallId,
        quantity: 3,
        condition: "NM",
        isFoil: false,
        listingType: "trade",
      });

      const result = await getCardsByPriceQuery(db, { onlyAvailable: true });

      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].availableQuantity).toBe(3);
      expect(result.cards[0].collectionsWithCard).toHaveLength(1);
      expect(result.cards[0].collectionsWithCard![0].collectionName).toBe(
        "Public Collection"
      );
      expect(result.cards[0].collectionsWithCard![0].quantity).toBe(3);
    });
  });

  it("should exclude cards not available when onlyAvailable is true", async () => {
    await runWithTestDb(async (db: DB) => {
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
        price: "1.50",
        currency: "USD",
      });

      const result = await getCardsByPriceQuery(db, { onlyAvailable: true });

      expect(result.cards).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  it("should return empty result when no cards match price criteria", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getCardsByPriceQuery(db, {
        minPrice: 1000,
        maxPrice: 2000,
      });

      expect(result.cards).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.priceRange.min).toBe(0);
      expect(result.priceRange.max).toBe(0);
    });
  });

  it("should handle different price sources", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test card
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "card-1",
        oracleId: "oracle-1",
        name: "Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create price history for different sources
      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card.scryfallId,
        source: "tcg",
        price: "1.50",
        currency: "USD",
      });

      await priceHistoryTestFactory.buildAndInsertOne(db, {
        cardScryfallId: card.scryfallId,
        source: "scg",
        price: "2.00",
        currency: "USD",
      });

      const tcgResult = await getCardsByPriceQuery(db, { priceSource: "tcg" });
      const scgResult = await getCardsByPriceQuery(db, { priceSource: "scg" });

      expect(tcgResult.cards).toHaveLength(1);
      expect(tcgResult.cards[0].currentPrice).toBe(1.5);
      expect(tcgResult.cards[0].priceSource).toBe("tcg");

      expect(scgResult.cards).toHaveLength(1);
      expect(scgResult.cards[0].currentPrice).toBe(2.0);
      expect(scgResult.cards[0].priceSource).toBe("scg");
    });
  });
});

