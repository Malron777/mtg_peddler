import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateCardQuery } from "./update-card.query";

describe("updateCardQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing card", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-1",
        oracleId: "test-oracle-id-1",
        name: "Original Name",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/image.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const updateData = {
        scryfallId: card.scryfallId,
        name: "Updated Name",
        setName: "Updated Set Name",
        cachedData: { manaCost: "{2}{R}", type: "Sorcery" },
      };

      const result = await updateCardQuery(db, updateData);

      expect(result.scryfallId).toBe(card.scryfallId);
      expect(result.name).toBe("Updated Name");
      expect(result.setName).toBe("Updated Set Name");
      expect(result.cachedData).toEqual({
        manaCost: "{2}{R}",
        type: "Sorcery",
      });
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        card.updatedAt.getTime()
      );
    });
  });

  it("should throw error when trying to update non-existent card", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        scryfallId: "non-existent-scryfall-id",
        name: "Updated Name",
      };

      await expect(updateCardQuery(db, updateData)).rejects.toThrow();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-2",
        oracleId: "test-oracle-id-2",
        name: "Original Name",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/image.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const updateData = {
        scryfallId: card.scryfallId,
        name: "Only Name Updated",
      };

      const result = await updateCardQuery(db, updateData);

      expect(result.scryfallId).toBe(card.scryfallId);
      expect(result.name).toBe("Only Name Updated");
      expect(result.setCode).toBe(card.setCode); // Should remain unchanged
      expect(result.setName).toBe(card.setName); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.insertOne(db, {
        scryfallId: "test-scryfall-id-3",
        oracleId: "test-oracle-id-3",
        name: "Original Name",
        setCode: "M21",
        setName: "Core Set 2021",
        imageUris: { normal: "https://example.com/image.jpg" },
        pricesLastUpdated: new Date("2023-01-01"),
        cachedData: { manaCost: "{R}", type: "Instant" },
        lastFetchedAt: new Date("2023-01-01"),
      });

      const updateData = {
        scryfallId: card.scryfallId,
      };

      const result = await updateCardQuery(db, updateData);

      expect(result.scryfallId).toBe(card.scryfallId);
      expect(result.name).toBe(card.name); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });
});
