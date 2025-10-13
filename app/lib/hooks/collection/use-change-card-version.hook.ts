"use client";

import { ScryfallCard } from "@/src/app/services/scryfall.service";
import { CollectionItem } from "@/src/domain/tcg/collection-item.model";
import { useCallback, useState } from "react";

export interface ChangeCardVersionRequest {
  collectionItemId: string;
  newCardScryfallId: string;
  newCardData: {
    scryfallId: string;
    oracleId: string;
    name: string;
    setCode: string;
    setName: string;
    imageUris?: Record<string, string> | null;
    cachedData?: Record<string, unknown>;
  };
}

export interface ChangeCardVersionResult {
  success: boolean;
  oldCollectionItem?: CollectionItem;
  newCollectionItem?: CollectionItem;
  error?: string;
}

// Hook for changing card versions
export function useChangeCardVersion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeCardVersion = useCallback(
    async (
      request: ChangeCardVersionRequest
    ): Promise<ChangeCardVersionResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/collection-items/change-version", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to change card version");
        }

        const result = await response.json();
        return result;
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
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    changeCardVersion,
    reset,
  };
}

// Helper function to convert ScryfallCard to the required format
export function scryfallCardToChangeRequest(
  scryfallCard: ScryfallCard,
  collectionItemId: string
): ChangeCardVersionRequest {
  return {
    collectionItemId,
    newCardScryfallId: scryfallCard.id,
    newCardData: {
      scryfallId: scryfallCard.id,
      oracleId: scryfallCard.oracle_id,
      name: scryfallCard.name,
      setCode: scryfallCard.set,
      setName: scryfallCard.set_name,
      imageUris: scryfallCard.image_uris || null,
      cachedData: scryfallCard as unknown as Record<string, unknown>,
    },
  };
}
