import { PriceHistory } from "@/src/domain/tcg/price-history.model";
import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetPriceHistoryForCardOptions {
  page?: number;
  pageSize?: number;
}

export interface GetPriceHistoryForCardResult {
  priceHistory: PriceHistory[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getPriceHistoryForCardQuery(
  db: DB,
  cardScryfallId: string,
  options: GetPriceHistoryForCardOptions = {}
): Promise<GetPriceHistoryForCardResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(priceHistory)
    .where(eq(priceHistory.cardScryfallId, cardScryfallId));

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated price history
  const priceHistoryResult = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.cardScryfallId, cardScryfallId))
    .orderBy(desc(priceHistory.fetchedAt))
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
