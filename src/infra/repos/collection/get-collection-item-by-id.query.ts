import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetCollectionItemByIdResult {
  success: boolean;
  collectionItem?: CollectionItem;
  error?: string;
}

export async function getCollectionItemByIdQuery(
  db: DB,
  id: string
): Promise<GetCollectionItemByIdResult> {
  try {
    const result = await db.query.collectionItems.findFirst({
      where: eq(collectionItems.id, id),
    });

    if (result) {
      return {
        success: true,
        collectionItem: result,
      };
    } else {
      return {
        success: false,
        error: "Collection item not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
