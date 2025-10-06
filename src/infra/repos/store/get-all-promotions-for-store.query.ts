import { Promotion } from "@/src/domain/tcg/promotion.model";
import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllPromotionsForStoreOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllPromotionsForStoreResult {
  promotions: Promotion[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllPromotionsForStoreQuery(
  db: DB,
  storeId: string,
  options: GetAllPromotionsForStoreOptions = {}
): Promise<GetAllPromotionsForStoreResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(promotions)
    .where(eq(promotions.storeId, storeId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated promotions
  const promotionsResult = await db
    .select()
    .from(promotions)
    .where(eq(promotions.storeId, storeId))
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
