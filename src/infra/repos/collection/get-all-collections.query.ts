import { Collection } from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";

export interface GetAllCollectionsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllCollectionsResult {
  collections: Collection[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllCollectionsQuery(
  db: DB,
  options: GetAllCollectionsOptions = {}
): Promise<GetAllCollectionsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(collections);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated collections
  let query = db
    .select()
    .from(collections)
    .orderBy(desc(collections.createdAt));

  // Handle negative pageSize (treat as "no limit")
  if (pageSize < 0) {
    // When pageSize is negative, ignore offset to avoid skipping rows
    query = query.limit(Number.MAX_SAFE_INTEGER);
  } else {
    query = query.limit(pageSize).offset(offset);
  }

  const collectionsResult = await query;

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    collections: collectionsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
