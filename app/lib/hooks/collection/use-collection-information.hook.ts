"use client";

import { useCallback, useState } from "react";

export interface CollectionInformation {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
  totalValue: number;
  dealCount: number;
  breakdown: {
    foilValue: number;
    nonFoilValue: number;
    customPriceValue: number;
    marketPriceValue: number;
  };
}

export interface CollectionInformationData {
  collections: CollectionInformation[];
  totalCards: number;
  totalValue: number;
  totalDeals: number;
}

export interface GetCollectionInformationOptions {
  includeFoil?: boolean;
  priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
}

// Hook for getting collection information for the current user
export function useGetCollectionInformation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CollectionInformationData | null>(null);

  const getCollectionInformation = useCallback(
    async (options: GetCollectionInformationOptions = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (options.includeFoil !== undefined) {
          queryParams.append("includeFoil", options.includeFoil.toString());
        }
        if (options.priceSource) {
          queryParams.append("priceSource", options.priceSource);
        }

        const url = `/api/collections/metadata${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
          return result.data;
        } else {
          setError(result.error || "Failed to get collection information");
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
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    getCollectionInformation,
    reset,
  };
}

// Hook for getting collection information with automatic refresh
export function useCollectionInformation(
  options: GetCollectionInformationOptions = {}
) {
  const { data, loading, error, getCollectionInformation, reset } =
    useGetCollectionInformation();

  const refresh = useCallback(() => {
    return getCollectionInformation(options);
  }, [getCollectionInformation]); // Remove options from dependency array

  return {
    data,
    loading,
    error,
    refresh,
    reset,
  };
}
