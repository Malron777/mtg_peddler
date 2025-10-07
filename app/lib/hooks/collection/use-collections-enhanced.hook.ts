"use client";

import { Collection } from "@/src/domain/tcg/collection.model";
import { useCallback, useState } from "react";

// Enhanced collection interface that includes computed fields
export interface EnhancedCollection extends Collection {
  cardCount: number;
  value?: number;
  pendingDeals?: number;
  lastUpdated: Date;
  status: "trade" | "sale" | "both";
}

// Hook for getting user collections with enhanced data
export function useGetUserCollectionsEnhanced() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<EnhancedCollection[] | null>(
    null
  );

  const getUserCollectionsEnhanced = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get collections
      const collectionsResponse = await fetch("/api/collections");
      const collectionsResult = await collectionsResponse.json();

      if (!collectionsResult.success || !collectionsResult.collections) {
        setError(collectionsResult.error || "Failed to get user collections");
        return null;
      }

      const baseCollections: Collection[] = collectionsResult.collections;

      // For each collection, get additional data
      const enhancedCollections: EnhancedCollection[] = await Promise.all(
        baseCollections.map(async (collection) => {
          try {
            // Get collection items count
            const itemsResponse = await fetch(
              `/api/collection-items/collection/${collection.id}`
            );
            const itemsResult = await itemsResponse.json();
            const items = itemsResult.success
              ? itemsResult.collectionItems
              : [];

            // Get collection value
            const valueResponse = await fetch(
              `/api/collections/${collection.id}/value`
            );
            const valueResult = await valueResponse.json();
            const value = valueResult.success
              ? valueResult.value?.totalValue
              : undefined;

            // Calculate card count
            const cardCount = items.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
              0
            );

            // Determine status based on listing types
            const listingTypes = new Set(
              items.map((item: any) => item.listingType)
            );
            let status: "trade" | "sale" | "both" = "trade";
            if (listingTypes.has("sale") && listingTypes.has("trade")) {
              status = "both";
            } else if (listingTypes.has("sale")) {
              status = "sale";
            }

            return {
              ...collection,
              cardCount,
              value,
              pendingDeals: 0, // TODO: Implement deal counting
              lastUpdated: collection.updatedAt,
              status,
            };
          } catch (err) {
            console.error(`Error enhancing collection ${collection.id}:`, err);
            return {
              ...collection,
              cardCount: 0,
              value: undefined,
              pendingDeals: 0,
              lastUpdated: collection.updatedAt,
              status: "trade" as const,
            };
          }
        })
      );

      setCollections(enhancedCollections);
      return enhancedCollections;
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
    setCollections(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collections,
    loading,
    error,
    getUserCollectionsEnhanced,
    reset,
  };
}

// Hook for getting collection statistics
export function useCollectionStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalCollections: number;
    totalCards: number;
    totalValue: number;
    publicCollections: number;
    privateCollections: number;
    tradeCollections: number;
    saleCollections: number;
    bothCollections: number;
  } | null>(null);

  const getCollectionStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const collectionsResponse = await fetch("/api/collections");
      const collectionsResult = await collectionsResponse.json();

      if (!collectionsResult.success || !collectionsResult.collections) {
        setError(collectionsResult.error || "Failed to get collections");
        return null;
      }

      const collections = collectionsResult.collections;

      // Get enhanced data for all collections
      const enhancedCollections: EnhancedCollection[] = await Promise.all(
        collections.map(async (collection: Collection) => {
          try {
            const itemsResponse = await fetch(
              `/api/collection-items/collection/${collection.id}`
            );
            const itemsResult = await itemsResponse.json();
            const items = itemsResult.success
              ? itemsResult.collectionItems
              : [];

            const valueResponse = await fetch(
              `/api/collections/${collection.id}/value`
            );
            const valueResult = await valueResponse.json();
            const value = valueResult.success
              ? valueResult.value?.totalValue
              : undefined;

            const cardCount = items.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
              0
            );
            const listingTypes = new Set(
              items.map((item: any) => item.listingType)
            );
            let status: "trade" | "sale" | "both" = "trade";
            if (listingTypes.has("sale") && listingTypes.has("trade")) {
              status = "both";
            } else if (listingTypes.has("sale")) {
              status = "sale";
            }

            return {
              ...collection,
              cardCount,
              value,
              pendingDeals: 0,
              lastUpdated: collection.updatedAt,
              status,
            };
          } catch (err) {
            return {
              ...collection,
              cardCount: 0,
              value: undefined,
              pendingDeals: 0,
              lastUpdated: collection.updatedAt,
              status: "trade" as const,
            };
          }
        })
      );

      // Calculate statistics
      const totalCollections = enhancedCollections.length;
      const totalCards = enhancedCollections.reduce(
        (sum, c) => sum + c.cardCount,
        0
      );
      const totalValue = enhancedCollections.reduce(
        (sum, c) => sum + (c.value || 0),
        0
      );
      const publicCollections = enhancedCollections.filter(
        (c) => c.isPublic
      ).length;
      const privateCollections = enhancedCollections.filter(
        (c) => !c.isPublic
      ).length;
      const tradeCollections = enhancedCollections.filter(
        (c) => c.status === "trade"
      ).length;
      const saleCollections = enhancedCollections.filter(
        (c) => c.status === "sale"
      ).length;
      const bothCollections = enhancedCollections.filter(
        (c) => c.status === "both"
      ).length;

      const calculatedStats = {
        totalCollections,
        totalCards,
        totalValue,
        publicCollections,
        privateCollections,
        tradeCollections,
        saleCollections,
        bothCollections,
      };

      setStats(calculatedStats);
      return calculatedStats;
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
    setStats(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    stats,
    loading,
    error,
    getCollectionStats,
    reset,
  };
}
