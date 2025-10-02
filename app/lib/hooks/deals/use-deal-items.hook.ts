"use client";

import { DealItem, UpdateDealItem } from "@/src/domain/tcg/deal-item.model";
import { useCallback, useState } from "react";

// Hook for getting all deal items
export function useGetAllDealItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dealItems, setDealItems] = useState<DealItem[] | null>(null);

  const getAllDealItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/deal-items");
      const result = await response.json();

      if (result.success && result.dealItems) {
        setDealItems(result.dealItems);
        return result.dealItems;
      } else {
        setError(result.error || "Failed to get deal items");
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
    setDealItems(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    dealItems,
    loading,
    error,
    getAllDealItems,
    reset,
  };
}

// Hook for getting all deal items for a deal
export function useGetAllDealItemsForDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dealItems, setDealItems] = useState<DealItem[] | null>(null);

  const getAllDealItemsForDeal = useCallback(async (dealId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deal-items/deal/${dealId}`);
      const result = await response.json();

      if (result.success && result.dealItems) {
        setDealItems(result.dealItems);
        return result.dealItems;
      } else {
        setError(result.error || "Failed to get deal items for deal");
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
    setDealItems(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    dealItems,
    loading,
    error,
    getAllDealItemsForDeal,
    reset,
  };
}

// Hook for getting a deal item
export function useGetDealItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dealItem, setDealItem] = useState<DealItem | null>(null);

  const getDealItem = useCallback(async (dealItemId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deal-items/${dealItemId}`);
      const result = await response.json();

      if (result.success && result.dealItem) {
        setDealItem(result.dealItem);
        return result.dealItem;
      } else {
        setError(result.error || "Failed to get deal item");
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
    setDealItem(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    dealItem,
    loading,
    error,
    getDealItem,
    reset,
  };
}

// Hook for updating a deal item
export function useUpdateDealItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDealItem = useCallback(async (updateData: UpdateDealItem) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deal-items/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update deal item");
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
    updateDealItem,
    reset,
  };
}

// Combined hook that provides all deal item operations
export function useDealItems() {
  const getAllDealItems = useGetAllDealItems();
  const getAllDealItemsForDeal = useGetAllDealItemsForDeal();
  const getDealItem = useGetDealItem();
  const updateDealItem = useUpdateDealItem();

  return {
    // Get all
    getAllDealItems: getAllDealItems.getAllDealItems,
    getAllDealItemsLoading: getAllDealItems.loading,
    getAllDealItemsError: getAllDealItems.error,
    getAllDealItemsData: getAllDealItems.dealItems,
    resetGetAllDealItems: getAllDealItems.reset,

    // Get all for deal
    getAllDealItemsForDeal: getAllDealItemsForDeal.getAllDealItemsForDeal,
    getAllDealItemsForDealLoading: getAllDealItemsForDeal.loading,
    getAllDealItemsForDealError: getAllDealItemsForDeal.error,
    getAllDealItemsForDealData: getAllDealItemsForDeal.dealItems,
    resetGetAllDealItemsForDeal: getAllDealItemsForDeal.reset,

    // Get by ID
    getDealItem: getDealItem.getDealItem,
    getDealItemLoading: getDealItem.loading,
    getDealItemError: getDealItem.error,
    getDealItemData: getDealItem.dealItem,
    resetGetDealItem: getDealItem.reset,

    // Update
    updateDealItem: updateDealItem.updateDealItem,
    updateDealItemLoading: updateDealItem.loading,
    updateDealItemError: updateDealItem.error,
    resetUpdateDealItem: updateDealItem.reset,
  };
}
