import { DB } from "@/src/infra/db/db";
import {
  cards,
  collectionItems,
  collections,
  wantListItems,
} from "@/src/infra/db/schema";
import { user } from "@/src/infra/db/schema/auth";
import { and, eq, inArray } from "drizzle-orm";

export interface GetWantListMatchesOptions {
  wantListId: string;
  includePrivateCollections?: boolean;
}

export interface WantListMatch {
  collectionId: string;
  collectionName: string;
  collectionOwnerId: string;
  collectionOwnerName: string;
  isPublic: boolean;
  matchingCards: Array<{
    cardScryfallId: string;
    cardName: string;
    cardSetName: string;
    wantedQuantity: number;
    availableQuantity: number;
    condition: string;
    isFoil: boolean;
    listingType: string;
    customPrice?: string;
  }>;
  totalMatches: number;
}

export interface GetWantListMatchesResult {
  matches: WantListMatch[];
  totalMatches: number;
}

export async function getWantListMatchesQuery(
  db: DB,
  options: GetWantListMatchesOptions
): Promise<GetWantListMatchesResult> {
  const { wantListId, includePrivateCollections = false } = options;

  // Get want list items
  const wantListItemsResult = await db
    .select({
      wantListId: wantListItems.wantListId,
      cardScryfallId: wantListItems.cardScryfallId,
      quantityWanted: wantListItems.quantityWanted,
      conditionMinimum: wantListItems.conditionMinimum,
    })
    .from(wantListItems)
    .where(eq(wantListItems.wantListId, wantListId));

  if (wantListItemsResult.length === 0) {
    return {
      matches: [],
      totalMatches: 0,
    };
  }

  // Get unique card scryfall IDs from want list
  const wantedCardIds = wantListItemsResult.map((item) => item.cardScryfallId);

  // Find collections that have these cards
  const collectionsWithMatchingCards = await db
    .select({
      collectionId: collections.id,
      collectionName: collections.name,
      collectionOwnerId: collections.userId,
      collectionOwnerName: user.name,
      isPublic: collections.isPublic,
      cardScryfallId: collectionItems.cardScryfallId,
      cardName: cards.name,
      cardSetName: cards.setName,
      availableQuantity: collectionItems.quantity,
      condition: collectionItems.condition,
      isFoil: collectionItems.isFoil,
      listingType: collectionItems.listingType,
      customPrice: collectionItems.customPrice,
    })
    .from(collections)
    .innerJoin(user, eq(collections.userId, user.id))
    .innerJoin(
      collectionItems,
      eq(collections.id, collectionItems.collectionId)
    )
    .innerJoin(cards, eq(collectionItems.cardScryfallId, cards.scryfallId))
    .where(
      and(
        inArray(collectionItems.cardScryfallId, wantedCardIds),
        includePrivateCollections ? undefined : eq(collections.isPublic, true)
      )
    );

  // Group matches by collection
  const collectionMatches = new Map<string, WantListMatch>();

  for (const match of collectionsWithMatchingCards) {
    let collectionMatch = collectionMatches.get(match.collectionId);

    if (!collectionMatch) {
      collectionMatch = {
        collectionId: match.collectionId,
        collectionName: match.collectionName,
        collectionOwnerId: match.collectionOwnerId,
        collectionOwnerName: match.collectionOwnerName,
        isPublic: match.isPublic,
        matchingCards: [],
        totalMatches: 0,
      };
      collectionMatches.set(match.collectionId, collectionMatch);
    }

    // Find the corresponding want list item
    const wantListItem = wantListItemsResult.find(
      (item) => item.cardScryfallId === match.cardScryfallId
    );

    if (wantListItem) {
      collectionMatch.matchingCards.push({
        cardScryfallId: match.cardScryfallId,
        cardName: match.cardName,
        cardSetName: match.cardSetName,
        wantedQuantity: wantListItem.quantityWanted,
        availableQuantity: match.availableQuantity,
        condition: match.condition,
        isFoil: match.isFoil,
        listingType: match.listingType,
        customPrice: match.customPrice || undefined,
      });
      collectionMatch.totalMatches++;
    }
  }

  const matches = Array.from(collectionMatches.values());
  const totalMatches = matches.reduce(
    (sum, match) => sum + match.totalMatches,
    0
  );

  return {
    matches,
    totalMatches,
  };
}
