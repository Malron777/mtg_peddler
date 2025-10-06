import { Card } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetCardByIdResult {
  success: boolean;
  card?: Card;
  error?: string;
}

export async function getCardByIdQuery(
  db: DB,
  scryfallId: string
): Promise<GetCardByIdResult> {
  try {
    const result = await db.query.cards.findFirst({
      where: eq(cards.scryfallId, scryfallId),
    });

    if (result) {
      return {
        success: true,
        card: result,
      };
    } else {
      return {
        success: false,
        error: "Card not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
