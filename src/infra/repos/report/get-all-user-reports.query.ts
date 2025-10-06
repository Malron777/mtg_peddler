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

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated user reports
  let query = db
    .select()
    .from(userReports)
    .orderBy(desc(userReports.createdAt));

  // Handle negative pageSize (treat as "no limit")
  if (pageSize < 0) {
    // When pageSize is negative, ignore offset to avoid skipping rows
    query = query.limit(Number.MAX_SAFE_INTEGER);
  } else {
    query = query.limit(pageSize).offset(offset);
  }

  const userReportsResult = await query;

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    userReports: userReportsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
