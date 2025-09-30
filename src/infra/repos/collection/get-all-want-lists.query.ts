import { WantList } from "@/src/domain/tcg/want-list.model";
import { DB } from "@/src/infra/db/db";
import { wantLists } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllWantListsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllWantListsResult {
  wantLists: WantList[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllWantListsQuery(
  db: DB,
  options: GetAllWantListsOptions = {}
): Promise<GetAllWantListsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(wantLists);

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated want lists
  const wantListsResult = await db
    .select()
    .from(wantLists)
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
