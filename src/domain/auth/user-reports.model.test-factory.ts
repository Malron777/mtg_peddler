import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema/auth";
import { UserReport } from "./user-reports.model";
import { userTestFactory } from "./user.model.test-factory";

export const userReportsTestFactory = {
  buildOne(overrides: Partial<UserReport>): UserReport {
    return {
      ...overrides,
      id: crypto.randomUUID(),
      reporterId: crypto.randomUUID(),
      reportedUserId: crypto.randomUUID(),
      dealId: crypto.randomUUID(),
      reason: "Test reason for report",
      description: "Test description of the report",
      status: "pending",
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  async insertOne(db: DB, overrides: Partial<UserReport>): Promise<UserReport> {
    const report = this.buildOne(overrides);
    const result = await db.insert(userReports).values(report).returning();
    return result[0];
  },

  async buildAndInsertOne(
    db: DB,
    overrides: Partial<UserReport>
  ): Promise<UserReport> {
    const report = this.buildOne(overrides);
    const result = await db.insert(userReports).values(report).returning();
    return result[0];
  },

  async buildAndInsertOneWithDependencies(
    db: DB,
    overrides: Partial<UserReport>
  ): Promise<UserReport> {
    // Create dependencies if not provided
    const reporterId =
      overrides.reporterId ||
      (await userTestFactory.buildAndInsertOne(db, {})).id;
    const reportedUserId =
      overrides.reportedUserId ||
      (await userTestFactory.buildAndInsertOne(db, {})).id;

    // DealId is optional, so we don't create it unless specifically needed
    const dealId = overrides.dealId;

    // Build and insert with dependencies
    const report = this.buildOne({
      ...overrides,
      reporterId,
      reportedUserId,
      dealId,
    });
    const result = await db.insert(userReports).values(report).returning();
    return result[0];
  },
};
