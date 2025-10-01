import { userReportsTestFactory } from "@/src/domain/auth/user-reports.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllUserReportsForUserQuery } from "./get-all-user-reports-for-user.query";

describe("getAllUserReportsForUserQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve user reports for a specific user", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-1";

      // Create user reports for the user
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: userId,
        reportedUserId: "test-reported-user-id-1",
        dealId: "test-deal-id-1",
        reason: "Test reason 1",
        description: "Test description 1",
        status: "pending",
      });
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: userId,
        reportedUserId: "test-reported-user-id-2",
        dealId: "test-deal-id-2",
        reason: "Test reason 2",
        description: "Test description 2",
        status: "resolved",
      });

      // Create user report for different user
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-user-id-2",
        reportedUserId: "test-reported-user-id-3",
        dealId: "test-deal-id-3",
        reason: "Test reason 3",
        description: "Test description 3",
        status: "pending",
      });

      const result = await getAllUserReportsForUserQuery(db, userId);

      expect(result.userReports).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.userReports[0].reporterId).toBe(userId);
      expect(result.userReports[1].reporterId).toBe(userId);
    });
  });

  it("should return empty results for user with no reports", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-with-no-reports";

      // Create user report for different user
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-user-id-2",
        reportedUserId: "test-reported-user-id-1",
        dealId: "test-deal-id-1",
        reason: "Test reason",
        description: "Test description",
        status: "pending",
      });

      const result = await getAllUserReportsForUserQuery(db, userId);

      expect(result.userReports).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent user", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentUserId = "non-existent-user-id";

      const result = await getAllUserReportsForUserQuery(db, nonExistentUserId);

      expect(result.userReports).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-1";

      // Create 5 user reports for the user
      for (let i = 1; i <= 5; i++) {
        await userReportsTestFactory.buildAndInsertOne(db, {
          reporterId: userId,
          reportedUserId: `test-reported-user-id-${i}`,
          dealId: `test-deal-id-${i}`,
          reason: `Test reason ${i}`,
          description: `Test description ${i}`,
          status: "pending",
        });
      }

      const result = await getAllUserReportsForUserQuery(db, userId, {
        page: 2,
        pageSize: 2,
      });

      expect(result.userReports).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should order user reports by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const userId = "test-user-id-1";

      const report1 = await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: userId,
        reportedUserId: "test-reported-user-id-1",
        dealId: "test-deal-id-1",
        reason: "Test reason 1",
        description: "Test description 1",
        status: "pending",
        createdAt: new Date("2023-01-01"),
      });

      const report2 = await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: userId,
        reportedUserId: "test-reported-user-id-2",
        dealId: "test-deal-id-2",
        reason: "Test reason 2",
        description: "Test description 2",
        status: "pending",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllUserReportsForUserQuery(db, userId);

      expect(result.userReports).toHaveLength(2);
      expect(result.userReports[0].id).toBe(report2.id); // Most recent first
      expect(result.userReports[1].id).toBe(report1.id);
    });
  });

  it("should handle empty userId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllUserReportsForUserQuery(db, "");

      expect(result.userReports).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
