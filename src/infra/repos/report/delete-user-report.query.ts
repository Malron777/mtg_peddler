import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteUserReportResult {
  success: boolean;
  error?: string;
}

export async function deleteUserReportQuery(
  db: DB,
  id: string
): Promise<DeleteUserReportResult> {
  try {
    await db.delete(userReports).where(eq(userReports.id, id));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
