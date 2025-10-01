import { wantListItemTestFactory } from "@/src/domain/tcg/want-list-item.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllWantListItemsQuery } from "./get-all-want-list-items.query";

describe("getAllWantListItemsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve want list items with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test want list items
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: "test-want-list-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 1,
        maxPrice: "10.00",
      });
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: "test-want-list-id-2",
        cardScryfallId: "test-card-scryfall-id-2",
        quantityWanted: 2,
        maxPrice: "20.00",
      });

      const result = await getAllWantListItemsQuery(db);

      expect(result.wantListItems).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.wantListItems[0].cardScryfallId).toBe(
        "test-card-scryfall-id-2"
      ); // Ordered by createdAt desc
      expect(result.wantListItems[1].cardScryfallId).toBe(
        "test-card-scryfall-id-1"
      );
    });
  });

  it("should return empty results when no want list items exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllWantListItemsQuery(db);

      expect(result.wantListItems).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 5 want list items
      for (let i = 1; i <= 5; i++) {
        await wantListItemTestFactory.buildAndInsertOne(db, {
          wantListId: `test-want-list-id-${i}`,
          cardScryfallId: `test-card-scryfall-id-${i}`,
          quantityWanted: i,
        });
      }

      const result = await getAllWantListItemsQuery(db, {
        page: 2,
        pageSize: 2,
      });

      expect(result.wantListItems).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination parameters", async () => {
    await runWithTestDb(async (db: DB) => {
      await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: "test-want-list-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 1,
      });

      const result = await getAllWantListItemsQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.wantListItems).toHaveLength(0);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order want list items by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const item1 = await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: "test-want-list-id-1",
        cardScryfallId: "test-card-scryfall-id-1",
        quantityWanted: 1,
        createdAt: new Date("2023-01-01"),
      });

      const item2 = await wantListItemTestFactory.buildAndInsertOne(db, {
        wantListId: "test-want-list-id-2",
        cardScryfallId: "test-card-scryfall-id-2",
        quantityWanted: 2,
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllWantListItemsQuery(db);

      expect(result.wantListItems).toHaveLength(2);
      expect(result.wantListItems[0].id).toBe(item2.id); // Most recent first
      expect(result.wantListItems[1].id).toBe(item1.id);
    });
  });

  it("should handle large page sizes", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 3 want list items
      for (let i = 1; i <= 3; i++) {
        await wantListItemTestFactory.buildAndInsertOne(db, {
          wantListId: `test-want-list-id-${i}`,
          cardScryfallId: `test-card-scryfall-id-${i}`,
          quantityWanted: i,
        });
      }

      const result = await getAllWantListItemsQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.wantListItems).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
