"use client";

import {
  InsertWantListItem,
  UpdateWantListItem,
  WantListItem,
} from "@/src/domain/tcg/want-list-item.model";
import { useCallback, useState } from "react";

// Hook for creating a want list item
export function useCreateWantListItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWantListItem = useCallback(
    async (insertWantListItem: InsertWantListItem) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/want-list-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertWantListItem),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create want list item");
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
    createWantListItem,
    reset,
  };
}

// Hook for getting a want list item
export function useGetWantListItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantListItem, setWantListItem] = useState<WantListItem | null>(null);

  const getWantListItem = useCallback(async (wantListItemId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/want-list-items/${wantListItemId}`);
      const result = await response.json();

      if (result.success && result.wantListItem) {
        setWantListItem(result.wantListItem);
        return result.wantListItem;
      } else {
        setError(result.error || "Failed to get want list item");
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
    setWantListItem(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    wantListItem,
    loading,
    error,
    getWantListItem,
    reset,
  };
}

// Hook for getting all want list items
export function useGetAllWantListItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantListItems, setWantListItems] = useState<WantListItem[] | null>(
    null
  );

  const getAllWantListItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/want-list-items");
      const result = await response.json();

      if (result.success && result.wantListItems) {
        setWantListItems(result.wantListItems);
        return result.wantListItems;
      } else {
        setError(result.error || "Failed to get want list items");
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
    setWantListItems(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    wantListItems,
    loading,
    error,
    getAllWantListItems,
    reset,
  };
}

// Hook for getting all want list items for a want list
export function useGetAllWantListItemsForWantList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantListItems, setWantListItems] = useState<WantListItem[] | null>(
    null
  );

  const getAllWantListItemsForWantList = useCallback(
    async (wantListId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/want-list-items/want-list/${wantListId}`
        );
        const result = await response.json();

        if (result.success && result.wantListItems) {
          setWantListItems(result.wantListItems);
          return result.wantListItems;
        } else {
          setError(
            result.error || "Failed to get want list items for want list"
          );
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
    setWantListItems(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    wantListItems,
    loading,
    error,
    getAllWantListItemsForWantList,
    reset,
  };
}

// Hook for updating a want list item
export function useUpdateWantListItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWantListItem = useCallback(
    async (updateData: UpdateWantListItem) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/want-list-items/${updateData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update want list item");
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
    updateWantListItem,
    reset,
  };
}

// Combined hook that provides all want list item operations
export function useWantListItems() {
  const createWantListItem = useCreateWantListItem();
  const getWantListItem = useGetWantListItem();
  const getAllWantListItems = useGetAllWantListItems();
  const getAllWantListItemsForWantList = useGetAllWantListItemsForWantList();
  const updateWantListItem = useUpdateWantListItem();

  return {
    // Create
    createWantListItem: createWantListItem.createWantListItem,
    createWantListItemLoading: createWantListItem.loading,
    createWantListItemError: createWantListItem.error,
    resetCreateWantListItem: createWantListItem.reset,

    // Get by ID
    getWantListItem: getWantListItem.getWantListItem,
    getWantListItemLoading: getWantListItem.loading,
    getWantListItemError: getWantListItem.error,
    getWantListItemData: getWantListItem.wantListItem,
    resetGetWantListItem: getWantListItem.reset,

    // Get all
    getAllWantListItems: getAllWantListItems.getAllWantListItems,
    getAllWantListItemsLoading: getAllWantListItems.loading,
    getAllWantListItemsError: getAllWantListItems.error,
    getAllWantListItemsData: getAllWantListItems.wantListItems,
    resetGetAllWantListItems: getAllWantListItems.reset,

    // Get all for want list
    getAllWantListItemsForWantList:
      getAllWantListItemsForWantList.getAllWantListItemsForWantList,
    getAllWantListItemsForWantListLoading:
      getAllWantListItemsForWantList.loading,
    getAllWantListItemsForWantListError: getAllWantListItemsForWantList.error,
    getAllWantListItemsForWantListData:
      getAllWantListItemsForWantList.wantListItems,
    resetGetAllWantListItemsForWantList: getAllWantListItemsForWantList.reset,

    // Update
    updateWantListItem: updateWantListItem.updateWantListItem,
    updateWantListItemLoading: updateWantListItem.loading,
    updateWantListItemError: updateWantListItem.error,
    resetUpdateWantListItem: updateWantListItem.reset,
  };
}
