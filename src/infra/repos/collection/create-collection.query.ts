import {
  Collection,
  InsertCollection,
} from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema";

export interface CreateCollectionResult {
  success: boolean;
  collection?: Collection;
  error?: string;
}

export async function createCollectionQuery(
  db: DB,
  insertCollection: InsertCollection
): Promise<CreateCollectionResult> {
  try {
    const result = await db
      .insert(collections)
      .values(insertCollection)
      .returning();

    return {
      success: true,
      collection: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
