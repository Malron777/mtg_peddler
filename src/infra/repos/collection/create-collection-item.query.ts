import {
  CollectionItem,
  InsertCollectionItem,
} from "@/src/domain/tcg/collection-item.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema";

export interface CreateCollectionItemResult {
  success: boolean;
  collectionItem?: CollectionItem;
  error?: string;
}

export async function createCollectionItemQuery(
  db: DB,
  insertCollectionItem: InsertCollectionItem
): Promise<CreateCollectionItemResult> {
  try {
    const result = await db
      .insert(collectionItems)
      .values(insertCollectionItem)
      .returning();

    return {
      success: true,
      collectionItem: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
