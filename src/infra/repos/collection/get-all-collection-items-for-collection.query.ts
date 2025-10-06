import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllCollectionItemsForCollectionOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllCollectionItemsForCollectionResult {
  collectionItems: CollectionItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllCollectionItemsForCollectionQuery(
  db: DB,
  collectionId: string,
  options: GetAllCollectionItemsForCollectionOptions = {}
): Promise<GetAllCollectionItemsForCollectionResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, collectionId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated collection items
  const collectionItemsResult = await db
    .select()
    .from(collectionItems)
    .where(eq(collectionItems.collectionId, collectionId))
    .orderBy(desc(collectionItems.createdAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    collectionItems: collectionItemsResult,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
