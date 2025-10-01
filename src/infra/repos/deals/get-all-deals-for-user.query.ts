import { Deal } from "@/src/domain/tcg/deal.model";
import { DB } from "@/src/infra/db/db";
import { deals } from "@/src/infra/db/schema";
import { desc, eq, or, sql } from "drizzle-orm";

export interface GetAllDealsForUserOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllDealsForUserResult {
  deals: Deal[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllDealsForUserQuery(
  db: DB,
  userId: string,
  options: GetAllDealsForUserOptions = {}
): Promise<GetAllDealsForUserResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(deals)
    .where(or(eq(deals.sellerId, userId), eq(deals.buyerId, userId)));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated deals
  const dealsResult = await db
    .select()
    .from(deals)
    .where(or(eq(deals.sellerId, userId), eq(deals.buyerId, userId)))
    .orderBy(desc(deals.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    deals: dealsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
