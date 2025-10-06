import { userReportsTestFactory } from "@/src/domain/auth/user-reports.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { getUserReportQuery } from "./get-user-report.query";

describe("getUserReportQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully retrieve an existing user report", async () => {
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

      const result = await getUserReportQuery(db, userReport.id);

      expect(result.success).toBe(true);
      expect(result.userReport).toBeDefined();
      expect(result.userReport?.id).toBe(userReport.id);
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

  it("should return error when user report is not found", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-report-id";

      const result = await getUserReportQuery(db, nonExistentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User report not found");
      expect(result.userReport).toBeUndefined();
    });
  });

  it("should handle empty id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getUserReportQuery(db, "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User report not found");
      expect(result.userReport).toBeUndefined();
    });
  });

  it("should handle null id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await getUserReportQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.userReport).toBeUndefined();
    });
  });

  it("should handle malformed id gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars-!@#$%";

      const result = await getUserReportQuery(db, malformedId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User report not found");
      expect(result.userReport).toBeUndefined();
    });
  });

  it("should retrieve a resolved user report", async () => {
    await runWithTestDb(async (db: DB) => {
      const userReport =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-resolved-report-id",
          reporterId: "test-reporter-id-2",
          reportedUserId: "test-reported-user-id-2",
          dealId: "test-deal-id-2",
          reason: "Payment issue",
          description: "User did not send payment as agreed",
          status: "resolved",
          resolvedAt: new Date("2023-01-01"),
        });

      const result = await getUserReportQuery(db, userReport.id);

      expect(result.success).toBe(true);
      expect(result.userReport).toBeDefined();
      expect(result.userReport?.status).toBe("resolved");
      expect(result.userReport?.resolvedAt).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });

  it("should retrieve a user report without dealId", async () => {
    await runWithTestDb(async (db: DB) => {
      const userReport =
        await userReportsTestFactory.buildAndInsertOneWithDependencies(db, {
          id: "test-report-no-deal-id",
          reporterId: "test-reporter-id-3",
          reportedUserId: "test-reported-user-id-3",
          dealId: null,
          reason: "Inappropriate behavior",
          description: "User was harassing other users in chat",
          status: "pending",
        });

      const result = await getUserReportQuery(db, userReport.id);

      expect(result.success).toBe(true);
      expect(result.userReport).toBeDefined();
      expect(result.userReport?.dealId).toBeNull();
      expect(result.userReport?.reason).toBe("Inappropriate behavior");
      expect(result.error).toBeUndefined();
    });
  });
});
