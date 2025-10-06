import { Card, UpdateCard } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";
import { filterUndefined } from "../utils";

export async function updateCardQuery(
  db: DB,
  updateCard: UpdateCard
): Promise<Card> {
  const result = await db
    .update(cards)
    .set({
      ...filterUndefined(updateCard),
      updatedAt: new Date(),
    })
    .where(eq(cards.scryfallId, updateCard.scryfallId))
    .returning();

  return result[0];
}
