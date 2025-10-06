import { DealItem } from "@/src/domain/tcg/deal-item.model";
import { DB } from "@/src/infra/db/db";
import { dealItems } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetDealItemResult {
  success: boolean;
  dealItem?: DealItem;
  error?: string;
}

export async function getDealItemQuery(
  db: DB,
  id: string
): Promise<GetDealItemResult> {
  try {
    const result = await db.query.dealItems.findFirst({
      where: eq(dealItems.id, id),
    });

    if (result) {
      return {
        success: true,
        dealItem: result,
      };
    } else {
      return {
        success: false,
        error: "Deal item not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
