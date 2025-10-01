import { Card } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards, collectionItems } from "@/src/infra/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";

export interface GetAllCardsForCollectionOptions {
  page?: number;
  pageSize?: number;
}

export interface GetAllCardsForCollectionResult {
  cards: Card[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAllCardsForCollectionQuery(
  db: DB,
  collectionId: string,
  options: GetAllCardsForCollectionOptions = {}
): Promise<GetAllCardsForCollectionResult> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(distinct ${cards.scryfallId})` })
    .from(cards)
    .innerJoin(
      collectionItems,
      eq(cards.scryfallId, collectionItems.cardScryfallId)
    )
    .where(eq(collectionItems.collectionId, collectionId));

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated cards
  const cardsResult = await db
    .select({ scryfallId: cards.scryfallId })
    .from(cards)
    .innerJoin(
      collectionItems,
      eq(cards.scryfallId, collectionItems.cardScryfallId)
    )
    .where(eq(collectionItems.collectionId, collectionId))
    .orderBy(desc(cards.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Get full card details for the distinct cards
  const cardIds = cardsResult.map((c) => c.scryfallId);
  const fullCards = await db.query.cards.findMany({
    where: inArray(cards.scryfallId, cardIds),
    orderBy: desc(cards.createdAt),
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    cards: fullCards,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}
