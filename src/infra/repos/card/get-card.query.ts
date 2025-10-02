import { Card } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { RefreshCardFromScryfallService } from "./refresh-card-from-scryfall.service";

export interface GetCardOptions {
  cacheWindowDays?: number;
  forceRefresh?: boolean;
}

export interface GetCardResult {
  success: boolean;
  card?: Card;
  error?: string;
  refreshed?: boolean;
}

export async function getCardQuery(
  db: DB,
  scryfallId: string,
  options: GetCardOptions = {}
): Promise<GetCardResult> {
  const { cacheWindowDays = 1, forceRefresh = false } = options;
  const refreshService = new RefreshCardFromScryfallService();

  try {
    const result = await db.query.cards.findFirst({
      where: eq(cards.scryfallId, scryfallId),
    });

    if (!result) {
      return {
        success: false,
        error: "Card not found",
      };
    }

    // Check if card needs refreshing
    const needsRefresh =
      forceRefresh ||
      refreshService.isCardStale(result.lastFetchedAt, cacheWindowDays);

    if (needsRefresh) {
      // Refresh card data from Scryfall
      const refreshResult = await refreshService.refreshCardFromScryfall(
        db,
        scryfallId
      );

      if (refreshResult.success && refreshResult.card) {
        return {
          success: true,
          card: refreshResult.card,
          refreshed: true,
        };
      } else {
        // If refresh fails, return cached data with warning
        console.warn(
          `Failed to refresh card ${scryfallId}: ${refreshResult.error}`
        );
        return {
          success: true,
          card: result,
          refreshed: false,
        };
      }
    }

    return {
      success: true,
      card: result,
      refreshed: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
