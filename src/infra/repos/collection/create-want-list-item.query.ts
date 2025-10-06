import {
  InsertWantListItem,
  WantListItem,
} from "@/src/domain/tcg/want-list-item.model";
import { DB } from "@/src/infra/db/db";
import { wantListItems } from "@/src/infra/db/schema";

export interface CreateWantListItemResult {
  success: boolean;
  wantListItem?: WantListItem;
  error?: string;
}

export async function createWantListItemQuery(
  db: DB,
  insertWantListItem: InsertWantListItem
): Promise<CreateWantListItemResult> {
  try {
    const result = await db
      .insert(wantListItems)
      .values(insertWantListItem)
      .returning();

    return {
      success: true,
      wantListItem: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
