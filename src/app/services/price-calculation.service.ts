import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { Card } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";

export interface PriceData {
  price: number;
  source: string;
  lastUpdated: Date;
}

export interface CollectionPriceSummary {
  totalValue: number;
  itemCount: number;
  lastPriceUpdate: Date;
  priceBreakdown: {
    customPrices: number;
    marketPrices: number;
    unknownPrices: number;
  };
}

export class PriceCalculationService {
  /**
   * Calculate the total value of a collection based on its items
   */
  static calculateCollectionValue(
    items: CollectionItem[],
    cards: Map<string, Card>,
    scryfallCards?: Map<string, ScryfallCard>
  ): CollectionPriceSummary {
    let totalValue = 0;
    let customPrices = 0;
    let marketPrices = 0;
    let unknownPrices = 0;
    let lastPriceUpdate: Date | null = null;

    for (const item of items) {
      const itemValue = this.calculateItemValue(item, cards, scryfallCards);
      const totalItemValue = itemValue * item.quantity;

      totalValue += totalItemValue;

      // Track price sources
      if (item.customPrice) {
        customPrices += totalItemValue;
      } else if (itemValue > 0) {
        marketPrices += totalItemValue;
      } else {
        unknownPrices += totalItemValue;
      }

      // Track the most recent price update
      if (item.updatedAt) {
        if (!lastPriceUpdate || item.updatedAt > lastPriceUpdate) {
          lastPriceUpdate = item.updatedAt;
        }
      }
    }

    return {
      totalValue,
      itemCount: items.length,
      lastPriceUpdate: lastPriceUpdate || new Date(),
      priceBreakdown: {
        customPrices,
        marketPrices,
        unknownPrices,
      },
    };
  }

  /**
   * Calculate the value of a single collection item
   */
  static calculateItemValue(
    item: CollectionItem,
    cards: Map<string, Card>,
    scryfallCards?: Map<string, ScryfallCard>
  ): number {
    // Priority: custom price > Scryfall price > fallback to 0
    if (item.customPrice) {
      return parseFloat(item.customPrice.toString());
    }

    // Try to get price from Scryfall data
    if (scryfallCards) {
      const scryfallCard = scryfallCards.get(item.cardScryfallId);
      if (scryfallCard?.prices) {
        const priceKey = item.isFoil ? "usd_foil" : "usd";
        const price = scryfallCard.prices[priceKey];
        if (price) {
          return parseFloat(price);
        }
      }
    }

    // Fallback to 0 for items without prices
    return 0;
  }

  /**
   * Get the effective price for display purposes
   */
  static getEffectivePrice(
    item: CollectionItem,
    scryfallCard?: ScryfallCard
  ): {
    price: number;
    source: "custom" | "market" | "unknown";
    lastUpdated?: Date;
  } {
    if (item.customPrice) {
      return {
        price: parseFloat(item.customPrice.toString()),
        source: "custom",
        lastUpdated: item.updatedAt || undefined,
      };
    }

    if (scryfallCard?.prices) {
      const priceKey = item.isFoil ? "usd_foil" : "usd";
      const price = scryfallCard.prices[priceKey];
      if (price) {
        return {
          price: parseFloat(price),
          source: "market",
          lastUpdated: item.updatedAt || undefined,
        };
      }
    }

    return {
      price: 0,
      source: "unknown",
    };
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number): string {
    if (price === 0) return "No price";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Format total value for display
   */
  static formatTotalValue(totalValue: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalValue);
  }
}
