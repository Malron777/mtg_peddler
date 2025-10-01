import { Card } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllCardsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllCardsResult {
  cards: Card[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllCardsQuery(
  db: DB,
  options: GetAllCardsOptions = {}
): Promise<GetAllCardsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(cards);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated cards
  let query = db.select().from(cards).orderBy(desc(cards.createdAt));

  // Handle negative pageSize (treat as "no limit")
  if (pageSize < 0) {
    // When pageSize is negative, ignore offset to avoid skipping rows
    query = query.limit(Number.MAX_SAFE_INTEGER);
  } else {
    query = query.limit(pageSize).offset(offset);
  }

  const cardsResult = await query;

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    cards: cardsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
