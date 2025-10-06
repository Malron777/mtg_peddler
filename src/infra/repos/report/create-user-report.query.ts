import {
  InsertUserReport,
  UserReport,
} from "@/src/domain/auth/user-reports.model";
import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema";

export interface CreateUserReportResult {
  success: boolean;
  userReport?: UserReport;
  error?: string;
}

export async function createUserReportQuery(
  db: DB,
  insertUserReport: InsertUserReport
): Promise<CreateUserReportResult> {
  try {
    const result = await db
      .insert(userReports)
      .values(insertUserReport)
      .returning();

    return {
      success: true,
      userReport: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
