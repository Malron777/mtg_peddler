import { User } from "@/src/domain/auth/user.model";
import { DB } from "@/src/infra/db/db";
import { user } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllUsersOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllUsersResult {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllUsersQuery(
  db: DB,
  options: GetAllUsersOptions = {}
): Promise<GetAllUsersResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(user);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated users
  let query = db.select().from(user).orderBy(desc(user.createdAt));

  // Handle negative pageSize (treat as "no limit")
  if (pageSize < 0) {
    // When pageSize is negative, ignore offset to avoid skipping rows
    query = query.limit(Number.MAX_SAFE_INTEGER);
  } else {
    query = query.limit(pageSize).offset(offset);
  }

  const users = await query;

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    users,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
