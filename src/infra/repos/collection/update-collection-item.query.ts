import {
  CollectionItem,
  UpdateCollectionItem,
} from "@/src/domain/tcg/collection-item.model";
import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateCollectionItemQuery(
  db: DB,
  updateCollectionItem: UpdateCollectionItem
): Promise<CollectionItem> {
  const result = await db
    .update(collectionItems)
    .set({
      ...filterUndefined(updateCollectionItem),
      updatedAt: new Date(),
    })
    .where(eq(collectionItems.id, updateCollectionItem.id))
    .returning();

  return result[0];
}
