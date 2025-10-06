import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeletePriceHistoryResult {
  success: boolean;
  error?: string;
}

export async function deletePriceHistoryQuery(
  db: DB,
  id: string
): Promise<DeletePriceHistoryResult> {
  try {
    await db.delete(priceHistory).where(eq(priceHistory.id, id));

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
