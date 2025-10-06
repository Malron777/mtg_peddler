import { Collection } from "@/src/domain/tcg/collection.model";
import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetCollectionResult {
  success: boolean;
  collection?: Collection;
  error?: string;
}

export async function getCollectionQuery(
  db: DB,
  id: string
): Promise<GetCollectionResult> {
  try {
    const result = await db.query.collections.findFirst({
      where: eq(collections.id, id),
    });

    if (result) {
      return {
        success: true,
        collection: result,
      };
    } else {
      return {
        success: false,
        error: "Collection not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
