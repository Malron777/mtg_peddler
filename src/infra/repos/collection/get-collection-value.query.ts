import { DB } from "@/src/infra/db/db";
import { collectionItems, priceHistory } from "@/src/infra/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

export interface GetCollectionValueOptions {
  includeFoil?: boolean;
  priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
}

export interface GetCollectionValueResult {
  collectionId: string;
  totalValue: number;
  itemCount: number;
  breakdown: {
    foilValue: number;
    nonFoilValue: number;
    customPriceValue: number;
    marketPriceValue: number;
  };
}

export async function getCollectionValueQuery(
  db: DB,
  collectionId: string,
  options: GetCollectionValueOptions = {}
): Promise<GetCollectionValueResult> {
  const { includeFoil = true, priceSource = "tcg" } = options;

  // Get collection items with their pricing information
  const collectionItemsResult = await db.query.collectionItems.findMany({
    where: eq(collectionItems.collectionId, collectionId),
    columns: {
      id: true,
      cardScryfallId: true,
      quantity: true,
      condition: true,
      isFoil: true,
      customPrice: true,
      priceSource: true,
    },
  });

  if (collectionItemsResult.length === 0) {
    return {
      collectionId,
      totalValue: 0,
      itemCount: 0,
      breakdown: {
        foilValue: 0,
        nonFoilValue: 0,
        customPriceValue: 0,
        marketPriceValue: 0,
      },
    };
  }

  // Get latest prices for cards
  const cardScryfallIds = collectionItemsResult.map(
    (item) => item.cardScryfallId
  );

  const latestPrices = await db.query.priceHistory.findMany({
    where: and(
      sql`${priceHistory.cardScryfallId} IN (${sql.join(
        cardScryfallIds.map((id) => sql`${id}`),
        sql`, `
      )})`,
      eq(priceHistory.source, priceSource)
    ),
    columns: {
      cardScryfallId: true,
      price: true,
      source: true,
    },
    orderBy: [desc(priceHistory.fetchedAt)],
  });

  // Create a map of latest prices by card
  const priceMap = new Map<string, number>();
  const processedCards = new Set<string>();

  for (const price of latestPrices) {
    if (!processedCards.has(price.cardScryfallId)) {
      priceMap.set(price.cardScryfallId, Number(price.price));
      processedCards.add(price.cardScryfallId);
    }
  }

  // Calculate total value
  let totalValue = 0;
  let itemCount = 0;
  let foilValue = 0;
  let nonFoilValue = 0;
  let customPriceValue = 0;
  let marketPriceValue = 0;

  for (const item of collectionItemsResult) {
    const quantity = item.quantity;
    itemCount += quantity;

    let itemPrice = 0;
    let isCustomPrice = false;

    // Use custom price if available, otherwise use market price
    if (item.customPrice) {
      itemPrice = Number(item.customPrice);
      isCustomPrice = true;
    } else {
      const marketPrice = priceMap.get(item.cardScryfallId);
      if (marketPrice) {
        itemPrice = marketPrice;

        // Apply foil multiplier (typically 1.5x for foil cards)
        if (item.isFoil && includeFoil) {
          itemPrice *= 1.5;
        }
      }
    }

    const itemTotalValue = itemPrice * quantity;
    totalValue += itemTotalValue;

    if (isCustomPrice) {
      customPriceValue += itemTotalValue;
    } else {
      marketPriceValue += itemTotalValue;
    }

    if (item.isFoil && includeFoil) {
      foilValue += itemTotalValue;
    } else {
      nonFoilValue += itemTotalValue;
    }
  }

  return {
    collectionId,
    totalValue,
    itemCount,
    breakdown: {
      foilValue,
      nonFoilValue,
      customPriceValue,
      marketPriceValue,
    },
  };
}
