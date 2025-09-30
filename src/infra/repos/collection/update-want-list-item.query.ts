import {
  UpdateWantListItem,
  WantListItem,
} from "@/src/domain/tcg/want-list-item.model";
import { DB } from "@/src/infra/db/db";
import { wantListItems } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updateWantListItemQuery(
  db: DB,
  updateWantListItem: UpdateWantListItem
): Promise<WantListItem> {
  const result = await db
    .update(wantListItems)
    .set({
      ...updateWantListItem,
      updatedAt: new Date(),
    })
    .where(eq(wantListItems.id, updateWantListItem.id))
    .returning();

  return result[0];
}
