"use client";

import { useCallback, useState } from "react";

// Hook for getting active trades count
export function useGetActiveTradesCount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const getActiveTradesCount = useCallback(
    async (options?: { userId?: string; userIds?: string[] }) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (options?.userId) queryParams.append("userId", options.userId);
        if (options?.userIds)
          queryParams.append("userIds", options.userIds.join(","));

        const response = await fetch(
          `/api/deals/active-trades-count?${queryParams.toString()}`
        );
        const result = await response.json();

        if (result.success) {
          if (result.count !== undefined) {
            setCount(result.count);
          } else if (result.counts && result.counts.length > 0) {
            setCount(
              result.counts.reduce(
                (sum: number, item: { count: number }) => sum + item.count,
                0
              )
            );
          }
          return result;
        } else {
          setError(result.error || "Failed to get active trades count");
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
    setCount(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    count,
    loading,
    error,
    getActiveTradesCount,
    reset,
  };
}
