import { Promotion, UpdatePromotion } from "@/src/domain/tcg/promotion.model";
import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updatePromotionQuery(
  db: DB,
  updatePromotion: UpdatePromotion
): Promise<Promotion> {
  const result = await db
    .update(promotions)
    .set({
      ...filterUndefined(updatePromotion),
      updatedAt: new Date(),
    })
    .where(eq(promotions.id, updatePromotion.id))
    .returning();

  return result[0];
}
