import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getCardByIdQuery } from "./get-card-by-id.query";

describe("getCardByIdQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve a card by scryfallId", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "test-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Test Lightning Bolt",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/lightning-bolt.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const result = await getCardByIdQuery(db, card.scryfallId);

      expect(result.success).toBe(true);
      expect(result.card).toBeDefined();
      expect(result.card?.scryfallId).toBe(card.scryfallId);
      expect(result.card?.name).toBe("Test Lightning Bolt");
      expect(result.error).toBeUndefined();
    });
  });

  it("should return error when card is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentScryfallId = "non-existent-scryfall-id";

      const result = await getCardByIdQuery(db, nonExistentScryfallId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Card not found");
      expect(result.card).toBeUndefined();
    });
  });

  it("should handle empty scryfallId gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getCardByIdQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Card not found");
      expect(result.card).toBeUndefined();
    });
  });

  it("should handle null scryfallId gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getCardByIdQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.card).toBeUndefined();
    });
  });

  it("should handle database errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // Test with a malformed scryfallId that might cause issues
      const malformedScryfallId = "test-scryfall-id-with-special-chars-!@#$%";

      const result = await getCardByIdQuery(db, malformedScryfallId);

      // Should handle gracefully and return not found
      expect(result.success).toBe(false);
      expect(result.error).toBe("Card not found");
      expect(result.card).toBeUndefined();
    });
  });
});
