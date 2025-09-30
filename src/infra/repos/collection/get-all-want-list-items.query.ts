import { WantListItem } from "@/src/domain/tcg/want-list-item.model";
import { DB } from "@/src/infra/db/db";
import { wantListItems } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllWantListItemsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllWantListItemsResult {
  wantListItems: WantListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllWantListItemsQuery(
  db: DB,
  options: GetAllWantListItemsOptions = {}
): Promise<GetAllWantListItemsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(wantListItems);

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated want list items
  const wantListItemsResult = await db
    .select()
    .from(wantListItems)
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
