import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllCardsQuery } from "./get-all-cards.query";

describe("getAllCardsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all cards with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert test cards
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

      const result = await getAllCardsQuery(db);

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

  it("should return empty result when no cards exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllCardsQuery(db);

      expect(result.cards).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert multiple cards
      for (let i = 1; i <= 5; i++) {
        await cardTestFactory.insertOne(db, {
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
      }

      const result = await getAllCardsQuery(db, { page: 2, pageSize: 2 });

      expect(result.cards).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination options gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Card",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const result = await getAllCardsQuery(db, { page: 0, pageSize: -1 });

      expect(result.cards).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order cards by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const card1 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "First Card",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card1.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
        createdAt: new Date("2023-01-01"),
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const card2 = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-2",
        oracleId: "test-oracle-id-2",
        name: "Second Card",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/card2.jpg" },
        pricesLastUpdated: new Date("2023-01-02"),
        cachedData: { manaCost: "{U}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-02"),
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllCardsQuery(db);

      expect(result.cards).toHaveLength(2);
      expect(result.cards[0].scryfallId).toBe(card2.scryfallId); // Most recent first
      expect(result.cards[1].scryfallId).toBe(card1.scryfallId);
    });
  });
});
