"use client";

import { useCallback, useState } from "react";

// Hook for getting collection value
export function useGetCollectionValue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState<any | null>(null);

  const getCollectionValue = useCallback(
    async (
      collectionId: string,
      options?: {
        includeFoil?: boolean;
        priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (options?.includeFoil !== undefined)
          queryParams.append("includeFoil", options.includeFoil.toString());
        if (options?.priceSource)
          queryParams.append("priceSource", options.priceSource);

        const response = await fetch(
          `/api/collections/${collectionId}/value?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success && result.value) {
          setValue(result.value);
          return result.value;
        } else {
          setError(result.error || "Failed to get collection value");
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
    setValue(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    value,
    loading,
    error,
    getCollectionValue,
    reset,
  };
}

// Hook for getting many collections value
export function useGetManyCollectionsValue() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<any | null>(null);

  const getManyCollectionsValue = useCallback(
    async (
      collectionIds: string[],
      options?: {
        includeFoil?: boolean;
        priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
      }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        collectionIds.forEach((id) => queryParams.append("collectionIds", id));
        if (options?.includeFoil !== undefined)
          queryParams.append("includeFoil", options.includeFoil.toString());
        if (options?.priceSource)
          queryParams.append("priceSource", options.priceSource);

        const response = await fetch(
          `/api/collections/values?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success && result.values) {
          setValues(result.values);
          return result.values;
        } else {
          setError(result.error || "Failed to get collections values");
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
    setValues(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    values,
    loading,
    error,
    getManyCollectionsValue,
    reset,
  };
}

// Hook for getting want list matches
export function useGetWantListMatches() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[] | null>(null);

  const getWantListMatches = useCallback(
    async (options: {
      userId?: string;
      wantListId?: string;
      includePrivateCollections?: boolean;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (options.userId) queryParams.append("userId", options.userId);
        if (options.wantListId)
          queryParams.append("wantListId", options.wantListId);
        if (options.includePrivateCollections !== undefined)
          queryParams.append(
            "includePrivateCollections",
            options.includePrivateCollections.toString()
          );

        const response = await fetch(
          `/api/collections/want-list-matches?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success && result.matches) {
          setMatches(result.matches);
          return result.matches;
        } else {
          setError(result.error || "Failed to get want list matches");
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
    setMatches(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    matches,
    loading,
    error,
    getWantListMatches,
    reset,
  };
}

// Hook for removing deal cards from collection
export function useRemoveDealCardsFromCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeDealCardsFromCollection = useCallback(
    async (
      dealId: string,
      collectionId: string,
      options?: { dryRun?: boolean }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (options?.dryRun !== undefined)
          queryParams.append("dryRun", options.dryRun.toString());

        const response = await fetch(
          `/api/collections/${collectionId}/remove-deal-cards/${dealId}?${queryParams.toString()}`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to remove deal cards from collection"
          );
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
    removeDealCardsFromCollection,
    reset,
  };
}
