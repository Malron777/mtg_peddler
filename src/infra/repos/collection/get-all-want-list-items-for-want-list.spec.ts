import { cardTestFactory } from "@/src/domain/tcg/card.model.test-factory";
import { wantListItemTestFactory } from "@/src/domain/tcg/want-list-item.model.test-factory";
import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllWantListItemsForWantListQuery } from "./get-all-want-list-items-for-want-list.query";

describe("getAllWantListItemsForWantListQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve want list items for a specific want list", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListId = "test-want-list-id-1";

      // Create want list items for the want list
      await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
        wantListId,
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 1,
        maxPrice: "10.00",
      });
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId,
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 2,
        maxPrice: "20.00",
      });

      // Create want list item for different want list
      await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
        wantListId: "test-want-list-id-2",
        cardScryfallId: "test-card-scryfall-id-2",
        quantityWanted: 1,
        maxPrice: "15.00",
      });

      const result = await getAllWantListItemsForWantListQuery(db, wantListId);

      expect(result.wantListItems).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.wantListItems[0].wantListId).toBe(wantListId);
      expect(result.wantListItems[1].wantListId).toBe(wantListId);
    });
  });

  it("should return empty results for want list with no items", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListId = "test-want-list-with-no-items";

      // Create want list item for different want list
      await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
        wantListId: "test-want-list-id-2",
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 1,
      });

      const result = await getAllWantListItemsForWantListQuery(db, wantListId);

      expect(result.wantListItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent want list", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentWantListId = "non-existent-want-list-id";

      const result = await getAllWantListItemsForWantListQuery(
        db,
        nonExistentWantListId
      );

      expect(result.wantListItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-want-list-id-1",
          name: "Test Want List",
          description: "A test want list for testing purposes",
          priority: 1,
        });
      const card = await cardTestFactory.buildAndInsertOne(db, {
        id: "test-card-scryfall-id-1",
        name: "Test Card",
        setCode: "M21",
        setName: "Core Set 2021",
      });

      // Create 5 want list items for the want list
      for (let i = 1; i <= 5; i++) {
        await wantListItemTestFactory.buildAndInsertOne(db, {
          wantListId: wantList.id,
          cardScryfallId: card.scryfallId,
          quantityWanted: i,
        });
      }

      const result = await getAllWantListItemsForWantListQuery(
        db,
        wantList.id,
        {
          page: 2,
          pageSize: 2,
        }
      );

      expect(result.wantListItems).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order want list items by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantListId = "test-want-list-id-1";

      const item1 =
        await wantListItemTestFactory.buildAndInsertOneWithDependencies(db, {
          wantListId,
          cardScryfallId: "test-card-scryfall-id-1",
          quantityWanted: 1,
          createdAt: new Date("2023-01-01"),
        });

      const item2 = await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId,
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 2,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllWantListItemsForWantListQuery(db, wantListId);

      expect(result.wantListItems).toHaveLength(2);
      expect(result.wantListItems[0].id).toBe(item2.id); // Most recent first
      expect(result.wantListItems[1].id).toBe(item1.id);
    });
  });

  it("should handle empty wantListId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllWantListItemsForWantListQuery(db, "");

      expect(result.wantListItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
