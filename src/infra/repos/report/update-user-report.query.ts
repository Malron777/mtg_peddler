import {
  UpdateUserReport,
  UserReport,
} from "@/src/domain/auth/user-reports.model";
import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserReportQuery(
  db: DB,
  updateUserReport: UpdateUserReport
): Promise<UserReport> {
  const result = await db
    .update(userReports)
    .set({
      ...updateUserReport,
      updatedAt: new Date(),
    })
    .where(eq(userReports.id, updateUserReport.id))
    .returning();

  return result[0];
}
