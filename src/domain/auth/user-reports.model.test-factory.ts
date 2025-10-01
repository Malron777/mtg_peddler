import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema/auth";
import { UserReport } from "./user-reports.model";

export function buildOne(overrides: Partial<UserReport>): UserReport {
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
}

export async function insertOne(
  db: DB,
  overrides: Partial<UserReport>
): Promise<UserReport> {
  const report = buildOne(overrides);
  const result = await db.insert(userReports).values(report).returning();
  return result[0];
}

export async function buildAndInsertOne(
  db: DB,
  overrides: Partial<UserReport>
): Promise<UserReport> {
  const report = buildOne(overrides);
  const result = await db.insert(userReports).values(report).returning();
  return result[0];
}

export async function buildAndInsertOneWithDependencies(
  db: DB,
  overrides: Partial<UserReport>
): Promise<UserReport> {
  // Import the required factories
  const { buildAndInsertOne: buildUser } = await import(
    "./user.model.test-factory"
  );

  // Create dependencies if not provided
  const reporterId = overrides.reporterId || (await buildUser(db, {})).id;
  const reportedUserId =
    overrides.reportedUserId || (await buildUser(db, {})).id;

  // DealId is optional, so we don't create it unless specifically needed
  const dealId = overrides.dealId;

  // Build and insert with dependencies
  const report = buildOne({
    ...overrides,
    reporterId,
    reportedUserId,
    dealId,
  });
  const result = await db.insert(userReports).values(report).returning();
  return result[0];
}
