import { Deal, UpdateDeal } from "@/src/domain/tcg/deal.model";
import { DB } from "@/src/infra/db/db";
import { deals } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateDealQuery(
  db: DB,
  updateDeal: UpdateDeal
): Promise<Deal> {
  const result = await db
    .update(deals)
    .set({
      ...filterUndefined(updateDeal),
      updatedAt: new Date(),
    })
    .where(eq(deals.id, updateDeal.id))
    .returning();

  return result[0];
}
