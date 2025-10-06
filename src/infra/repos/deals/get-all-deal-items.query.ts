import { DealItem } from "@/src/domain/tcg/deal-item.model";
import { DB } from "@/src/infra/db/db";
import { dealItems } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllDealItemsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllDealItemsResult {
  dealItems: DealItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllDealItemsQuery(
  db: DB,
  options: GetAllDealItemsOptions = {}
): Promise<GetAllDealItemsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(dealItems);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated deal items
  const dealItemsResult = await db
    .select()
    .from(dealItems)
    .orderBy(desc(dealItems.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    dealItems: dealItemsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
