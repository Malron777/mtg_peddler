import { Card } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards, collectionItems } from "@/src/infra/db/schema";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { RefreshCardFromScryfallService } from "./refresh-card-from-scryfall.service";

export interface GetAllCardsForCollectionOptions {
  page?: number;
  pageSize?: number;
  cacheWindowDays?: number;
  forceRefresh?: boolean;
}

export interface GetAllCardsForCollectionResult {
  cards: Card[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  refreshedCards: number;
}

export async function getAllCardsForCollectionQuery(
  db: DB,
  collectionId: string,
  options: GetAllCardsForCollectionOptions = {}
): Promise<GetAllCardsForCollectionResult> {
  const {
    page = 1,
    pageSize = 50,
    cacheWindowDays = 1,
    forceRefresh = false,
  } = options;
  const offset = (page - 1) * pageSize;
  const refreshService = new RefreshCardFromScryfallService();

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

  // Check for stale cards and refresh them
  let refreshedCards = 0;
  const refreshedCardsList: Card[] = [];

  for (const card of fullCards) {
    const needsRefresh =
      forceRefresh ||
      refreshService.isCardStale(card.lastFetchedAt, cacheWindowDays);

    if (needsRefresh) {
      const refreshResult = await refreshService.refreshCardFromScryfall(
        db,
        card.scryfallId
      );
      if (refreshResult.success && refreshResult.card) {
        refreshedCardsList.push(refreshResult.card);
        refreshedCards++;
      } else {
        // If refresh fails, keep the original card
        refreshedCardsList.push(card);
        console.warn(
          `Failed to refresh card ${card.scryfallId}: ${refreshResult.error}`
        );
      }
    } else {
      refreshedCardsList.push(card);
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    cards: refreshedCardsList,
    totalCount,
    page,
    pageSize,
    totalPages,
    refreshedCards,
  };
}
