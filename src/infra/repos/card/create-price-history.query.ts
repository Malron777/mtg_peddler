import {
  InsertPriceHistory,
  PriceHistory,
} from "@/src/domain/tcg/price-history.model";
import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema";

export interface CreatePriceHistoryResult {
  success: boolean;
  priceHistory?: PriceHistory;
  error?: string;
}

export async function createPriceHistoryQuery(
  db: DB,
  insertPriceHistory: InsertPriceHistory
): Promise<CreatePriceHistoryResult> {
  try {
    const result = await db
      .insert(priceHistory)
      .values(insertPriceHistory)
      .returning();

    return {
      success: true,
      priceHistory: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
