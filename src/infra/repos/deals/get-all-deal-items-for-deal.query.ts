import { DealItem } from "@/src/domain/tcg/deal-item.model";
import { DB } from "@/src/infra/db/db";
import { dealItems } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllDealItemsForDealOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllDealItemsForDealResult {
  dealItems: DealItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllDealItemsForDealQuery(
  db: DB,
  dealId: string,
  options: GetAllDealItemsForDealOptions = {}
): Promise<GetAllDealItemsForDealResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(dealItems)
    .where(eq(dealItems.dealId, dealId));

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated deal items
  const dealItemsResult = await db
    .select()
    .from(dealItems)
    .where(eq(dealItems.dealId, dealId))
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
