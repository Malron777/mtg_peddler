import { Card, InsertCard } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";

export interface CreateCardResult {
  success: boolean;
  card?: Card;
  error?: string;
}

export async function createCardQuery(
  db: DB,
  insertCard: InsertCard
): Promise<CreateCardResult> {
  try {
    const result = await db.insert(cards).values(insertCard).returning();

    return {
      success: true,
      card: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
