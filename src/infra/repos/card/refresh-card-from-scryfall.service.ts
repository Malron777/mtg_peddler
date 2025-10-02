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
        manaCost: scryfallCard.mana_cost || null,
        cmc: scryfallCard.cmc,
        typeLine: scryfallCard.type_line,
        oracleText: scryfallCard.oracle_text || null,
        power: scryfallCard.power || null,
        toughness: scryfallCard.toughness || null,
        colors: scryfallCard.colors,
        colorIdentity: scryfallCard.color_identity,
        legalities: scryfallCard.legalities,
        set: scryfallCard.set,
        setName: scryfallCard.set_name,
        collectorNumber: scryfallCard.collector_number,
        rarity: scryfallCard.rarity,
        artist: scryfallCard.artist || null,
        oracleId: scryfallCard.oracle_id,
        imageUris: scryfallCard.image_uris || null,
        cardFaces: scryfallCard.card_faces || null,
        prices: scryfallCard.prices || null,
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
        manaCost: scryfallCard.mana_cost || null,
        cmc: scryfallCard.cmc,
        typeLine: scryfallCard.type_line,
        oracleText: scryfallCard.oracle_text || null,
        power: scryfallCard.power || null,
        toughness: scryfallCard.toughness || null,
        colors: scryfallCard.colors,
        colorIdentity: scryfallCard.color_identity,
        legalities: scryfallCard.legalities,
        set: scryfallCard.set,
        setName: scryfallCard.set_name,
        collectorNumber: scryfallCard.collector_number,
        rarity: scryfallCard.rarity,
        artist: scryfallCard.artist || null,
        oracleId: scryfallCard.oracle_id,
        imageUris: scryfallCard.image_uris || null,
        cardFaces: scryfallCard.card_faces || null,
        prices: scryfallCard.prices || null,
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
