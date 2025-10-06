import { wantListItemTestFactory } from "@/src/domain/tcg/want-list-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateWantListItemQuery } from "./update-want-list-item.query";

describe("updateWantListItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update a want list item", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListItem =
        await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
          wantListId: "test-want-list-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantityWanted: 1,
          maxPrice: "10.00",
          conditionMinimum: "NM",
        });

      const updateData = {
        id: wantListItem.id,
        quantityWanted: 3,
        maxPrice: "25.00",
        conditionMinimum: "LP" as const,
      };

      const result = await updateWantListItemQuery(db, updateData);

      expect(result.id).toBe(wantListItem.id);
      expect(result.quantityWanted).toBe(3);
      expect(result.maxPrice).toBe("25.00");
      expect(result.conditionMinimum).toBe("LP");
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should return undefined when updating non-existent want list item", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-want-list-item-id",
        quantityWanted: 2,
      };

      const result = await updateWantListItemQuery(db, updateData);

      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListItem =
        await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
          wantListId: "test-want-list-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantityWanted: 1,
          maxPrice: "10.00",
          conditionMinimum: "NM",
        });

      const updateData = {
        id: wantListItem.id,
        quantityWanted: 5,
      };

      const result = await updateWantListItemQuery(db, updateData);

      expect(result.id).toBe(wantListItem.id);
      expect(result.quantityWanted).toBe(5);
      expect(result.maxPrice).toBe("10.00");
      expect(result.conditionMinimum).toBe("NM");
    });
  });

  it("should handle empty update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListItem =
        await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
          wantListId: "test-want-list-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantityWanted: 1,
        });

      const updateData = {
        id: wantListItem.id,
      };

      const result = await updateWantListItemQuery(db, updateData);

      expect(result.id).toBe(wantListItem.id);
      expect(result.quantityWanted).toBe(1);
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should throw error with invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListItem =
        await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
          wantListId: "test-want-list-id-1",
          cardScryfallId: "test-card-scryfall-id-1",
          quantityWanted: 1,
        });

      const updateData = {
        id: wantListItem.id,
        wantListId: null as unknown as string,
        quantityWanted: -1,
      };

      await expect(updateWantListItemQuery(db, updateData)).rejects.toThrow();
    });
  });
});
