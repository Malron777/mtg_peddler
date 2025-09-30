import { WantListItem } from "@/src/domain/tcg/want-list-item.model";
import { DB } from "@/src/infra/db/db";
import { wantListItems } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetWantListItemResult {
  success: boolean;
  wantListItem?: WantListItem;
  error?: string;
}

export async function getWantListItemQuery(
  db: DB,
  id: string
): Promise<GetWantListItemResult> {
  try {
    const result = await db.query.wantListItems.findFirst({
      where: eq(wantListItems.id, id),
    });

    if (result) {
      return {
        success: true,
        wantListItem: result,
      };
    } else {
      return {
        success: false,
        error: "Want list item not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
