import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { wantListItemTestFactory } from "@/src/domain/tcg/want-list-item.model.test-factory";
import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createWantListItemQuery } from "./create-want-list-item.query";

describe("createWantListItemQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a want list item", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-want-list-id-1",
        });
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
      });
      const wantListItemData = wantListItemTestFactory.buildOne({
        wantListId: wantList.id,
        cardScryfallId: card.scryfallId,
        quantityWanted: 2,
        maxPrice: "25.00",
        conditionMinimum: "NM",
      });

      const result = await createWantListItemQuery(db, wantListItemData);

      expect(result.success).toBe(true);
      expect(result.wantListItem).toBeDefined();
      expect(result.wantListItem?.wantListId).toBe("test-want-list-id-1");
      expect(result.wantListItem?.cardScryfallId).toBe(
        "test-card-scryfall-id-1"
      );
      expect(result.wantListItem?.quantityWanted).toBe(2);
      expect(result.wantListItem?.maxPrice).toBe("25.00");
      expect(result.wantListItem?.conditionMinimum).toBe("NM");
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when creating a want list item with duplicate id", async () => {
    await runWithTestDb(async (db: DB) => {
      const duplicateId = "duplicate-want-list-item-id";

      await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
        id: duplicateId,
        wantListId: "test-want-list-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
      });

      const wantListItemData2 = wantListItemTestFactory.buildOne({
        id: duplicateId,
        wantListId: "test-want-list-id-2",
        cardScryfallId: "test-card-scryfall-id-2",
      });

      // Try to create second want list item with same id
      const result = await createWantListItemQuery(db, wantListItemData2);

      expect(result.success).toBe(false);
      expect(result.wantListItem).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should fail when creating a want list item with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidWantListItemData = {
        id: "test-want-list-item-id",
        wantListId: null as unknown as string,
        cardScryfallId: "",
        quantityWanted: -1,
        maxPrice: "invalid-price",
        conditionMinimum: "NM" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await createWantListItemQuery(db, invalidWantListItemData);

      expect(result.success).toBe(false);
      expect(result.wantListItem).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListItemData = wantListItemTestFactory.buildOne({
        wantListId: "test-want-list-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
      });

      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await createWantListItemQuery(
        invalidDb as unknown as DB,
        wantListItemData
      );

      expect(result.success).toBe(false);
      expect(result.wantListItem).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  it("should create a want list item with minimal required fields", async () => {
    await runWithTestDb(async (db: DB) => {
      const card = await cardTestFactory.buildAndInsertOne(db, {
        scryfallId: "test-card-scryfall-id-1",
      });
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-want-list-id-1",
        });
      const minimalWantListItemData = wantListItemTestFactory.buildOne({
        wantListId: wantList.id,
        cardScryfallId: card.scryfallId,
        quantityWanted: 1,
        maxPrice: undefined,
        conditionMinimum: "NM",
      });

      const result = await createWantListItemQuery(db, minimalWantListItemData);

      expect(result.success).toBe(true);
      expect(result.wantListItem).toBeDefined();
      expect(result.wantListItem?.wantListId).toBe("test-want-list-id-1");
      expect(result.wantListItem?.cardScryfallId).toBe(
        "test-card-scryfall-id-1"
      );
      expect(result.wantListItem?.quantityWanted).toBe(1);
      expect(result.error).toBeUndefined();
    });
  });
});
