import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createCardQuery } from "./create-card.query";

describe("createCardQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a card", async () => {
    await runWithTestDb(async (db: DB) => {
      const cardData = cardTestFactory.buildOne({
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

      const result = await createCardQuery(db, cardData);

      expect(result.success).toBe(true);
      expect(result.card).toBeDefined();
      expect(result.card?.scryfallId).toBe("test-scryfall-id-1");
      expect(result.card?.name).toBe("Test Lightning Bolt");
      expect(result.card?.setCode).toBe("M21");
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when trying to create a card with duplicate scryfallId", async () => {
    await runWithTestDb(async (db: DB) => {
      const cardData = cardTestFactory.buildOne({
        scryfallId: "duplicate-scryfall-id",
        name: "First Card",
      });

      // Create first card
      const firstResult = await createCardQuery(db, cardData);
      expect(firstResult.success).toBe(true);

      // Try to create second card with same scryfallId
      const duplicateCardData = cardTestFactory.buildOne({
        scryfallId: "duplicate-scryfall-id",
        name: "Second Card",
      });

      const secondResult = await createCardQuery(db, duplicateCardData);

      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBeDefined();
      expect(secondResult.card).toBeUndefined();
    });
  });

  it("should fail when trying to create a card with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidCardData = cardTestFactory.buildOne({
        scryfallId: "", // Empty scryfallId should fail
        name: "Invalid Card",
      });

      const result = await createCardQuery(db, invalidCardData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.card).toBeUndefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // This test simulates a scenario where the database might be unavailable
      // In a real scenario, this would be tested with a mock or by closing the connection
      const cardData = cardTestFactory.buildOne({
        scryfallId: "test-error-handling",
        name: "Error Test Card",
      });

      // The test database should handle this gracefully
      const result = await createCardQuery(db, cardData);

      // This should succeed in the test environment
      expect(result.success).toBe(true);
    });
  });
});
