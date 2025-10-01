import { userReportsTestFactory } from "@/src/domain/auth/user-reports.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllUserReportsForDealQuery } from "./get-all-user-reports-for-deal.query";

describe("getAllUserReportsForDealQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should retrieve user reports for a specific deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealId = "test-deal-id-1";

      // Create user reports for the deal
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-reporter-id-1",
        reportedUserId: "test-reported-user-id-1",
        dealId,
        reason: "Test reason 1",
        description: "Test description 1",
        status: "pending",
      });
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-reporter-id-2",
        reportedUserId: "test-reported-user-id-2",
        dealId,
        reason: "Test reason 2",
        description: "Test description 2",
        status: "resolved",
      });

      // Create user report for different deal
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-reporter-id-3",
        reportedUserId: "test-reported-user-id-3",
        dealId: "test-deal-id-2",
        reason: "Test reason 3",
        description: "Test description 3",
        status: "pending",
      });

      const result = await getAllUserReportsForDealQuery(db, dealId);

      expect(result.userReports).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.userReports[0].dealId).toBe(dealId);
      expect(result.userReports[1].dealId).toBe(dealId);
    });
  });

  it("should return empty results for deal with no reports", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealId = "test-deal-with-no-reports";

      // Create user report for different deal
      await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-reporter-id-1",
        reportedUserId: "test-reported-user-id-1",
        dealId: "test-deal-id-2",
        reason: "Test reason",
        description: "Test description",
        status: "pending",
      });

      const result = await getAllUserReportsForDealQuery(db, dealId);

      expect(result.userReports).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should return empty results for non-existent deal", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentDealId = "non-existent-deal-id";

      const result = await getAllUserReportsForDealQuery(db, nonExistentDealId);

      expect(result.userReports).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      const dealId = "test-deal-id-1";

      // Create 5 user reports for the deal
      for (let i = 1; i <= 5; i++) {
        await userReportsTestFactory.buildAndInsertOne(db, {
          reporterId: `test-reporter-id-${i}`,
          reportedUserId: `test-reported-user-id-${i}`,
          dealId,
          reason: `Test reason ${i}`,
          description: `Test description ${i}`,
          status: "pending",
        });
      }

      const result = await getAllUserReportsForDealQuery(db, dealId, {
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
      const dealId = "test-deal-id-1";

      const report1 = await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-reporter-id-1",
        reportedUserId: "test-reported-user-id-1",
        dealId,
        reason: "Test reason 1",
        description: "Test description 1",
        status: "pending",
        createdAt: new Date("2023-01-01"),
      });

      const report2 = await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-reporter-id-2",
        reportedUserId: "test-reported-user-id-2",
        dealId,
        reason: "Test reason 2",
        description: "Test description 2",
        status: "pending",
        createdAt: new Date("2023-01-02"),
      });

      const result = await getAllUserReportsForDealQuery(db, dealId);

      expect(result.userReports).toHaveLength(2);
      expect(result.userReports[0].id).toBe(report2.id); // Most recent first
      expect(result.userReports[1].id).toBe(report1.id);
    });
  });

  it("should handle empty dealId", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllUserReportsForDealQuery(db, "");

      expect(result.userReports).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });
});
