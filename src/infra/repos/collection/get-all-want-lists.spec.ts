import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllWantListsQuery } from "./get-all-want-lists.query";

describe("getAllWantListsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve want lists with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create test want lists
      await wantListTestFactory.buildAndInsertOne(db, {
        userId: "test-user-id-1",
        name: "Want List 1",
        priority: 1,
      });
      await wantListTestFactory.buildAndInsertOne(db, {
        userId: "test-user-id-2",
        name: "Want List 2",
        priority: 2,
      });

      const result = await getAllWantListsQuery(db);

      expect(result.wantLists).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.wantLists[0].name).toBe("Want List 2"); // Ordered by createdAt desc
      expect(result.wantLists[1].name).toBe("Want List 1");
    });
  });

  it("should return empty results when no want lists exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllWantListsQuery(db);

      expect(result.wantLists).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 5 want lists
      for (let i = 1; i <= 5; i++) {
        await wantListTestFactory.buildAndInsertOne(db, {
          userId: `test-user-id-${i}`,
          name: `Want List ${i}`,
          priority: i,
        });
      }

      const result = await getAllWantListsQuery(db, {
        page: 2,
        pageSize: 2,
      });

      expect(result.wantLists).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination parameters", async () => {
    await runWithTestDb(async (db: DB) => {
      await wantListTestFactory.buildAndInsertOne(db, {
        userId: "test-user-id-1",
        name: "Want List 1",
      });

      const result = await getAllWantListsQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.wantLists).toHaveLength(0);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order want lists by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const wantList1 = await wantListTestFactory.buildAndInsertOne(db, {
        userId: "test-user-id-1",
        name: "First Want List",
        createdAt: new Date("2023-01-01"),
      });

      const wantList2 = await wantListTestFactory.buildAndInsertOne(db, {
        userId: "test-user-id-2",
        name: "Second Want List",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllWantListsQuery(db);

      expect(result.wantLists).toHaveLength(2);
      expect(result.wantLists[0].id).toBe(wantList2.id); // Most recent first
      expect(result.wantLists[1].id).toBe(wantList1.id);
    });
  });

  it("should handle large page sizes", async () => {
    await runWithTestDb(async (db: DB) => {
      // Create 3 want lists
      for (let i = 1; i <= 3; i++) {
        await wantListTestFactory.buildAndInsertOne(db, {
          userId: `test-user-id-${i}`,
          name: `Want List ${i}`,
        });
      }

      const result = await getAllWantListsQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.wantLists).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
