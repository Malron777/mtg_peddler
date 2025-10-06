import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { wantListTestFactory } from "@/src/domain/tcg/want-list.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllWantListsForUserQuery } from "./get-all-want-lists-for-user.query";

describe("getAllWantListsForUserQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve want lists for a specific user", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-1";

      // Create want lists for the user
      await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
        userId,
        name: "User Want List 1",
        priority: 1,
      });
      await wantListTestFactory.buildAndInsertOne(db, {
        userId,
        name: "User Want List 2",
        priority: 2,
      });

      // Create want list for different user
      await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
        userId: "test-user-id-2",
        name: "Other User Want List",
        priority: 1,
      });

      const result = await getAllWantListsForUserQuery(db, userId);

      expect(result.wantLists).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.wantLists[0].userId).toBe(userId);
      expect(result.wantLists[1].userId).toBe(userId);
    });
  });

  it("should return empty results for user with no want lists", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-with-no-want-lists";

      // Create want list for different user
      await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
        userId: "test-user-id-2",
        name: "Other User Want List",
      });

      const result = await getAllWantListsForUserQuery(db, userId);

      expect(result.wantLists).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent user", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentUserId = "non-existent-user-id";

      const result = await getAllWantListsForUserQuery(db, nonExistentUserId);

      expect(result.wantLists).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const user = await userTestFactory.buildAndInsertOne(db, {
        id: "test-user-id-1",
      });

      // Create 5 want lists for the user
      for (let i = 1; i <= 5; i++) {
        await wantListTestFactory.buildAndInsertOne(db, {
          userId: user.id,
          name: `User Want List ${i}`,
          priority: i,
        });
      }

      const result = await getAllWantListsForUserQuery(db, user.id, {
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

  it("should order want lists by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-1";

      const wantList1 =
        await wantListTestFactory.buildAndInsertOneWithDependencies(db, {
          userId,
          name: "First Want List",
          createdAt: new Date("2023-01-01"),
        });

      const wantList2 = await wantListTestFactory.buildAndInsertOne(db, {
        userId,
        name: "Second Want List",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllWantListsForUserQuery(db, userId);

      expect(result.wantLists).toHaveLength(2);
      expect(result.wantLists[0].id).toBe(wantList2.id); // Most recent first
      expect(result.wantLists[1].id).toBe(wantList1.id);
    });
  });

  it("should handle empty userId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllWantListsForUserQuery(db, "");

      expect(result.wantLists).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
