import {
  CollectionItem,
  InsertCollectionItem,
} from "@/src/domain/tcg/collection-item.model";
import { DB } from "@/src/infra/db/db";
import { createCardQuery } from "@/src/infra/repos/card/create-card.query";
import { createCollectionItemQuery } from "@/src/infra/repos/collection/create-collection-item.query";
import { deleteCollectionItemQuery } from "@/src/infra/repos/collection/delete-collection-item.query";
import { getCollectionItemByIdQuery } from "@/src/infra/repos/collection/get-collection-item-by-id.query";

export interface ChangeCardVersionResult {
  success: boolean;
  oldCollectionItem?: CollectionItem;
  newCollectionItem?: CollectionItem;
  error?: string;
}

export interface ChangeCardVersionRequest {
  collectionItemId: string;
  newCardScryfallId: string;
  newCardData: {
    scryfallId: string;
    oracleId: string;
    name: string;
    setCode: string;
    setName: string;
    imageUris?: Record<string, string> | null;
    cachedData?: Record<string, unknown>;
  };
}

export class ChangeCardVersionUseCase {
  private readonly db: DB;

  constructor(db: DB) {
    this.db = db;
  }

  async changeCardVersion(
    request: ChangeCardVersionRequest
  ): Promise<ChangeCardVersionResult> {
    try {
      // 1. Get the current collection item
      const currentItemResult = await getCollectionItemByIdQuery(
        this.db,
        request.collectionItemId
      );

      if (!currentItemResult.success || !currentItemResult.collectionItem) {
        return {
          success: false,
          error: "Collection item not found",
        };
      }

      const currentItem = currentItemResult.collectionItem;

      // 2. Ensure the new card exists in the database
      const cardResult = await createCardQuery(this.db, {
        scryfallId: request.newCardData.scryfallId,
        oracleId: request.newCardData.oracleId,
        name: request.newCardData.name,
        setCode: request.newCardData.setCode,
        setName: request.newCardData.setName,
        imageUris: request.newCardData.imageUris,
        cachedData: request.newCardData.cachedData,
      });

      if (!cardResult.success) {
        return {
          success: false,
          error: `Failed to create card: ${cardResult.error}`,
        };
      }

      // 3. Create a new collection item with the new card version
      const newCollectionItemData: InsertCollectionItem = {
        id: crypto.randomUUID(),
        collectionId: currentItem.collectionId,
        cardScryfallId: request.newCardScryfallId,
        quantity: currentItem.quantity,
        condition: currentItem.condition,
        language: currentItem.language,
        isFoil: currentItem.isFoil,
        listingType: currentItem.listingType,
        customPrice: currentItem.customPrice,
        priceSource: currentItem.priceSource,
      };

      const newItemResult = await createCollectionItemQuery(
        this.db,
        newCollectionItemData
      );

      if (!newItemResult.success || !newItemResult.collectionItem) {
        return {
          success: false,
          error: `Failed to create new collection item: ${newItemResult.error}`,
        };
      }

      // 4. Delete the old collection item
      const deleteResult = await deleteCollectionItemQuery(
        this.db,
        request.collectionItemId
      );

      if (!deleteResult.success) {
        // If deletion fails, we should clean up the new item
        await deleteCollectionItemQuery(
          this.db,
          newItemResult.collectionItem.id
        );
        return {
          success: false,
          error: `Failed to delete old collection item: ${deleteResult.error}`,
        };
      }

      return {
        success: true,
        oldCollectionItem: currentItem,
        newCollectionItem: newItemResult.collectionItem,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
