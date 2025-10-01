import { UserReport } from "@/src/domain/auth/user-reports.model";
import { DB } from "@/src/infra/db/db";
import { userReports } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllUserReportsForUserOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllUserReportsForUserResult {
  userReports: UserReport[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllUserReportsForUserQuery(
  db: DB,
  userId: string,
  options: GetAllUserReportsForUserOptions = {}
): Promise<GetAllUserReportsForUserResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(userReports)
    .where(eq(userReports.reporterId, userId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated user reports
  const userReportsResult = await db
    .select()
    .from(userReports)
    .where(eq(userReports.reporterId, userId))
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
