import { Card } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import {
  cards,
  collectionItems,
  collections,
  priceHistory,
} from "@/src/infra/db/schema";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";

export interface GetCardsByPriceOptions {
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
  includeFoil?: boolean;
  sortBy?: "price" | "name" | "setName";
  sortOrder?: "asc" | "desc";
  onlyAvailable?: boolean;
}

export interface CardWithPrice {
  card: Card;
  currentPrice: number;
  priceSource: string;
  availableQuantity?: number;
  collectionsWithCard?: Array<{
    collectionId: string;
    collectionName: string;
    quantity: number;
    condition: string;
    isFoil: boolean;
    listingType: string;
  }>;
}

export interface GetCardsByPriceResult {
  cards: CardWithPrice[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export async function getCardsByPriceQuery(
  db: DB,
  options: GetCardsByPriceOptions = {}
): Promise<GetCardsByPriceResult> {
  const {
    minPrice,
    maxPrice,
    page = 1,
    pageSize = 50,
    priceSource = "tcg",
    includeFoil = true,
    sortBy = "price",
    sortOrder = "asc",
    onlyAvailable = false,
  } = options;

  const limit = pageSize < 0 ? Number.MAX_SAFE_INTEGER : pageSize;
  const offset = pageSize < 0 ? 0 : (page - 1) * pageSize;

  // Build price filter conditions
  const priceConditions = [];
  if (minPrice !== undefined) {
    priceConditions.push(gte(priceHistory.price, minPrice.toString()));
  }
  if (maxPrice !== undefined) {
    priceConditions.push(lte(priceHistory.price, maxPrice.toString()));
  }

  // Get latest prices for cards within price range
  const latestPricesSubquery = db
    .select({
      cardScryfallId: priceHistory.cardScryfallId,
      price: priceHistory.price,
      source: priceHistory.source,
      rowNumber:
        sql<number>`ROW_NUMBER() OVER (PARTITION BY ${priceHistory.cardScryfallId} ORDER BY ${priceHistory.fetchedAt} DESC)`.as(
          "row_number"
        ),
    })
    .from(priceHistory)
    .where(and(eq(priceHistory.source, priceSource), ...priceConditions))
    .as("latest_prices");

  // Get cards with their latest prices
  let cardsQuery = db
    .select({
      scryfallId: cards.scryfallId,
      oracleId: cards.oracleId,
      name: cards.name,
      setCode: cards.setCode,
      setName: cards.setName,
      imageUris: cards.imageUris,
      pricesLastUpdated: cards.pricesLastUpdated,
      cachedData: cards.cachedData,
      lastFetchedAt: cards.lastFetchedAt,
      createdAt: cards.createdAt,
      updatedAt: cards.updatedAt,
      currentPrice: latestPricesSubquery.price,
      priceSource: latestPricesSubquery.source,
    })
    .from(cards)
    .innerJoin(
      latestPricesSubquery,
      and(
        eq(cards.scryfallId, latestPricesSubquery.cardScryfallId),
        eq(latestPricesSubquery.rowNumber, 1)
      )
    );

  // Add availability filter if requested
  if (onlyAvailable) {
    cardsQuery = cardsQuery
      .innerJoin(
        collectionItems,
        eq(cards.scryfallId, collectionItems.cardScryfallId)
      )
      .innerJoin(collections, eq(collectionItems.collectionId, collections.id))
      .where(eq(collections.isPublic, true));
  }

  // Apply sorting
  const sortColumn =
    sortBy === "price"
      ? latestPricesSubquery.price
      : sortBy === "name"
      ? cards.name
      : cards.setName;

  const sortDirection = sortOrder === "desc" ? desc : asc;
  cardsQuery = cardsQuery.orderBy(sortDirection(sortColumn));

  // Get total count
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(cards)
    .innerJoin(
      latestPricesSubquery,
      and(
        eq(cards.scryfallId, latestPricesSubquery.cardScryfallId),
        eq(latestPricesSubquery.rowNumber, 1)
      )
    );

  if (onlyAvailable) {
    countQuery
      .innerJoin(
        collectionItems,
        eq(cards.scryfallId, collectionItems.cardScryfallId)
      )
      .innerJoin(collections, eq(collectionItems.collectionId, collections.id))
      .where(eq(collections.isPublic, true));
  }

  const countResult = await countQuery;
  const totalCount = Number(countResult[0]?.count ?? 0);

  // Get paginated results
  const cardsResult = await cardsQuery.limit(limit).offset(offset);

  // Get availability information if requested
  const cardsWithAvailability: CardWithPrice[] = [];

  for (const cardData of cardsResult) {
    const card: Card = {
      scryfallId: cardData.scryfallId,
      oracleId: cardData.oracleId,
      name: cardData.name,
      setCode: cardData.setCode,
      setName: cardData.setName,
      imageUris: cardData.imageUris,
      pricesLastUpdated: cardData.pricesLastUpdated,
      cachedData: cardData.cachedData,
      lastFetchedAt: cardData.lastFetchedAt,
      createdAt: cardData.createdAt,
      updatedAt: cardData.updatedAt,
    };

    const cardWithPrice: CardWithPrice = {
      card,
      currentPrice: Number(cardData.currentPrice),
      priceSource: cardData.priceSource,
    };

    // Get availability information
    if (onlyAvailable) {
      const availabilityResult = await db
        .select({
          collectionId: collections.id,
          collectionName: collections.name,
          quantity: collectionItems.quantity,
          condition: collectionItems.condition,
          isFoil: collectionItems.isFoil,
          listingType: collectionItems.listingType,
        })
        .from(collectionItems)
        .innerJoin(
          collections,
          eq(collectionItems.collectionId, collections.id)
        )
        .where(
          and(
            eq(collectionItems.cardScryfallId, card.scryfallId),
            eq(collections.isPublic, true)
          )
        );

      cardWithPrice.availableQuantity = availabilityResult.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      cardWithPrice.collectionsWithCard = availabilityResult.map((item) => ({
        collectionId: item.collectionId,
        collectionName: item.collectionName,
        quantity: item.quantity,
        condition: item.condition,
        isFoil: item.isFoil,
        listingType: item.listingType,
      }));
    }

    cardsWithAvailability.push(cardWithPrice);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  // Calculate actual price range from results
  const prices = cardsWithAvailability.map((c) => c.currentPrice);
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0,
  };

  return {
    cards: cardsWithAvailability,
    totalCount,
    page,
    pageSize,
    totalPages,
    priceRange,
  };
}
