"use client";

import {
  InsertPriceHistory,
  PriceHistory,
  UpdatePriceHistory,
} from "@/src/domain/tcg/price-history.model";
import { useCallback, useState } from "react";

// Hook for creating price history
export function useCreatePriceHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPriceHistory = useCallback(
    async (insertPriceHistory: InsertPriceHistory) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/price-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertPriceHistory),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create price history");
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
    createPriceHistory,
    reset,
  };
}

// Hook for getting price history by ID
export function useGetPriceHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);

  const getPriceHistory = useCallback(async (priceHistoryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/price-history/${priceHistoryId}`);
      const result = await response.json();

      if (result.success && result.priceHistory) {
        setPriceHistory(result.priceHistory);
        return result.priceHistory;
      } else {
        setError(result.error || "Failed to get price history");
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
    setPriceHistory(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    priceHistory,
    loading,
    error,
    getPriceHistory,
    reset,
  };
}

// Hook for getting price history for a card
export function useGetPriceHistoryForCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[] | null>(null);

  const getPriceHistoryForCard = useCallback(async (cardId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/price-history/card/${cardId}`);
      const result = await response.json();

      if (result.success && result.priceHistory) {
        setPriceHistory(result.priceHistory);
        return result.priceHistory;
      } else {
        setError(result.error || "Failed to get price history for card");
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
    setPriceHistory(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    priceHistory,
    loading,
    error,
    getPriceHistoryForCard,
    reset,
  };
}

// Hook for getting all price history
export function useGetAllPriceHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[] | null>(null);

  const getAllPriceHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/price-history");
      const result = await response.json();

      if (result.success && result.priceHistory) {
        setPriceHistory(result.priceHistory);
        return result.priceHistory;
      } else {
        setError(result.error || "Failed to get all price history");
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
    setPriceHistory(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    priceHistory,
    loading,
    error,
    getAllPriceHistory,
    reset,
  };
}

// Hook for updating price history
export function useUpdatePriceHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePriceHistory = useCallback(
    async (updateData: UpdatePriceHistory) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/price-history/${updateData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update price history");
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
    updatePriceHistory,
    reset,
  };
}

// Hook for deleting price history
export function useDeletePriceHistory() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePriceHistory = useCallback(async (priceHistoryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/price-history/${priceHistoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete price history");
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
    deletePriceHistory,
    reset,
  };
}

// Combined hook that provides all price history operations
export function usePriceHistory() {
  const createPriceHistory = useCreatePriceHistory();
  const getPriceHistory = useGetPriceHistory();
  const getPriceHistoryForCard = useGetPriceHistoryForCard();
  const getAllPriceHistory = useGetAllPriceHistory();
  const updatePriceHistory = useUpdatePriceHistory();
  const deletePriceHistory = useDeletePriceHistory();

  return {
    // Create
    createPriceHistory: createPriceHistory.createPriceHistory,
    createPriceHistoryLoading: createPriceHistory.loading,
    createPriceHistoryError: createPriceHistory.error,
    resetCreatePriceHistory: createPriceHistory.reset,

    // Get by ID
    getPriceHistory: getPriceHistory.getPriceHistory,
    getPriceHistoryLoading: getPriceHistory.loading,
    getPriceHistoryError: getPriceHistory.error,
    getPriceHistoryData: getPriceHistory.priceHistory,
    resetGetPriceHistory: getPriceHistory.reset,

    // Get for card
    getPriceHistoryForCard: getPriceHistoryForCard.getPriceHistoryForCard,
    getPriceHistoryForCardLoading: getPriceHistoryForCard.loading,
    getPriceHistoryForCardError: getPriceHistoryForCard.error,
    getPriceHistoryForCardData: getPriceHistoryForCard.priceHistory,
    resetGetPriceHistoryForCard: getPriceHistoryForCard.reset,

    // Get all
    getAllPriceHistory: getAllPriceHistory.getAllPriceHistory,
    getAllPriceHistoryLoading: getAllPriceHistory.loading,
    getAllPriceHistoryError: getAllPriceHistory.error,
    getAllPriceHistoryData: getAllPriceHistory.priceHistory,
    resetGetAllPriceHistory: getAllPriceHistory.reset,

    // Update
    updatePriceHistory: updatePriceHistory.updatePriceHistory,
    updatePriceHistoryLoading: updatePriceHistory.loading,
    updatePriceHistoryError: updatePriceHistory.error,
    resetUpdatePriceHistory: updatePriceHistory.reset,

    // Delete
    deletePriceHistory: deletePriceHistory.deletePriceHistory,
    deletePriceHistoryLoading: deletePriceHistory.loading,
    deletePriceHistoryError: deletePriceHistory.error,
    resetDeletePriceHistory: deletePriceHistory.reset,
  };
}
