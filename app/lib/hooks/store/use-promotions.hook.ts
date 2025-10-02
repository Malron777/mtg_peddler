"use client";

import {
  InsertPromotion,
  Promotion,
  UpdatePromotion,
} from "@/src/domain/tcg/promotion.model";
import { useCallback, useState } from "react";

// Hook for creating a promotion
export function useCreatePromotion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPromotion = useCallback(
    async (insertPromotion: InsertPromotion) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/promotions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertPromotion),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create promotion");
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
    createPromotion,
    reset,
  };
}

// Hook for getting a promotion
export function useGetPromotion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  const getPromotion = useCallback(async (promotionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/promotions/${promotionId}`);
      const result = await response.json();

      if (result.success && result.promotion) {
        setPromotion(result.promotion);
        return result.promotion;
      } else {
        setError(result.error || "Failed to get promotion");
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
    setPromotion(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    promotion,
    loading,
    error,
    getPromotion,
    reset,
  };
}

// Hook for getting all promotions
export function useGetAllPromotions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);

  const getAllPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/promotions");
      const result = await response.json();

      if (result.success && result.promotions) {
        setPromotions(result.promotions);
        return result.promotions;
      } else {
        setError(result.error || "Failed to get promotions");
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
    setPromotions(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    promotions,
    loading,
    error,
    getAllPromotions,
    reset,
  };
}

// Hook for getting all promotions for a store
export function useGetAllPromotionsForStore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);

  const getAllPromotionsForStore = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/promotions/store/${storeId}`);
      const result = await response.json();

      if (result.success && result.promotions) {
        setPromotions(result.promotions);
        return result.promotions;
      } else {
        setError(result.error || "Failed to get promotions for store");
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
    setPromotions(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    promotions,
    loading,
    error,
    getAllPromotionsForStore,
    reset,
  };
}

// Hook for getting all active promotions
export function useGetAllActivePromotions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);

  const getAllActivePromotions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/promotions/active");
      const result = await response.json();

      if (result.success && result.promotions) {
        setPromotions(result.promotions);
        return result.promotions;
      } else {
        setError(result.error || "Failed to get active promotions");
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
    setPromotions(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    promotions,
    loading,
    error,
    getAllActivePromotions,
    reset,
  };
}

// Hook for getting all active promotions for a store
export function useGetAllActivePromotionsForStore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);

  const getAllActivePromotionsForStore = useCallback(
    async (storeId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/promotions/store/${storeId}/active`);
        const result = await response.json();

        if (result.success && result.promotions) {
          setPromotions(result.promotions);
          return result.promotions;
        } else {
          setError(result.error || "Failed to get active promotions for store");
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
    setPromotions(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    promotions,
    loading,
    error,
    getAllActivePromotionsForStore,
    reset,
  };
}

// Hook for updating a promotion
export function useUpdatePromotion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePromotion = useCallback(async (updateData: UpdatePromotion) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/promotions/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update promotion");
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
    updatePromotion,
    reset,
  };
}

// Hook for deleting a promotion
export function useDeletePromotion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePromotion = useCallback(async (promotionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/promotions/${promotionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete promotion");
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
    deletePromotion,
    reset,
  };
}

// Combined hook that provides all promotion operations
export function usePromotions() {
  const createPromotion = useCreatePromotion();
  const getPromotion = useGetPromotion();
  const getAllPromotions = useGetAllPromotions();
  const getAllPromotionsForStore = useGetAllPromotionsForStore();
  const getAllActivePromotions = useGetAllActivePromotions();
  const getAllActivePromotionsForStore = useGetAllActivePromotionsForStore();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();

  return {
    // Create
    createPromotion: createPromotion.createPromotion,
    createPromotionLoading: createPromotion.loading,
    createPromotionError: createPromotion.error,
    resetCreatePromotion: createPromotion.reset,

    // Get by ID
    getPromotion: getPromotion.getPromotion,
    getPromotionLoading: getPromotion.loading,
    getPromotionError: getPromotion.error,
    getPromotionData: getPromotion.promotion,
    resetGetPromotion: getPromotion.reset,

    // Get all
    getAllPromotions: getAllPromotions.getAllPromotions,
    getAllPromotionsLoading: getAllPromotions.loading,
    getAllPromotionsError: getAllPromotions.error,
    getAllPromotionsData: getAllPromotions.promotions,
    resetGetAllPromotions: getAllPromotions.reset,

    // Get all for store
    getAllPromotionsForStore: getAllPromotionsForStore.getAllPromotionsForStore,
    getAllPromotionsForStoreLoading: getAllPromotionsForStore.loading,
    getAllPromotionsForStoreError: getAllPromotionsForStore.error,
    getAllPromotionsForStoreData: getAllPromotionsForStore.promotions,
    resetGetAllPromotionsForStore: getAllPromotionsForStore.reset,

    // Get all active
    getAllActivePromotions: getAllActivePromotions.getAllActivePromotions,
    getAllActivePromotionsLoading: getAllActivePromotions.loading,
    getAllActivePromotionsError: getAllActivePromotions.error,
    getAllActivePromotionsData: getAllActivePromotions.promotions,
    resetGetAllActivePromotions: getAllActivePromotions.reset,

    // Get all active for store
    getAllActivePromotionsForStore:
      getAllActivePromotionsForStore.getAllActivePromotionsForStore,
    getAllActivePromotionsForStoreLoading:
      getAllActivePromotionsForStore.loading,
    getAllActivePromotionsForStoreError: getAllActivePromotionsForStore.error,
    getAllActivePromotionsForStoreData:
      getAllActivePromotionsForStore.promotions,
    resetGetAllActivePromotionsForStore: getAllActivePromotionsForStore.reset,

    // Update
    updatePromotion: updatePromotion.updatePromotion,
    updatePromotionLoading: updatePromotion.loading,
    updatePromotionError: updatePromotion.error,
    resetUpdatePromotion: updatePromotion.reset,

    // Delete
    deletePromotion: deletePromotion.deletePromotion,
    deletePromotionLoading: deletePromotion.loading,
    deletePromotionError: deletePromotion.error,
    resetDeletePromotion: deletePromotion.reset,
  };
}
