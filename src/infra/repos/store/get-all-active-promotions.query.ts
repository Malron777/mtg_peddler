import { Promotion } from "@/src/domain/tcg/promotion.model";
import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema";
import { and, desc, gte, lte, sql } from "drizzle-orm";

export interface GetAllActivePromotionsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllActivePromotionsResult {
  promotions: Promotion[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllActivePromotionsQuery(
  db: DB,
  options: GetAllActivePromotionsOptions = {}
): Promise<GetAllActivePromotionsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;
  const now = new Date();

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(promotions)
    .where(and(lte(promotions.startsAt, now), gte(promotions.endsAt, now)));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated promotions
  const promotionsResult = await db
    .select()
    .from(promotions)
    .where(and(lte(promotions.startsAt, now), gte(promotions.endsAt, now)))
    .orderBy(desc(promotions.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    promotions: promotionsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
