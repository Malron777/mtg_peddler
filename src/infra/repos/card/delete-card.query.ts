import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface DeleteCardResult {
  success: boolean;
  error?: string;
}

export async function deleteCardQuery(
  db: DB,
  scryfallId: string
): Promise<DeleteCardResult> {
  try {
    await db.delete(cards).where(eq(cards.scryfallId, scryfallId));

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
