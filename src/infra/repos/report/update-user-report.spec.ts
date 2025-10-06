import { userReportsTestFactory } from "@/src/domain/auth/user-reports.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { updateUserReportQuery } from "./update-user-report.query";

describe("updateUserReportQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully update an existing user report", async () => {
    await runWithTestDb(async (db: DB) => {
      const userReport =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-1",
          reporterId: "test-reporter-id-1",
          reportedUserId: "test-reported-user-id-1",
          dealId: "test-deal-id-1",
          reason: "Fraudulent behavior",
          description: "User provided fake cards and refused to refund",
          status: "pending",
        });

      const updateData = {
        id: userReport.id,
        status: "resolved" as const,
        description: "Updated description after investigation",
        resolvedAt: new Date("2023-01-01"),
      };

      const result = await updateUserReportQuery(db, updateData);

      expect(result.id).toBe(userReport.id);
      expect(result.status).toBe("resolved");
      expect(result.description).toBe(
        "Updated description after investigation"
      );
      expect(result.resolvedAt).toBeDefined();
      expect(result.reporterId).toBe(userReport.reporterId); // Should remain unchanged
      expect(result.reportedUserId).toBe(userReport.reportedUserId); // Should remain unchanged
      expect(result.dealId).toBe(userReport.dealId); // Should remain unchanged
      expect(result.reason).toBe(userReport.reason); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt.getTime()).toBeGreaterThan(
        userReport.updatedAt.getTime()
      );
    });
  });

  it("should return undefined when trying to update non-existent user report", async () => {
    await runWithTestDb(async (db: DB) => {
      const updateData = {
        id: "non-existent-report-id",
        status: "resolved" as const,
        description: "Updated description",
      };
      const result = await updateUserReportQuery(db, updateData);
      expect(result).toBeUndefined();
    });
  });

  it("should handle partial updates correctly", async () => {
    await runWithTestDb(async (db: DB) => {
      const userReport =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-2",
          reporterId: "test-reporter-id-2",
          reportedUserId: "test-reported-user-id-2",
          dealId: "test-deal-id-2",
          reason: "Payment issue",
          description: "User did not send payment as agreed",
          status: "pending",
        });

      const updateData = {
        id: userReport.id,
        status: "resolved" as const,
      };

      const result = await updateUserReportQuery(db, updateData);

      expect(result.id).toBe(userReport.id);
      expect(result.status).toBe("resolved");
      expect(result.description).toBe(userReport.description); // Should remain unchanged
      expect(result.reporterId).toBe(userReport.reporterId); // Should remain unchanged
      expect(result.reportedUserId).toBe(userReport.reportedUserId); // Should remain unchanged
      expect(result.dealId).toBe(userReport.dealId); // Should remain unchanged
      expect(result.reason).toBe(userReport.reason); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle empty update data gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const userReport =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-3",
          reporterId: "test-reporter-id-3",
          reportedUserId: "test-reported-user-id-3",
          dealId: "test-deal-id-3",
          reason: "Test reason",
          description: "Test description",
          status: "pending",
        });

      const updateData = {
        id: userReport.id,
      };

      const result = await updateUserReportQuery(db, updateData);

      expect(result.id).toBe(userReport.id);
      expect(result.status).toBe(userReport.status); // Should remain unchanged
      expect(result.description).toBe(userReport.description); // Should remain unchanged
      expect(result.reporterId).toBe(userReport.reporterId); // Should remain unchanged
      expect(result.reportedUserId).toBe(userReport.reportedUserId); // Should remain unchanged
      expect(result.dealId).toBe(userReport.dealId); // Should remain unchanged
      expect(result.reason).toBe(userReport.reason); // Should remain unchanged
      expect(result.updatedAt).toBeDefined();
    });
  });

  it("should handle invalid update data", async () => {
    await runWithTestDb(async (db: DB) => {
      const userReport =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-id-4",
          reporterId: "test-reporter-id-4",
          reportedUserId: "test-reported-user-id-4",
          dealId: "test-deal-id-4",
          reason: "Test reason",
          description: "Test description",
          status: "pending",
        });

      const updateData = {
        id: userReport.id,
        status: "pending" as const,
        description: "",
        reporterId: null as unknown as string,
      };

      await expect(updateUserReportQuery(db, updateData)).rejects.toThrow();
    });
  });
});
