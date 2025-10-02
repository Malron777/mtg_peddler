import { ScryfallService } from "@/src/app/services/scryfall.service";
import { Card, UpdateCard } from "@/src/domain/tcg/card.model";
import { DB } from "@/src/infra/db/db";
import { cards } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface RefreshCardResult {
  success: boolean;
  card?: Card;
  error?: string;
}

export class RefreshCardFromScryfallService {
  private readonly scryfallService: ScryfallService;

  constructor() {
    this.scryfallService = new ScryfallService();
  }

  async refreshCardFromScryfall(
    db: DB,
    scryfallId: string
  ): Promise<RefreshCardResult> {
    try {
      // First get the card name from our database
      const existingCard = await db.query.cards.findFirst({
        where: eq(cards.scryfallId, scryfallId),
      });

      if (!existingCard) {
        return {
          success: false,
          error: "Card not found in database",
        };
      }

      // Fetch fresh data from Scryfall API using the card name
      const scryfallCard = await this.scryfallService.getCardByExactName(
        existingCard.name
      );

      // Convert Scryfall card to our card format
      const cardData: UpdateCard = {
        scryfallId: scryfallCard.id,
        name: scryfallCard.name,
        oracleId: scryfallCard.oracle_id,
        setCode: scryfallCard.set,
        setName: scryfallCard.set_name,
        imageUris: scryfallCard.image_uris || null,
        lastFetchedAt: new Date(),
      };

      // Update the card in the database
      const updatedCard = await db
        .update(cards)
        .set(cardData)
        .where(eq(cards.scryfallId, scryfallId))
        .returning();

      if (updatedCard.length === 0) {
        return {
          success: false,
          error: "Card not found in database",
        };
      }

      return {
        success: true,
        card: updatedCard[0],
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async refreshCardFromScryfallByName(
    db: DB,
    cardName: string
  ): Promise<RefreshCardResult> {
    try {
      // Fetch fresh data from Scryfall API
      const scryfallCard = await this.scryfallService.getCardByName(cardName);

      // Convert Scryfall card to our card format
      const cardData: UpdateCard = {
        scryfallId: scryfallCard.id,
        name: scryfallCard.name,
        oracleId: scryfallCard.oracle_id,
        setCode: scryfallCard.set,
        setName: scryfallCard.set_name,
        imageUris: scryfallCard.image_uris || null,
        lastFetchedAt: new Date(),
      };

      // Update the card in the database
      const updatedCard = await db
        .update(cards)
        .set(cardData)
        .where(eq(cards.scryfallId, scryfallCard.id))
        .returning();

      if (updatedCard.length === 0) {
        return {
          success: false,
          error: "Card not found in database",
        };
      }

      return {
        success: true,
        card: updatedCard[0],
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  isCardStale(lastFetchedAt: Date, cacheWindowDays: number = 1): boolean {
    const now = new Date();
    const cacheWindowMs = cacheWindowDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    const timeDiff = now.getTime() - lastFetchedAt.getTime();
    return timeDiff > cacheWindowMs;
  }
}
