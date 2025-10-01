import { Store } from "@/src/domain/auth/stores.model";
import { DB } from "@/src/infra/db/db";
import { stores } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllStoresOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllStoresResult {
  stores: Store[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllStoresQuery(
  db: DB,
  options: GetAllStoresOptions = {}
): Promise<GetAllStoresResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(stores);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated stores
  const storesResult = await db
    .select()
    .from(stores)
    .orderBy(desc(stores.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    stores: storesResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
