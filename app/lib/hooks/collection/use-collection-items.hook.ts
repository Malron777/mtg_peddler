"use client";

import {
  CollectionItem,
  InsertCollectionItem,
  UpdateCollectionItem,
} from "@/src/domain/tcg/collection-item.model";
import { useCallback, useState } from "react";

// Hook for creating multiple collection items
export function useCreateBulkCollectionItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBulkCollectionItems = useCallback(
    async (insertCollectionItems: InsertCollectionItem[]) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/collection-items/bulk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: insertCollectionItems }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create bulk collection items"
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
    createBulkCollectionItems,
    reset,
  };
}

// Hook for creating a collection item
export function useCreateCollectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCollectionItem = useCallback(
    async (insertCollectionItem: InsertCollectionItem) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/collection-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertCollectionItem),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create collection item"
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
    createCollectionItem,
    reset,
  };
}

// Hook for getting a collection item
export function useGetCollectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionItem, setCollectionItem] = useState<CollectionItem | null>(
    null
  );

  const getCollectionItem = useCallback(async (collectionItemId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collection-items/${collectionItemId}`);
      const result = await response.json();

      if (result.success && result.collectionItem) {
        setCollectionItem(result.collectionItem);
        return result.collectionItem;
      } else {
        setError(result.error || "Failed to get collection item");
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
    setCollectionItem(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collectionItem,
    loading,
    error,
    getCollectionItem,
    reset,
  };
}

// Hook for getting a collection item by ID
export function useGetCollectionItemById() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionItem, setCollectionItem] = useState<CollectionItem | null>(
    null
  );

  const getCollectionItemById = useCallback(
    async (collectionItemId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/collection-items/by-id/${collectionItemId}`
        );
        const result = await response.json();

        if (result.success && result.collectionItem) {
          setCollectionItem(result.collectionItem);
          return result.collectionItem;
        } else {
          setError(result.error || "Failed to get collection item by ID");
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
    setCollectionItem(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collectionItem,
    loading,
    error,
    getCollectionItemById,
    reset,
  };
}

// Hook for getting all collection items
export function useGetAllCollectionItems() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionItems, setCollectionItems] = useState<
    CollectionItem[] | null
  >(null);

  const getAllCollectionItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/collection-items");
      const result = await response.json();

      if (result.success && result.collectionItems) {
        setCollectionItems(result.collectionItems);
        return result.collectionItems;
      } else {
        setError(result.error || "Failed to get collection items");
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
    setCollectionItems(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collectionItems,
    loading,
    error,
    getAllCollectionItems,
    reset,
  };
}

// Hook for getting all collection items for a collection
export function useGetAllCollectionItemsForCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionItems, setCollectionItems] = useState<
    CollectionItem[] | null
  >(null);

  const getAllCollectionItemsForCollection = useCallback(
    async (collectionId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/collection-items/collection/${collectionId}`
        );
        const result = await response.json();

        if (result.success && result.collectionItems) {
          setCollectionItems(result.collectionItems);
          return result.collectionItems;
        } else {
          setError(
            result.error || "Failed to get collection items for collection"
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
    setCollectionItems(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collectionItems,
    loading,
    error,
    getAllCollectionItemsForCollection,
    reset,
  };
}

// Hook for updating a collection item
export function useUpdateCollectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCollectionItem = useCallback(
    async (updateData: UpdateCollectionItem) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/collection-items/${updateData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to update collection item"
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
    updateCollectionItem,
    reset,
  };
}

// Hook for deleting a collection item
export function useDeleteCollectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCollectionItem = useCallback(async (collectionItemId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/collection-items/${collectionItemId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete collection item");
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
    deleteCollectionItem,
    reset,
  };
}

// Combined hook that provides all collection item operations
export function useCollectionItems() {
  const createCollectionItem = useCreateCollectionItem();
  const getCollectionItem = useGetCollectionItem();
  const getCollectionItemById = useGetCollectionItemById();
  const getAllCollectionItems = useGetAllCollectionItems();
  const getAllCollectionItemsForCollection =
    useGetAllCollectionItemsForCollection();
  const updateCollectionItem = useUpdateCollectionItem();
  const deleteCollectionItem = useDeleteCollectionItem();

  return {
    // Create
    createCollectionItem: createCollectionItem.createCollectionItem,
    createCollectionItemLoading: createCollectionItem.loading,
    createCollectionItemError: createCollectionItem.error,
    resetCreateCollectionItem: createCollectionItem.reset,

    // Get by ID
    getCollectionItem: getCollectionItem.getCollectionItem,
    getCollectionItemLoading: getCollectionItem.loading,
    getCollectionItemError: getCollectionItem.error,
    getCollectionItemData: getCollectionItem.collectionItem,
    resetGetCollectionItem: getCollectionItem.reset,

    // Get by ID (alternative)
    getCollectionItemById: getCollectionItemById.getCollectionItemById,
    getCollectionItemByIdLoading: getCollectionItemById.loading,
    getCollectionItemByIdError: getCollectionItemById.error,
    getCollectionItemByIdData: getCollectionItemById.collectionItem,
    resetGetCollectionItemById: getCollectionItemById.reset,

    // Get all
    getAllCollectionItems: getAllCollectionItems.getAllCollectionItems,
    getAllCollectionItemsLoading: getAllCollectionItems.loading,
    getAllCollectionItemsError: getAllCollectionItems.error,
    getAllCollectionItemsData: getAllCollectionItems.collectionItems,
    resetGetAllCollectionItems: getAllCollectionItems.reset,

    // Get all for collection
    getAllCollectionItemsForCollection:
      getAllCollectionItemsForCollection.getAllCollectionItemsForCollection,
    getAllCollectionItemsForCollectionLoading:
      getAllCollectionItemsForCollection.loading,
    getAllCollectionItemsForCollectionError:
      getAllCollectionItemsForCollection.error,
    getAllCollectionItemsForCollectionData:
      getAllCollectionItemsForCollection.collectionItems,
    resetGetAllCollectionItemsForCollection:
      getAllCollectionItemsForCollection.reset,

    // Update
    updateCollectionItem: updateCollectionItem.updateCollectionItem,
    updateCollectionItemLoading: updateCollectionItem.loading,
    updateCollectionItemError: updateCollectionItem.error,
    resetUpdateCollectionItem: updateCollectionItem.reset,

    // Delete
    deleteCollectionItem: deleteCollectionItem.deleteCollectionItem,
    deleteCollectionItemLoading: deleteCollectionItem.loading,
    deleteCollectionItemError: deleteCollectionItem.error,
    resetDeleteCollectionItem: deleteCollectionItem.reset,
  };
}
