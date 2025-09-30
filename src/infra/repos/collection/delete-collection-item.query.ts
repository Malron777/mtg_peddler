import { DB } from "@/src/infra/db/db";
import { collectionItems } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteCollectionItemResult {
  success: boolean;
  error?: string;
}

export async function deleteCollectionItemQuery(
  db: DB,
  id: string
): Promise<DeleteCollectionItemResult> {
  try {
    await db.delete(collectionItems).where(eq(collectionItems.id, id));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
