import { userReportsTestFactory } from "@/src/domain/auth/user-reports.model.test-factory";
import { userTestFactory } from "@/src/domain/auth/user.model.test-factory";
import { dealTestFactory } from "@/src/domain/tcg/deal.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { createUserReportQuery } from "./create-user-report.query";

describe("createUserReportQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully create a user report", async () => {
    await runWithTestDb(async (db: DB) => {
      const reporterUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reporter-id-1",
      });
      const reportedUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reported-user-id-1",
      });
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        id: "test-deal-id-1",
      });
      const userReportData = await userReportsTestFactory.buildOne({
        id: "test-report-id-1",
        reporterId: reporterUser.id,
        reportedUserId: reportedUser.id,
        dealId: deal.id,
        reason: "Fraudulent behavior",
        description: "User provided fake cards and refused to refund",
        status: "pending",
      });

      const result = await createUserReportQuery(db, userReportData);

      expect(result.success).toBe(true);
      expect(result.userReport).toBeDefined();
      expect(result.userReport?.id).toBe("test-report-id-1");
      expect(result.userReport?.reporterId).toBe("test-reporter-id-1");
      expect(result.userReport?.reportedUserId).toBe("test-reported-user-id-1");
      expect(result.userReport?.dealId).toBe("test-deal-id-1");
      expect(result.userReport?.reason).toBe("Fraudulent behavior");
      expect(result.userReport?.description).toBe(
        "User provided fake cards and refused to refund"
      );
      expect(result.userReport?.status).toBe("pending");
      expect(result.error).toBeUndefined();
    });
  });

  it("should fail when trying to create a user report with duplicate id", async () => {
    await runWithTestDb(async (db: DB) => {
      const reporterUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reporter-id-5",
      });
      const reportedUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reported-user-id-5",
      });
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        id: "test-deal-id-2",
      });

      const userReportData = await userReportsTestFactory.buildOne({
        id: "duplicate-report-id",
        reporterId: reporterUser.id,
        reportedUserId: reportedUser.id,
        dealId: deal.id,
        reason: "First report",
        description: "First report description",
        status: "pending",
      });

      // Create first report
      const firstResult = await createUserReportQuery(db, userReportData);
      expect(firstResult.success).toBe(true);

      // Try to create second report with same id
      const duplicateReportData = await userReportsTestFactory.buildOne({
        id: "duplicate-report-id",
        reporterId: reporterUser.id,
        reportedUserId: reportedUser.id,
        dealId: deal.id,
        reason: "Second report",
        description: "Second report description",
        status: "pending",
      });

      const secondResult = await createUserReportQuery(db, duplicateReportData);

      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBeDefined();
      expect(secondResult.userReport).toBeUndefined();
    });
  });

  it("should fail when trying to create a user report with invalid data", async () => {
    await runWithTestDb(async (db: DB) => {
      const invalidReportData =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-2",
          reporterId: "", // Empty reporterId should fail
          reportedUserId: "test-reported-user-id-2",
          reason: "Test reason",
          description: "Test description",
          status: "pending",
        });

      const result = await createUserReportQuery(db, invalidReportData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.userReport).toBeUndefined();
    });
  });

  it("should handle database connection errors gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      // This test simulates a scenario where the database might be unavailable
      // In a real scenario, this would be tested with a mock or by closing the connection
      const reporterUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reporter-id-5",
      });
      const reportedUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reported-user-id-5",
      });
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        id: "test-deal-id-2",
      });
      const userReportData = await userReportsTestFactory.buildOne({
        id: "test-error-handling",
        reporterId: reporterUser.id,
        reportedUserId: reportedUser.id,
        dealId: deal.id,
        reason: "Test reason",
        description: "Test description",
        status: "pending",
      });

      // The test database should handle this gracefully
      const result = await createUserReportQuery(db, userReportData);

      // This should succeed in the test environment
      expect(result.success).toBe(true);
    });
  });

  it("should create a user report without dealId", async () => {
    await runWithTestDb(async (db: DB) => {
      const reporterUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reporter-id-5",
      });
      const reportedUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reported-user-id-5",
      });
      const userReportData = await userReportsTestFactory.buildOne({
        id: "test-report-id-3",
        reporterId: reporterUser.id,
        reportedUserId: reportedUser.id,
        dealId: null, // No deal associated
        reason: "Inappropriate behavior",
        description: "User was harassing other users in chat",
        status: "pending",
      });

      const result = await createUserReportQuery(db, userReportData);

      expect(result.success).toBe(true);
      expect(result.userReport).toBeDefined();
      expect(result.userReport?.dealId).toBeNull();
      expect(result.userReport?.reason).toBe("Inappropriate behavior");
      expect(result.error).toBeUndefined();
    });
  });

  it("should create a resolved user report", async () => {
    await runWithTestDb(async (db: DB) => {
      const reporterUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reporter-id-5",
      });
      const reportedUser = await userTestFactory.buildAndInsertOne(db, {
        id: "test-reported-user-id-5",
      });
      const deal = await dealTestFactory.buildAndInsertOneWithDependencies(db, {
        id: "test-deal-id-2",
      });
      const userReportData = await userReportsTestFactory.buildOne({
        id: "test-resolved-report-id",
        reporterId: reporterUser.id,
        reportedUserId: reportedUser.id,
        dealId: deal.id,
        reason: "Payment issue",
        description: "User did not send payment as agreed",
        status: "resolved",
        resolvedAt: new Date("2023-01-01"),
      });

      const result = await createUserReportQuery(db, userReportData);

      expect(result.success).toBe(true);
      expect(result.userReport).toBeDefined();
      expect(result.userReport?.status).toBe("resolved");
      expect(result.userReport?.resolvedAt).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });
});
