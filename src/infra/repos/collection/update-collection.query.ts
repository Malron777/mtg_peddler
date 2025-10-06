import {
  Collection,
  UpdateCollection,
} from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateCollectionQuery(
  db: DB,
  updateCollection: UpdateCollection
): Promise<Collection> {
  const result = await db
    .update(collections)
    .set({
      ...filterUndefined(updateCollection),
      updatedAt: new Date(),
    })
    .where(eq(collections.id, updateCollection.id))
    .returning();

  return result[0];
}
