import { Collection } from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllCollectionsForUserOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllCollectionsForUserResult {
  collections: Collection[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllCollectionsForUserQuery(
  db: DB,
  userId: string,
  options: GetAllCollectionsForUserOptions = {}
): Promise<GetAllCollectionsForUserResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(collections)
    .where(eq(collections.userId, userId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated collections
  const collectionsResult = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(desc(collections.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    collections: collectionsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
