import {
  ScryfallCard,
  ScryfallService,
} from "@/src/app/services/scryfall.service";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";

export class ScryfallPriceService {
  private scryfallService: ScryfallService;

  constructor() {
    this.scryfallService = new ScryfallService();
  }

  /**
   * Fetch Scryfall price data for a collection of items
   */
  async fetchPricesForItems(
    items: CollectionItem[]
  ): Promise<Map<string, ScryfallCard>> {
    const scryfallCards = new Map<string, ScryfallCard>();

    // Get unique card IDs to avoid duplicate requests
    const uniqueCardIds = [
      ...new Set(items.map((item) => item.cardScryfallId)),
    ];

    // Process cards in batches to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < uniqueCardIds.length; i += batchSize) {
      const batch = uniqueCardIds.slice(i, i + batchSize);

      try {
        // Fetch cards by their Scryfall IDs
        const batchCards = await Promise.allSettled(
          batch.map(async (cardId) => {
            // Use the card ID directly to fetch from Scryfall
            const card = await this.scryfallService.makeRequest<ScryfallCard>(
              `/cards/${cardId}`
            );
            return { cardId, card };
          })
        );

        // Process successful results
        batchCards.forEach((result) => {
          if (result.status === "fulfilled") {
            scryfallCards.set(result.value.cardId, result.value.card);
          } else {
            console.warn("Failed to fetch card:", result.reason);
          }
        });

        // Add a small delay between batches to respect rate limits
        if (i + batchSize < uniqueCardIds.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("Error fetching price batch:", error);
      }
    }

    return scryfallCards;
  }

  /**
   * Get price for a single card from Scryfall
   */
  async getCardPrice(cardId: string): Promise<ScryfallCard | null> {
    try {
      return await this.scryfallService.makeRequest<ScryfallCard>(
        `/cards/${cardId}`
      );
    } catch (error) {
      console.error("Error fetching card price:", error);
      return null;
    }
  }

  /**
   * Extract USD price from Scryfall card data
   */
  static getUSDPrice(
    scryfallCard: ScryfallCard,
    isFoil: boolean = false
  ): number | null {
    if (!scryfallCard.prices) return null;

    const priceKey = isFoil ? "usd_foil" : "usd";
    const priceString = scryfallCard.prices[priceKey];

    if (!priceString) return null;

    const price = parseFloat(priceString);
    return isNaN(price) ? null : price;
  }

  /**
   * Check if a card has pricing data
   */
  static hasPriceData(
    scryfallCard: ScryfallCard,
    isFoil: boolean = false
  ): boolean {
    if (!scryfallCard.prices) return false;

    const priceKey = isFoil ? "usd_foil" : "usd";
    return !!scryfallCard.prices[priceKey];
  }
}
