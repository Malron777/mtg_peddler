import { DB } from "@/src/infra/db/db";
import { collectionItems, dealItems, deals } from "@/src/infra/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export interface RemoveDealCardsFromCollectionOptions {
  dryRun?: boolean;
}

export interface RemovedCard {
  collectionItemId: string;
  cardScryfallId: string;
  quantityRemoved: number;
  originalQuantity: number;
}

export interface RemoveDealCardsFromCollectionResult {
  success: boolean;
  removedCards: RemovedCard[];
  totalCardsRemoved: number;
  dealId: string;
  collectionId: string;
  error?: string;
}

export async function removeDealCardsFromCollectionQuery(
  db: DB,
  dealId: string,
  collectionId: string,
  options: RemoveDealCardsFromCollectionOptions = {}
): Promise<RemoveDealCardsFromCollectionResult> {
  const { dryRun = false } = options;

  try {
    // Verify deal exists
    const deal = await db.query.deals.findFirst({
      where: eq(deals.id, dealId),
      columns: {
        id: true,
      },
    });

    if (!deal) {
      return {
        success: false,
        removedCards: [],
        totalCardsRemoved: 0,
        dealId,
        collectionId,
        error: "Deal not found",
      };
    }

    // Get deal items
    const dealItemsResult = await db.query.dealItems.findMany({
      where: eq(dealItems.dealId, dealId),
      columns: {
        id: true,
        collectionItemId: true,
        quantity: true,
      },
    });

    if (dealItemsResult.length === 0) {
      return {
        success: false,
        removedCards: [],
        totalCardsRemoved: 0,
        dealId,
        collectionId,
        error: "No items found in deal",
      };
    }

    // Get collection items that match the deal items
    const collectionItemIds = dealItemsResult.map(
      (item) => item.collectionItemId
    );

    const collectionItemsResult = await db.query.collectionItems.findMany({
      where: and(
        inArray(collectionItems.id, collectionItemIds),
        eq(collectionItems.collectionId, collectionId)
      ),
      columns: {
        id: true,
        collectionId: true,
        cardScryfallId: true,
        quantity: true,
      },
    });

    if (collectionItemsResult.length === 0) {
      return {
        success: false,
        removedCards: [],
        totalCardsRemoved: 0,
        dealId,
        collectionId,
        error: "No matching collection items found",
      };
    }

    const removedCards: RemovedCard[] = [];
    let totalCardsRemoved = 0;

    if (dryRun) {
      // Just calculate what would be removed without actually removing
      for (const collectionItem of collectionItemsResult) {
        const dealItem = dealItemsResult.find(
          (item) => item.collectionItemId === collectionItem.id
        );

        if (dealItem) {
          const quantityToRemove = Math.min(
            dealItem.quantity,
            collectionItem.quantity
          );
          removedCards.push({
            collectionItemId: collectionItem.id,
            cardScryfallId: collectionItem.cardScryfallId,
            quantityRemoved: quantityToRemove,
            originalQuantity: collectionItem.quantity,
          });
          totalCardsRemoved += quantityToRemove;
        }
      }
    } else {
      // Actually remove the cards from the collection
      for (const collectionItem of collectionItemsResult) {
        const dealItem = dealItemsResult.find(
          (item) => item.collectionItemId === collectionItem.id
        );

        if (dealItem) {
          const quantityToRemove = Math.min(
            dealItem.quantity,
            collectionItem.quantity
          );
          const remainingQuantity = collectionItem.quantity - quantityToRemove;

          if (remainingQuantity <= 0) {
            // Remove the entire collection item
            await db
              .delete(collectionItems)
              .where(eq(collectionItems.id, collectionItem.id));
          } else {
            // Update the quantity
            await db
              .update(collectionItems)
              .set({ quantity: remainingQuantity })
              .where(eq(collectionItems.id, collectionItem.id));
          }

          removedCards.push({
            collectionItemId: collectionItem.id,
            cardScryfallId: collectionItem.cardScryfallId,
            quantityRemoved: quantityToRemove,
            originalQuantity: collectionItem.quantity,
          });
          totalCardsRemoved += quantityToRemove;
        }
      }
    }

    return {
      success: true,
      removedCards,
      totalCardsRemoved,
      dealId,
      collectionId,
    };
  } catch (error) {
    return {
      success: false,
      removedCards: [],
      totalCardsRemoved: 0,
      dealId,
      collectionId,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
