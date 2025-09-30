import { WantListItem } from "@/src/domain/tcg/want-list-item.model";
import { DB } from "@/src/infra/db/db";
import { wantListItems } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllWantListItemsForWantListOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllWantListItemsForWantListResult {
  wantListItems: WantListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllWantListItemsForWantListQuery(
  db: DB,
  wantListId: string,
  options: GetAllWantListItemsForWantListOptions = {}
): Promise<GetAllWantListItemsForWantListResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(wantListItems)
    .where(eq(wantListItems.wantListId, wantListId));

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated want list items
  const wantListItemsResult = await db
    .select()
    .from(wantListItems)
    .where(eq(wantListItems.wantListId, wantListId))
    .orderBy(desc(wantListItems.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    wantListItems: wantListItemsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
