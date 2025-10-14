import { PriceCalculationService } from "@/src/app/services/price-calculation.service";
import { ScryfallPriceService } from "@/src/app/services/scryfall-price.service";
import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { Card } from "@/src/domain/tcg/card.model";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { useCallback, useEffect, useState } from "react";

interface UseCollectionPricingProps {
  collectionId: string;
  items: CollectionItem[];
  cards: Map<string, Card>;
}

interface UseCollectionPricingReturn {
  priceSummary: ReturnType<
    typeof PriceCalculationService.calculateCollectionValue
  >;
  scryfallCards: Map<string, ScryfallCard>;
  updateItemPrice: (
    itemId: string,
    price: number,
    source: "custom" | "market"
  ) => Promise<void>;
  refreshPrices: () => Promise<void>;
  updateScryfallCard: (cardId: string, scryfallCard: ScryfallCard) => void;
  loading: boolean;
  error: string | null;
}

export function useCollectionPricing({
  collectionId,
  items,
  cards,
}: UseCollectionPricingProps): UseCollectionPricingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scryfallCards, setScryfallCards] = useState<Map<string, ScryfallCard>>(
    new Map()
  );

  // Calculate current price summary
  const priceSummary = PriceCalculationService.calculateCollectionValue(
    items,
    cards,
    scryfallCards
  );

  // Fetch Scryfall prices when items change
  useEffect(() => {
    if (items.length > 0) {
      fetchScryfallPrices();
    }
  }, [items.length, collectionId]);

  const fetchScryfallPrices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const scryfallPriceService = new ScryfallPriceService();
      const fetchedCards = await scryfallPriceService.fetchPricesForItems(
        items
      );
      setScryfallCards(fetchedCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setLoading(false);
    }
  }, [items]);

  const updateItemPrice = useCallback(
    async (itemId: string, price: number, source: "custom" | "market") => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/collection-items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customPrice: source === "custom" ? price : null,
            priceSource: source === "market" ? "tcg" : "custom",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update item price");
        }

        // The parent component should refetch the data to get updated prices
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update price");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshPrices = useCallback(async () => {
    await fetchScryfallPrices();
  }, [fetchScryfallPrices]);

  const updateScryfallCard = useCallback(
    (cardId: string, scryfallCard: ScryfallCard) => {
      setScryfallCards((prev) => new Map(prev).set(cardId, scryfallCard));
    },
    []
  );

  return {
    priceSummary,
    scryfallCards,
    updateItemPrice,
    refreshPrices,
    updateScryfallCard,
    loading,
    error,
  };
}
