import {
  PriceHistory,
  UpdatePriceHistory,
} from "@/src/domain/tcg/price-history.model";
import { DB } from "@/src/infra/db/db";
import { priceHistory } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updatePriceHistoryQuery(
  db: DB,
  updatePriceHistory: UpdatePriceHistory
): Promise<PriceHistory> {
  const result = await db
    .update(priceHistory)
    .set({
      ...updatePriceHistory,
    })
    .where(eq(priceHistory.id, updatePriceHistory.id))
    .returning();

  return result[0];
}
