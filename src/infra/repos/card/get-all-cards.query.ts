import { Card } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { desc, sql } from "drizzle-orm";
import { RefreshCardFromScryfallService } from "./refresh-card-from-scryfall.service";

export interface GetAllCardsOptions {
  page?: number;
  pageSize?: number;
  cacheWindowDays?: number;
  forceRefresh?: boolean;
}

export interface GetAllCardsResult {
  cards: Card[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  refreshedCards: number;
}

export async function getAllCardsQuery(
  db: DB,
  options: GetAllCardsOptions = {}
): Promise<GetAllCardsResult> {
  const {
    page = 1,
    pageSize = 50,
    cacheWindowDays = 1,
    forceRefresh = false,
  } = options;
  const limit = pageSize < 0 ? Number.MAX_SAFE_INTEGER : pageSize;
  const offset = pageSize < 0 ? 0 : (page - 1) * pageSize;
  const refreshService = new RefreshCardFromScryfallService();

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(cards);

  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated cards
  const cardsResult = await db
    .select()
    .from(cards)
    .orderBy(desc(cards.createdAt))
    .limit(limit)
    .offset(offset);

  // Check for stale cards and refresh them
  let refreshedCards = 0;
  const refreshedCardsList: Card[] = [];

  for (const card of cardsResult) {
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
