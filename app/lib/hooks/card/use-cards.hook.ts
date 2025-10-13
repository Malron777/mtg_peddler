"use client";

import { Card, InsertCard, UpdateCard } from "@/src/domain/tcg/card.model";
import { useCallback, useState } from "react";

// Hook for creating a card
export function useCreateCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCard = useCallback(async (insertCard: InsertCard) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(insertCard),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create card");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    createCard,
    reset,
  };
}

// Hook for getting a card by scryfall ID
export function useGetCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);

  const getCard = useCallback(async (scryfallId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards/scryfall/${scryfallId}`);
      const result = await response.json();

      if (result.success && result.card) {
        setCard(result.card);
        return result.card;
      } else {
        setError(result.error || "Failed to get card");
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
  }, []);

  const reset = useCallback(() => {
    setCard(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    card,
    loading,
    error,
    getCard,
    reset,
  };
}

// Hook for getting a card by ID
export function useGetCardById() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<Card | null>(null);

  const getCardById = useCallback(async (cardId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards/${cardId}`);
      const result = await response.json();

      if (result.success && result.card) {
        setCard(result.card);
        return result.card;
      } else {
        setError(result.error || "Failed to get card");
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
  }, []);

  const reset = useCallback(() => {
    setCard(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    card,
    loading,
    error,
    getCardById,
    reset,
  };
}

// Hook for getting all cards
export function useGetAllCards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[] | null>(null);

  const getAllCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cards");
      const result = await response.json();

      if (result.success && result.cards) {
        setCards(result.cards);
        return result.cards;
      } else {
        setError(result.error || "Failed to get cards");
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
  }, []);

  const reset = useCallback(() => {
    setCards(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    cards,
    loading,
    error,
    getAllCards,
    reset,
  };
}

// Hook for getting all cards for a collection
export function useGetAllCardsForCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[] | null>(null);

  const getAllCardsForCollection = useCallback(
    async (
      collectionId: string,
      options?: { pageSize?: number; page?: number }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(
          `/api/cards/collection/${collectionId}`,
          window.location.origin
        );
        if (options?.pageSize) {
          url.searchParams.set("pageSize", options.pageSize.toString());
        }
        if (options?.page) {
          url.searchParams.set("page", options.page.toString());
        }

        const response = await fetch(url.toString());
        const result = await response.json();

        if (result.success && result.cards) {
          setCards(result.cards);
          return result.cards;
        } else {
          setError(result.error || "Failed to get cards for collection");
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
    getAllCardsForCollection,
    reset,
  };
}

// Hook for updating a card
export function useUpdateCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCard = useCallback(async (updateData: UpdateCard) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards/${updateData.scryfallId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update card");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    updateCard,
    reset,
  };
}

// Hook for deleting a card
export function useDeleteCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCard = useCallback(async (cardId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete card");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    deleteCard,
    reset,
  };
}

// Hook for getting cards by price
export function useGetCardsByPrice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Array<{
    card: Card;
    currentPrice: number;
    priceSource: string;
    availableQuantity?: number;
    collectionsWithCard?: Array<{
      collectionId: string;
      collectionName: string;
      quantity: number;
      condition: string;
      isFoil: boolean;
      listingType: string;
    }>;
  }> | null>(null);

  const getCardsByPrice = useCallback(
    async (options?: {
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      pageSize?: number;
      priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
      includeFoil?: boolean;
      sortBy?: "price" | "name" | "setName";
      sortOrder?: "asc" | "desc";
      onlyAvailable?: boolean;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (options?.minPrice !== undefined)
          queryParams.append("minPrice", options.minPrice.toString());
        if (options?.maxPrice !== undefined)
          queryParams.append("maxPrice", options.maxPrice.toString());
        if (options?.page !== undefined)
          queryParams.append("page", options.page.toString());
        if (options?.pageSize !== undefined)
          queryParams.append("pageSize", options.pageSize.toString());
        if (options?.priceSource)
          queryParams.append("priceSource", options.priceSource);
        if (options?.includeFoil !== undefined)
          queryParams.append("includeFoil", options.includeFoil.toString());
        if (options?.sortBy) queryParams.append("sortBy", options.sortBy);
        if (options?.sortOrder)
          queryParams.append("sortOrder", options.sortOrder);
        if (options?.onlyAvailable !== undefined)
          queryParams.append("onlyAvailable", options.onlyAvailable.toString());

        const response = await fetch(
          `/api/cards/by-price?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success && result.cards) {
          setCards(result.cards);
          return result;
        } else {
          setError(result.error || "Failed to get cards by price");
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
    getCardsByPrice,
    reset,
  };
}

// Combined hook that provides all card operations
export function useCards() {
  const createCard = useCreateCard();
  const getCard = useGetCard();
  const getCardById = useGetCardById();
  const getAllCards = useGetAllCards();
  const getAllCardsForCollection = useGetAllCardsForCollection();
  const getCardsByPrice = useGetCardsByPrice();
  const updateCard = useUpdateCard();
  const deleteCard = useDeleteCard();

  return {
    // Create
    createCard: createCard.createCard,
    createCardLoading: createCard.loading,
    createCardError: createCard.error,
    resetCreateCard: createCard.reset,

    // Get by scryfall ID
    getCard: getCard.getCard,
    getCardLoading: getCard.loading,
    getCardError: getCard.error,
    getCardData: getCard.card,
    resetGetCard: getCard.reset,

    // Get by ID
    getCardById: getCardById.getCardById,
    getCardByIdLoading: getCardById.loading,
    getCardByIdError: getCardById.error,
    getCardByIdData: getCardById.card,
    resetGetCardById: getCardById.reset,

    // Get all cards
    getAllCards: getAllCards.getAllCards,
    getAllCardsLoading: getAllCards.loading,
    getAllCardsError: getAllCards.error,
    getAllCardsData: getAllCards.cards,
    resetGetAllCards: getAllCards.reset,

    // Get all cards for collection
    getAllCardsForCollection: getAllCardsForCollection.getAllCardsForCollection,
    getAllCardsForCollectionLoading: getAllCardsForCollection.loading,
    getAllCardsForCollectionError: getAllCardsForCollection.error,
    getAllCardsForCollectionData: getAllCardsForCollection.cards,
    resetGetAllCardsForCollection: getAllCardsForCollection.reset,

    // Get cards by price
    getCardsByPrice: getCardsByPrice.getCardsByPrice,
    getCardsByPriceLoading: getCardsByPrice.loading,
    getCardsByPriceError: getCardsByPrice.error,
    getCardsByPriceData: getCardsByPrice.cards,
    resetGetCardsByPrice: getCardsByPrice.reset,

    // Update
    updateCard: updateCard.updateCard,
    updateCardLoading: updateCard.loading,
    updateCardError: updateCard.error,
    resetUpdateCard: updateCard.reset,

    // Delete
    deleteCard: deleteCard.deleteCard,
    deleteCardLoading: deleteCard.loading,
    deleteCardError: deleteCard.error,
    resetDeleteCard: deleteCard.reset,
  };
}
