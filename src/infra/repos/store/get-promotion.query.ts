import { Promotion } from "@/src/domain/tcg/promotion.model";
import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetPromotionResult {
  success: boolean;
  promotion?: Promotion;
  error?: string;
}

export async function getPromotionQuery(
  db: DB,
  id: string
): Promise<GetPromotionResult> {
  try {
    const result = await db.query.promotions.findFirst({
      where: eq(promotions.id, id),
    });

    if (result) {
      return {
        success: true,
        promotion: result,
      };
    } else {
      return {
        success: false,
        error: "Promotion not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
