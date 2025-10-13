import {
  CollectionItem,
  InsertCollectionItem,
} from "@/src/domain/tcg/collection-item.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema";

export interface CreateBulkCollectionItemsResult {
  success: boolean;
  collectionItems?: CollectionItem[];
  error?: string;
}

export async function createBulkCollectionItemsQuery(
  db: DB,
  insertCollectionItems: InsertCollectionItem[]
): Promise<CreateBulkCollectionItemsResult> {
  try {
    // Validate input
    if (!insertCollectionItems || insertCollectionItems.length === 0) {
      return {
        success: true,
        collectionItems: [],
      };
    }

    // Validate each item has required fields
    for (let i = 0; i < insertCollectionItems.length; i++) {
      const item = insertCollectionItems[i];
      if (!item.id || !item.collectionId || !item.cardScryfallId) {
        return {
          success: false,
          error: `Item at index ${i} is missing required fields (id, collectionId, or cardScryfallId)`,
        };
      }
    }

    // Process items one by one to ensure proper error handling
    const results: CollectionItem[] = [];
    const errors: string[] = [];

    for (let i = 0; i < insertCollectionItems.length; i++) {
      try {
        const result = await db
          .insert(collectionItems)
          .values(insertCollectionItems[i])
          .returning();

        results.push(result[0]);
      } catch (error) {
        let errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Provide more specific error messages
        if (errorMessage.includes("foreign key constraint")) {
          errorMessage =
            "Foreign key constraint violation - check that collection and card references exist";
        } else if (errorMessage.includes("duplicate key")) {
          errorMessage = "Duplicate key violation - item already exists";
        } else if (errorMessage.includes("Failed query")) {
          errorMessage = "Database constraint violation";
        }

        errors.push(`Item ${i}: ${errorMessage}`);
      }
    }

    // If any items failed, return error with details
    if (errors.length > 0) {
      return {
        success: false,
        error: `Failed to insert ${errors.length} items: ${errors.join(", ")}`,
      };
    }

    return {
      success: true,
      collectionItems: results,
    };
  } catch (error) {
    console.error("Error creating bulk collection items:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
