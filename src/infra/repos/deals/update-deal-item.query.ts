import { DealItem, UpdateDealItem } from "@/src/domain/tcg/deal-item.model";
import { DB } from "@/src/infra/db/db";
import { dealItems } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateDealItemQuery(
  db: DB,
  updateDealItem: UpdateDealItem
): Promise<DealItem> {
  const result = await db
    .update(dealItems)
    .set({
      ...filterUndefined(updateDealItem),
      updatedAt: new Date(),
    })
    .where(eq(dealItems.id, updateDealItem.id))
    .returning();

  return result[0];
}
