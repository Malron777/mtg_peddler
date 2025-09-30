import { UserReport } from "@/src/domain/auth/user-reports.model";
import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetUserReportResult {
  success: boolean;
  userReport?: UserReport;
  error?: string;
}

export async function getUserReportQuery(
  db: DB,
  id: string
): Promise<GetUserReportResult> {
  try {
    const result = await db.query.userReports.findFirst({
      where: eq(userReports.id, id),
    });

    if (result) {
      return {
        success: true,
        userReport: result,
      };
    } else {
      return {
        success: false,
        error: "User report not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
