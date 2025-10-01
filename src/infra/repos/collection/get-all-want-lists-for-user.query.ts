import { WantList } from "@/src/domain/tcg/want-list.model";
import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllWantListsForUserOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllWantListsForUserResult {
  wantLists: WantList[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllWantListsForUserQuery(
  db: DB,
  userId: string,
  options: GetAllWantListsForUserOptions = {}
): Promise<GetAllWantListsForUserResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(wantLists)
    .where(eq(wantLists.userId, userId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated want lists
  const wantListsResult = await db
    .select()
    .from(wantLists)
    .where(eq(wantLists.userId, userId))
    .orderBy(desc(wantLists.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    wantLists: wantListsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
