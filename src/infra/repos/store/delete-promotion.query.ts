import { DB } from "@/src/infra/db/db";
import { promotions } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeletePromotionResult {
  success: boolean;
  error?: string;
}

export async function deletePromotionQuery(
  db: DB,
  id: string
): Promise<DeletePromotionResult> {
  try {
    await db.delete(promotions).where(eq(promotions.id, id));

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
