import { Deal } from "@/src/domain/tcg/deal.model";
import { DB } from "@/src/infra/db/db";
import { deals } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllDealsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllDealsResult {
  deals: Deal[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllDealsQuery(
  db: DB,
  options: GetAllDealsOptions = {}
): Promise<GetAllDealsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(deals);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated deals
  let query = db.select().from(deals).orderBy(desc(deals.createdAt));

  // Handle negative pageSize (treat as "no limit")
  if (pageSize < 0) {
    // When pageSize is negative, ignore offset to avoid skipping rows
    query = query.limit(Number.MAX_SAFE_INTEGER);
  } else {
    query = query.limit(pageSize).offset(offset);
  }

  const dealsResult = await query;

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    deals: dealsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
