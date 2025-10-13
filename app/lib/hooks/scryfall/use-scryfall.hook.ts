"use client";

import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { useCallback, useState } from "react";

// Hook for searching cards using Scryfall API
export function useScryfallSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<ScryfallCard[] | null>(null);
  const [totalCards, setTotalCards] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const searchCards = useCallback(
    async (query: string, exact: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("q", query);
        if (exact) queryParams.append("exact", "true");

        const response = await fetch(
          `/api/scryfall/search?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success) {
          setCards(result.cards);
          setTotalCards(result.totalCards);
          setHasMore(result.hasMore);
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
    setTotalCards(0);
    setHasMore(false);
    setError(null);
    setLoading(false);
  }, []);

  return {
    cards,
    totalCards,
    hasMore,
    loading,
    error,
    searchCards,
    reset,
  };
}

// Hook for getting card versions
export function useCardVersions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ScryfallCard[] | null>(null);

  const getCardVersions = useCallback(async (oracleId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scryfall/versions/${oracleId}`);
      const result = await response.json();

      if (result.success) {
        setVersions(result.versions);
        return result.versions;
      } else {
        setError(result.error || "Failed to get card versions");
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
    setVersions(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    versions,
    loading,
    error,
    getCardVersions,
    reset,
  };
}

// Hook for fetching card variants
export function useCardVariants() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variants, setVariants] = useState<ScryfallCard[] | null>(null);

  const getCardVariants = useCallback(async (cardName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/cards/variants?name=${encodeURIComponent(cardName)}`
      );
      const result = await response.json();

      if (result.success) {
        setVariants(result.variants);
        return result.variants;
      } else {
        setError(result.error || "Failed to fetch card variants");
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
    setVariants(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    variants,
    loading,
    error,
    getCardVariants,
    reset,
  };
}

// Hook for bulk importing cards
export function useBulkImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  const bulkImport = useCallback(
    async (
      collectionId: string,
      items: Array<{ quantity: number; cardName: string }>
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/collections/bulk-import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ collectionId, items }),
        });

        const result = await response.json();

        if (result.success) {
          setResults(result.results);
          return result;
        } else {
          setError(result.error || "Failed to bulk import cards");
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
    setResults(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    results,
    loading,
    error,
    bulkImport,
    reset,
  };
}
