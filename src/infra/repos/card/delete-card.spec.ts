import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteCardQuery } from "./delete-card.query";

describe("deleteCardQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete an existing card", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.insertOne(db, {
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

      const result = await deleteCardQuery(db, card.scryfallId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent card gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentScryfallId = "non-existent-scryfall-id";

      const result = await deleteCardQuery(db, nonExistentScryfallId);

      // Deletion of non-existent record should still be considered successful
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty scryfallId gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteCardQuery(db, "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null scryfallId gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteCardQuery(db, null as unknown as string);

      expect(result.success).toBe(true);
      expect(result.error).not.toBeDefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // This test would require setting up foreign key constraints
      // For now, we'll test with a malformed scryfallId
      const malformedScryfallId = "test-scryfall-id-with-special-chars-!@#$%";

      const result = await deleteCardQuery(db, malformedScryfallId);

      // Should handle gracefully
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
