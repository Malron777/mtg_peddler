import { Collection } from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems, collections } from "@/src/infra/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export interface GetAllCollectionsContainingCardsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllCollectionsContainingCardsResult {
  collections: Collection[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllCollectionsContainingCardsQuery(
  db: DB,
  cardScryfallId: string,
  options: GetAllCollectionsContainingCardsOptions = {}
): Promise<GetAllCollectionsContainingCardsResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(distinct ${collections.id})` })
    .from(collections)
    .innerJoin(
      collectionItems,
      eq(collections.id, collectionItems.collectionId)
    )
    .where(eq(collectionItems.cardScryfallId, cardScryfallId));

  const totalCount = countResult[0]?.count ?? 0;

  // Get paginated collections
  const collectionsResult = await db
    .selectDistinct({ id: collections.id })
    .from(collections)
    .innerJoin(
      collectionItems,
      eq(collections.id, collectionItems.collectionId)
    )
    .where(eq(collectionItems.cardScryfallId, cardScryfallId))
    .orderBy(desc(collections.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Get full collection details for the distinct collections
  const collectionIds = collectionsResult.map((c) => c.id);
  const fullCollections = await db
    .select()
    .from(collections)
    .where(sql`${collections.id} = ANY(${collectionIds})`)
    .orderBy(desc(collections.createdAt));

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    collections: fullCollections,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
