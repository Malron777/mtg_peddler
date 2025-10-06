import { userReportsTestFactory } from "@/src/domain/auth/user-reports.model.test-factory";
import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getAllUserReportsQuery } from "./get-all-user-reports.query";

describe("getAllUserReportsQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should return all user reports with default pagination", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert test user reports
      const report1 =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-1",
          reporterId: "test-reporter-id-1",
          reportedUserId: "test-reported-user-id-1",
          dealId: "test-deal-id-1",
          reason: "Fraudulent behavior",
          description: "User provided fake cards and refused to refund",
          status: "pending",
        });

      const report2 =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-2",
          reporterId: "test-reporter-id-2",
          reportedUserId: "test-reported-user-id-2",
          dealId: "test-deal-id-2",
          reason: "Payment issue",
          description: "User did not send payment as agreed",
          status: "resolved",
          resolvedAt: new Date("2023-01-01"),
        });

      const result = await getAllUserReportsQuery(db);

      expect(result.userReports).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(1);
      expect(result.userReports.some((r) => r.id === report1.id)).toBe(true);
      expect(result.userReports.some((r) => r.id === report2.id)).toBe(true);
    });
  });

  it("should return empty result when no user reports exist", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getAllUserReportsQuery(db);

      expect(result.userReports).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
      expect(result.totalPages).toBe(0);
    });
  });

  it("should handle custom pagination options", async () => {
    await runWithTestDb(async (db: DB) => {
      // Insert multiple user reports
      for (let i = 1; i <= 5; i++) {
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: `test-report-id-${i}`,
          reporterId: `test-reporter-id-${i}`,
          reportedUserId: `test-reported-user-id-${i}`,
          dealId: `test-deal-id-${i}`,
          reason: `Test reason ${i}`,
          description: `Test description ${i}`,
          status: i % 2 === 0 ? "resolved" : "pending",
        });
      }

      const result = await getAllUserReportsQuery(db, { page: 2, pageSize: 2 });

      expect(result.userReports).toHaveLength(2);
      expect(result.totalCount).toBe(5);
      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(2);
      expect(result.totalPages).toBe(3);
    });
  });

  it("should handle invalid pagination options gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
        id: "test-report-id-1",
        reporterId: "test-reporter-id-1",
        reportedUserId: "test-reported-user-id-1",
        dealId: "test-deal-id-1",
        reason: "Test reason",
        description: "Test description",
        status: "pending",
      });

      const result = await getAllUserReportsQuery(db, {
        page: 0,
        pageSize: -1,
      });

      expect(result.userReports).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(-1);
      expect(result.totalPages).toBe(-1);
    });
  });

  it("should order user reports by createdAt descending", async () => {
    await runWithTestDb(async (db: DB) => {
      const report1 =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-1",
          reporterId: "test-reporter-id-1",
          reportedUserId: "test-reported-user-id-1",
          dealId: "test-deal-id-1",
          reason: "Test reason 1",
          description: "Test description 1",
          status: "pending",
          createdAt: new Date("2023-01-01"),
        });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const report2 =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-2",
          reporterId: "test-reporter-id-2",
          reportedUserId: "test-reported-user-id-2",
          dealId: "test-deal-id-2",
          reason: "Test reason 2",
          description: "Test description 2",
          status: "resolved",
          createdAt: new Date("2023-01-02"),
        });

      const result = await getAllUserReportsQuery(db);

      expect(result.userReports).toHaveLength(2);
      expect(result.userReports[0].id).toBe(report2.id); // Most recent first
      expect(result.userReports[1].id).toBe(report1.id);
    });
  });

  it("should handle large page sizes gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const reporter = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reporter-id-1",
      });
      const reportedUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reported-user-id-1",
      });

      // Create a few user reports
      for (let i = 1; i <= 3; i++) {
        const deal = await dealTestFactory.buildAndInsertOneWithDependencies(
          db,
          {
            id: `test-deal-id-${i}`,
          }
        );
        await userReportsTestFactory.buildAndInsertOne(db, {
          id: `test-report-id-${i}`,
          reporterId: reporter.id,
          reportedUserId: reportedUser.id,
          dealId: deal.id,
          reason: `Test reason ${i}`,
          description: `Test description ${i}`,
          status: "pending",
        });
      }

      const result = await getAllUserReportsQuery(db, {
        page: 1,
        pageSize: 1000,
      });

      expect(result.userReports).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(1000);
      expect(result.totalPages).toBe(1);
    });
  });
});
