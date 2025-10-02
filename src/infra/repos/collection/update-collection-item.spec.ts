import { collectionItemTestFactory } from "@/src/domain/tcg/collection-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateCollectionItemQuery } from "./update-collection-item.query";

describe("updateCollectionItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update a collection item", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionItem =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
          isFoil: false,
          condition: "NM",
        });

      const updateData = {
        id: collectionItem.id,
        quantity: 3,
        isFoil: true,
        condition: "LP" as const,
      };

      const result = await updateCollectionItemQuery(db, updateData);

      expect(result.id).toBe(collectionItem.id);
      expect(result.quantity).toBe(3);
      expect(result.isFoil).toBe(true);
      expect(result.condition).toBe("LP");
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should return undefined when updating non-existent collection item", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-collection-item-id",
        quantity: 2,
      };

      const result = await updateCollectionItemQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionItem =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
          isFoil: false,
          condition: "NM",
        });

      const updateData = {
        id: collectionItem.id,
        quantity: 5,
      };

      const result = await updateCollectionItemQuery(db, updateData);

      expect(result.id).toBe(collectionItem.id);
      expect(result.quantity).toBe(5);
      expect(result.isFoil).toBe(false);
      expect(result.condition).toBe("NM");
    });
  });

  it("should handle empty update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionItem =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
        });

      const updateData = {
        id: collectionItem.id,
      };

      const result = await updateCollectionItemQuery(db, updateData);

      expect(result.id).toBe(collectionItem.id);
      expect(result.quantity).toBe(1);
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should throw error with invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const collectionItem =
        await collectionItemTestFactory.buildAndInsertOneWithDependencies(db, {
          collectionId: "test-collection-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantity: 1,
        });

      const updateData = {
        id: collectionItem.id,
        collectionId: null as unknown as string,
        quantity: -1,
      };

      await expect(updateCollectionItemQuery(db, updateData)).rejects.toThrow();
    });
  });
});
