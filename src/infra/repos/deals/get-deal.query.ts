import { Deal } from "@/src/domain/tcg/deal.model";
import { DB } from "@/src/infra/db/db";
import { deals } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetDealResult {
  success: boolean;
  deal?: Deal;
  error?: string;
}

export async function getDealQuery(db: DB, id: string): Promise<GetDealResult> {
  try {
    const result = await db.query.deals.findFirst({
      where: eq(deals.id, id),
    });

    if (result) {
      return {
        success: true,
        deal: result,
      };
    } else {
      return {
        success: false,
        error: "Deal not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
