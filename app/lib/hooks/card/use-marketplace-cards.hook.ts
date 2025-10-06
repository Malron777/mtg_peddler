"use client";

import { Card } from "@/src/domain/tcg/card.model";
import { useCallback, useState } from "react";

// Hook for searching cards by name or text
export function useSearchCards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Array<{
    card: Card;
    currentPrice?: number;
    priceSource?: string;
    availableQuantity?: number;
    collectionsWithCard?: Array<{
      collectionId: string;
      collectionName: string;
      ownerName: string;
      quantity: number;
      condition: string;
      isFoil: boolean;
      listingType: string;
      customPrice?: number;
    }>;
  }> | null>(null);

  const searchCards = useCallback(
    async (options: {
      query: string;
      page?: number;
      pageSize?: number;
      onlyAvailable?: boolean;
      priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
      sortBy?: "name" | "price" | "setName";
      sortOrder?: "asc" | "desc";
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("q", options.query);
        if (options.page !== undefined)
          queryParams.append("page", options.page.toString());
        if (options.pageSize !== undefined)
          queryParams.append("pageSize", options.pageSize.toString());
        if (options.onlyAvailable !== undefined)
          queryParams.append("onlyAvailable", options.onlyAvailable.toString());
        if (options.priceSource)
          queryParams.append("priceSource", options.priceSource);
        if (options.sortBy) queryParams.append("sortBy", options.sortBy);
        if (options.sortOrder)
          queryParams.append("sortOrder", options.sortOrder);

        const response = await fetch(
          `/api/cards/search?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success && result.cards) {
          setCards(result.cards);
          return result;
        } else {
          setError(result.error || "Failed to search cards");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setCards(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    cards,
    loading,
    error,
    searchCards,
    reset,
  };
}

// Hook for getting cards available in public collections
export function useGetAvailableCards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Array<{
    card: Card;
    currentPrice?: number;
    priceSource?: string;
    totalAvailableQuantity: number;
    collectionsWithCard: Array<{
      collectionId: string;
      collectionName: string;
      ownerName: string;
      quantity: number;
      condition: string;
      isFoil: boolean;
      listingType: string;
      customPrice?: number;
    }>;
  }> | null>(null);

  const getAvailableCards = useCallback(
    async (options?: {
      page?: number;
      pageSize?: number;
      priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
      minPrice?: number;
      maxPrice?: number;
      sortBy?: "name" | "price" | "setName";
      sortOrder?: "asc" | "desc";
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (options?.page !== undefined)
          queryParams.append("page", options.page.toString());
        if (options?.pageSize !== undefined)
          queryParams.append("pageSize", options.pageSize.toString());
        if (options?.priceSource)
          queryParams.append("priceSource", options.priceSource);
        if (options?.minPrice !== undefined)
          queryParams.append("minPrice", options.minPrice.toString());
        if (options?.maxPrice !== undefined)
          queryParams.append("maxPrice", options.maxPrice.toString());
        if (options?.sortBy) queryParams.append("sortBy", options.sortBy);
        if (options?.sortOrder)
          queryParams.append("sortOrder", options.sortOrder);

        const response = await fetch(
          `/api/cards/available?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success && result.cards) {
          setCards(result.cards);
          return result;
        } else {
          setError(result.error || "Failed to get available cards");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setCards(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    cards,
    loading,
    error,
    getAvailableCards,
    reset,
  };
}

// Combined hook for marketplace card operations
export function useMarketplaceCards() {
  const searchCards = useSearchCards();
  const getAvailableCards = useGetAvailableCards();

  return {
    // Search cards
    searchCards: searchCards.searchCards,
    searchCardsLoading: searchCards.loading,
    searchCardsError: searchCards.error,
    searchCardsData: searchCards.cards,
    resetSearchCards: searchCards.reset,

    // Get available cards
    getAvailableCards: getAvailableCards.getAvailableCards,
    getAvailableCardsLoading: getAvailableCards.loading,
    getAvailableCardsError: getAvailableCards.error,
    getAvailableCardsData: getAvailableCards.cards,
    resetGetAvailableCards: getAvailableCards.reset,
  };
}
