import { PriceHistory } from "@/src/domain/tcg/price-history.model";
import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllPriceHistoryOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllPriceHistoryResult {
  priceHistory: PriceHistory[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllPriceHistoryQuery(
  db: DB,
  options: GetAllPriceHistoryOptions = {}
): Promise<GetAllPriceHistoryResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(priceHistory);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated price history
  const priceHistoryResult = await db
    .select()
    .from(priceHistory)
    .orderBy(desc(priceHistory.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    priceHistory: priceHistoryResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
