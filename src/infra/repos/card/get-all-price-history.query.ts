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
  let query = db
    .select()
    .from(priceHistory)
    .orderBy(desc(priceHistory.createdAt));

  // Handle negative pageSize (treat as "no limit")
  if (pageSize < 0) {
    // When pageSize is negative, ignore offset to avoid skipping rows
    query = query.limit(Number.MAX_SAFE_INTEGER);
  } else {
    query = query.limit(pageSize).offset(offset);
  }

  const priceHistoryResult = await query;

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    priceHistory: priceHistoryResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
