"use client";

import { Store, UpdateStore } from "@/src/domain/auth/stores.model";
import { useCallback, useState } from "react";

// Hook for getting a store
export function useGetStore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  const getStore = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stores/${storeId}`);
      const result = await response.json();

      if (result.success && result.store) {
        setStore(result.store);
        return result.store;
      } else {
        setError(result.error || "Failed to get store");
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
    setStore(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    store,
    loading,
    error,
    getStore,
    reset,
  };
}

// Hook for getting all stores
export function useGetAllStores() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[] | null>(null);

  const getAllStores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stores");
      const result = await response.json();

      if (result.success && result.stores) {
        setStores(result.stores);
        return result.stores;
      } else {
        setError(result.error || "Failed to get stores");
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
    setStores(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    stores,
    loading,
    error,
    getAllStores,
    reset,
  };
}

// Hook for updating a store
export function useUpdateStore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStore = useCallback(async (updateData: UpdateStore) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stores/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update store");
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
    updateStore,
    reset,
  };
}

// Combined hook that provides all store operations
export function useStores() {
  const getStore = useGetStore();
  const getAllStores = useGetAllStores();
  const updateStore = useUpdateStore();

  return {
    // Get by ID
    getStore: getStore.getStore,
    getStoreLoading: getStore.loading,
    getStoreError: getStore.error,
    getStoreData: getStore.store,
    resetGetStore: getStore.reset,

    // Get all
    getAllStores: getAllStores.getAllStores,
    getAllStoresLoading: getAllStores.loading,
    getAllStoresError: getAllStores.error,
    getAllStoresData: getAllStores.stores,
    resetGetAllStores: getAllStores.reset,

    // Update
    updateStore: updateStore.updateStore,
    updateStoreLoading: updateStore.loading,
    updateStoreError: updateStore.error,
    resetUpdateStore: updateStore.reset,
  };
}
