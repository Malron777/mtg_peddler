import { UserReport } from "@/src/domain/auth/user-reports.model";
import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllUserReportsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllUserReportsResult {
  userReports: UserReport[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllUserReportsQuery(
  db: DB,
  options: GetAllUserReportsOptions = {}
): Promise<GetAllUserReportsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userReports);

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated user reports
  const userReportsResult = await db
    .select()
    .from(userReports)
    .orderBy(desc(userReports.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    userReports: userReportsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
