import { DB } from "@/src/infra/db/db";
import {
  collectionItems,
  collections as collectionsTable,
  dealItems,
  deals,
  priceHistory,
} from "@/src/infra/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export interface GetCollectionInformationOptions {
  includeFoil?: boolean;
  priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
}

export interface CollectionInformation {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
  totalValue: number;
  dealCount: number;
  breakdown: {
    foilValue: number;
    nonFoilValue: number;
    customPriceValue: number;
    marketPriceValue: number;
  };
}

export interface GetCollectionInformationResult {
  collections: CollectionInformation[];
  totalCards: number;
  totalValue: number;
  totalDeals: number;
}

export async function getCollectionInformationQuery(
  db: DB,
  userId: string,
  options: GetCollectionInformationOptions = {}
): Promise<GetCollectionInformationResult> {
  try {
    const { includeFoil = true, priceSource = "tcg" } = options;

    console.log("Starting getCollectionInformationQuery with:", {
      userId,
      includeFoil,
      priceSource,
    });

    // Get all collections for the user
    const userCollections = await db.query.collections.findMany({
      where: eq(collectionsTable.userId, userId),
      columns: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: desc(collectionsTable.createdAt),
    });

    console.log("Found collections:", userCollections.length);

    if (userCollections.length === 0) {
      return {
        collections: [],
        totalCards: 0,
        totalValue: 0,
        totalDeals: 0,
      };
    }

    const collectionIds = userCollections.map((c) => c.id);

    // Get collection items with their pricing information
    const collectionItemsResult = await db
      .select({
        collectionId: collectionItems.collectionId,
        cardScryfallId: collectionItems.cardScryfallId,
        quantity: collectionItems.quantity,
        condition: collectionItems.condition,
        isFoil: collectionItems.isFoil,
        customPrice: collectionItems.customPrice,
        priceSource: collectionItems.priceSource,
      })
      .from(collectionItems)
      .where(inArray(collectionItems.collectionId, collectionIds));

    console.log("Found collection items:", collectionItemsResult.length);

    // Get deal counts for each collection
    const dealCountsResult = await db
      .select({
        collectionId: collectionItems.collectionId,
        dealCount: sql<number>`count(distinct ${deals.id})`,
      })
      .from(deals)
      .innerJoin(dealItems, eq(deals.id, dealItems.dealId))
      .innerJoin(
        collectionItems,
        eq(dealItems.collectionItemId, collectionItems.id)
      )
      .where(inArray(collectionItems.collectionId, collectionIds))
      .groupBy(collectionItems.collectionId);

    console.log("Found deal counts:", dealCountsResult.length);

    // Create deal count map
    const dealCountMap = new Map<string, number>();
    for (const result of dealCountsResult) {
      dealCountMap.set(result.collectionId, Number(result.dealCount));
    }

    // Get unique card scryfall IDs for price lookup
    const cardScryfallIds = collectionItemsResult
      .map((item) => item.cardScryfallId)
      .filter((value, index, self) => self.indexOf(value) === index);

    console.log("Unique card scryfall IDs:", cardScryfallIds.length);

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

      console.log("Found price history entries:", latestPrices.length);
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

    // Calculate information for each collection
    const collections: CollectionInformation[] = [];
    let totalCards = 0;
    let totalValue = 0;
    let totalDeals = 0;

    for (const collection of userCollections) {
      const collectionItemsForCollection = collectionItemsResult.filter(
        (item) => item.collectionId === collection.id
      );

      let cardCount = 0;
      let collectionValue = 0;
      let foilValue = 0;
      let nonFoilValue = 0;
      let customPriceValue = 0;
      let marketPriceValue = 0;

      for (const item of collectionItemsForCollection) {
        const quantity = item.quantity;
        cardCount += quantity;

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
        collectionValue += itemTotalValue;

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

      const dealCount = dealCountMap.get(collection.id) || 0;

      collections.push({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        isPublic: collection.isPublic,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
        cardCount,
        totalValue: collectionValue,
        dealCount,
        breakdown: {
          foilValue,
          nonFoilValue,
          customPriceValue,
          marketPriceValue,
        },
      });

      totalCards += cardCount;
      totalValue += collectionValue;
      totalDeals += dealCount;
    }

    console.log("Final result:", {
      collections: collections.length,
      totalCards,
      totalValue,
      totalDeals,
    });

    return {
      collections,
      totalCards,
      totalValue,
      totalDeals,
    };
  } catch (error) {
    console.error("Error in getCollectionInformationQuery:", error);
    throw error;
  }
}
