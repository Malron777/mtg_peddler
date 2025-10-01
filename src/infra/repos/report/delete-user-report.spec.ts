import { userReportsTestFactory } from "@/src/domain/auth/user-reports.model.test-factory";
import { buildRunWithTestDb, migrateTestDb } from "@/test-db";
import { beforeAll, describe, expect, it } from "vitest";
import { DB } from "../../db/db";
import { deleteUserReportQuery } from "./delete-user-report.query";

describe("deleteUserReportQuery", () => {
  let runWithTestDb: Awaited<ReturnType<typeof buildRunWithTestDb>>;

  beforeAll(async () => {
    await migrateTestDb();
    runWithTestDb = await buildRunWithTestDb();
  });

  it("should successfully delete a user report", async () => {
    await runWithTestDb(async (db: DB) => {
      const userReport = await userReportsTestFactory.buildAndInsertOne(db, {
        reporterId: "test-reporter-id-1",
        reportedUserId: "test-reported-user-id-1",
        dealId: "test-deal-id-1",
        reason: "Test reason",
        description: "Test description",
        status: "pending",
      });

      const result = await deleteUserReportQuery(db, userReport.id);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle deletion of non-existent user report gracefully", async () => {
    await runWithTestDb(async (db: DB) => {
      const nonExistentId = "non-existent-user-report-id";

      const result = await deleteUserReportQuery(db, nonExistentId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle empty id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteUserReportQuery(db, "");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle null id", async () => {
    await runWithTestDb(async (db: DB) => {
      const result = await deleteUserReportQuery(db, null as unknown as string);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it("should handle malformed id", async () => {
    await runWithTestDb(async (db: DB) => {
      const malformedId = "malformed-id-with-special-chars!@#$%";

      const result = await deleteUserReportQuery(db, malformedId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it("should handle database constraint violations", async () => {
    await runWithTestDb(async (db: DB) => {
      // Mock a database error by using invalid schema reference
      const invalidDb = { ...db, schema: null };

      const result = await deleteUserReportQuery(
        invalidDb as unknown as DB,
        "test-id"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
