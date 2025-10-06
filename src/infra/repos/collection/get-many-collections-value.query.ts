import { DB } from "@/src/infra/db/db";
import {
  collectionItems,
  collections as collectionsTable,
  priceHistory,
} from "@/src/infra/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export interface GetManyCollectionsValueOptions {
  includeFoil?: boolean;
  priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
}

export interface CollectionValueResult {
  collectionId: string;
  collectionName: string;
  totalValue: number;
  itemCount: number;
  breakdown: {
    foilValue: number;
    nonFoilValue: number;
    customPriceValue: number;
    marketPriceValue: number;
  };
}

export interface GetManyCollectionsValueResult {
  collections: CollectionValueResult[];
  totalValue: number;
  totalItemCount: number;
}

export async function getManyCollectionsValueQuery(
  db: DB,
  collectionIds: string[],
  options: GetManyCollectionsValueOptions = {}
): Promise<GetManyCollectionsValueResult> {
  const { includeFoil = true, priceSource = "tcg" } = options;

  if (collectionIds.length === 0) {
    return {
      collections: [],
      totalValue: 0,
      totalItemCount: 0,
    };
  }

  // Get collections with their items and pricing information
  const collectionsWithItems = await db
    .select({
      collectionId: collectionsTable.id,
      collectionName: collectionsTable.name,
      itemId: collectionItems.id,
      cardScryfallId: collectionItems.cardScryfallId,
      quantity: collectionItems.quantity,
      condition: collectionItems.condition,
      isFoil: collectionItems.isFoil,
      customPrice: collectionItems.customPrice,
      priceSource: collectionItems.priceSource,
    })
    .from(collectionsTable)
    .leftJoin(
      collectionItems,
      eq(collectionsTable.id, collectionItems.collectionId)
    )
    .where(inArray(collectionsTable.id, collectionIds));

  if (collectionsWithItems.length === 0) {
    return {
      collections: [],
      totalValue: 0,
      totalItemCount: 0,
    };
  }

  // Get unique card scryfall IDs
  const cardScryfallIds = collectionsWithItems
    .filter((item) => item.cardScryfallId)
    .map((item) => item.cardScryfallId!)
    .filter((value, index, self) => self.indexOf(value) === index);

  // Get latest prices for cards
  let latestPrices: Array<{
    cardScryfallId: string;
    price: string;
    source: string;
  }> = [];

  if (cardScryfallIds.length > 0) {
    latestPrices = await db
      .select({
        cardScryfallId: priceHistory.cardScryfallId,
        price: priceHistory.price,
        source: priceHistory.source,
      })
      .from(priceHistory)
      .where(
        and(
          inArray(priceHistory.cardScryfallId, cardScryfallIds),
          eq(priceHistory.source, priceSource)
        )
      )
      .orderBy(desc(priceHistory.fetchedAt));
  }

  // Create a map of latest prices by card
  const priceMap = new Map<string, number>();
  const processedCards = new Set<string>();

  for (const price of latestPrices) {
    if (!processedCards.has(price.cardScryfallId)) {
      priceMap.set(price.cardScryfallId, Number(price.price));
      processedCards.add(price.cardScryfallId);
    }
  }

  // Group items by collection and calculate values
  const collectionMap = new Map<string, CollectionValueResult>();

  for (const item of collectionsWithItems) {
    if (!item.itemId) {
      // Collection has no items
      if (!collectionMap.has(item.collectionId)) {
        collectionMap.set(item.collectionId, {
          collectionId: item.collectionId,
          collectionName: item.collectionName,
          totalValue: 0,
          itemCount: 0,
          breakdown: {
            foilValue: 0,
            nonFoilValue: 0,
            customPriceValue: 0,
            marketPriceValue: 0,
          },
        });
      }
      continue;
    }

    let collectionResult = collectionMap.get(item.collectionId);
    if (!collectionResult) {
      collectionResult = {
        collectionId: item.collectionId,
        collectionName: item.collectionName,
        totalValue: 0,
        itemCount: 0,
        breakdown: {
          foilValue: 0,
          nonFoilValue: 0,
          customPriceValue: 0,
          marketPriceValue: 0,
        },
      };
      collectionMap.set(item.collectionId, collectionResult);
    }

    const quantity = item.quantity;
    collectionResult.itemCount += quantity;

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
    collectionResult.totalValue += itemTotalValue;

    if (isCustomPrice) {
      collectionResult.breakdown.customPriceValue += itemTotalValue;
    } else {
      collectionResult.breakdown.marketPriceValue += itemTotalValue;
    }

    if (item.isFoil && includeFoil) {
      collectionResult.breakdown.foilValue += itemTotalValue;
    } else {
      collectionResult.breakdown.nonFoilValue += itemTotalValue;
    }
  }

  const collections = Array.from(collectionMap.values());
  const totalValue = collections.reduce(
    (sum, collection) => sum + collection.totalValue,
    0
  );
  const totalItemCount = collections.reduce(
    (sum, collection) => sum + collection.itemCount,
    0
  );

  return {
    collections,
    totalValue,
    totalItemCount,
  };
}
