import { Card, InsertCard } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

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
    // Validate required fields
    if (!insertCard.scryfallId || insertCard.scryfallId.trim() === "") {
      return {
        success: false,
        error: "scryfallId is required and cannot be empty",
      };
    }

    // First, try to find if the card already exists
    const existingCard = await db
      .select()
      .from(cards)
      .where(eq(cards.scryfallId, insertCard.scryfallId))
      .limit(1);

    if (existingCard.length > 0) {
      // Card already exists, return it
      return {
        success: true,
        card: existingCard[0],
      };
    }

    // Card doesn't exist, create it
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
