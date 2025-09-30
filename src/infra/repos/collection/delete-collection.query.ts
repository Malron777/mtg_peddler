import { DB } from "@/src/infra/db/db";
import { collections } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteCollectionResult {
  success: boolean;
  error?: string;
}

export async function deleteCollectionQuery(
  db: DB,
  id: string
): Promise<DeleteCollectionResult> {
  try {
    await db.delete(collections).where(eq(collections.id, id));

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
