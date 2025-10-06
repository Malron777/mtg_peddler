import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema/auth";
import { dealTestFactory } from "../tcg/deal.model.test-factory";
import { UserReport } from "./user-reports.model";
import { userTestFactory } from "./user.model.test-factory";

export const userReportsTestFactory = {
  buildOne(overrides: Partial<UserReport>): UserReport {
    return {
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
      ...overrides,
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
    const reporter = await userTestFactory.buildAndInsertOne(db, {
      ...(overrides.reporterId ? { id: overrides.reporterId } : {}),
    });
    const reportedUser = await userTestFactory.buildAndInsertOne(db, {
      ...(overrides.reportedUserId ? { id: overrides.reportedUserId } : {}),
    });
    // DealId is optional, so we don't create it unless specifically needed
    const deal =
      overrides.dealId !== undefined && overrides.dealId !== null
        ? await dealTestFactory.buildAndInsertOneWithDependencies(db, {
            ...(overrides.dealId ? { id: overrides.dealId } : {}),
          })
        : undefined;

    // Build and insert with dependencies
    const report = this.buildOne({
      ...overrides,
      reporterId: reporter.id,
      reportedUserId: reportedUser.id,
      dealId: deal ? deal.id : null,
    });
    const result = await db.insert(userReports).values(report).returning();
    return result[0];
  },
};
