import { Collection } from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems, collections } from "@/src/infra/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";

export interface GetAllCollectionsContainingCardsOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllCollectionsContainingCardResult {
  collections: Collection[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllCollectionsContainingCardQuery(
  db: DB,
  cardScryfallId: string,
  options: GetAllCollectionsContainingCardsOptions = {}
): Promise<GetAllCollectionsContainingCardResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  if (cardScryfallId === "") {
    return {
      collections: [],
      totalCount: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    };
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(distinct ${collections.id})` })
    .from(collections)
    .innerJoin(
      collectionItems,
      eq(collections.id, collectionItems.collectionId)
    )
    .where(eq(collectionItems.cardScryfallId, cardScryfallId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated collections
  const collectionsResult = await db
    .select({ id: collections.id })
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
  const fullCollections = await db.query.collections.findMany({
    where: inArray(collections.id, collectionIds),
    orderBy: desc(collections.createdAt),
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    collections: fullCollections,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
