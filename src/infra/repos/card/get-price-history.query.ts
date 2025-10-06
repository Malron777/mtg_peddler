import { PriceHistory } from "@/src/domain/tcg/price-history.model";
import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetPriceHistoryResult {
  success: boolean;
  priceHistory?: PriceHistory;
  error?: string;
}

export async function getPriceHistoryQuery(
  db: DB,
  id: string
): Promise<GetPriceHistoryResult> {
  try {
    const result = await db.query.priceHistory.findFirst({
      where: eq(priceHistory.id, id),
    });

    if (result) {
      return {
        success: true,
        priceHistory: result,
      };
    } else {
      return {
        success: false,
        error: "Price history not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
