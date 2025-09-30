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

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated users
  const users = await db
    .select()
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    users,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
