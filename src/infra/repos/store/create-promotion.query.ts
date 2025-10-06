import { InsertPromotion, Promotion } from "@/src/domain/tcg/promotion.model";
import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema";

export interface CreatePromotionResult {
  success: boolean;
  promotion?: Promotion;
  error?: string;
}

export async function createPromotionQuery(
  db: DB,
  insertPromotion: InsertPromotion
): Promise<CreatePromotionResult> {
  try {
    const result = await db
      .insert(promotions)
      .values(insertPromotion)
      .returning();

    return {
      success: true,
      promotion: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
