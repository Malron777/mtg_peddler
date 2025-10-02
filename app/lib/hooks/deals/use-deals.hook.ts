"use client";

import { Deal, UpdateDeal } from "@/src/domain/tcg/deal.model";
import { useCallback, useState } from "react";

// Hook for getting all deals
export function useGetAllDeals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);

  const getAllDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/deals");
      const result = await response.json();

      if (result.success && result.deals) {
        setDeals(result.deals);
        return result.deals;
      } else {
        setError(result.error || "Failed to get deals");
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
    setDeals(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    deals,
    loading,
    error,
    getAllDeals,
    reset,
  };
}

// Hook for getting all deals for a user
export function useGetAllDealsForUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);

  const getAllDealsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deals/user/${userId}`);
      const result = await response.json();

      if (result.success && result.deals) {
        setDeals(result.deals);
        return result.deals;
      } else {
        setError(result.error || "Failed to get deals for user");
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
    setDeals(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    deals,
    loading,
    error,
    getAllDealsForUser,
    reset,
  };
}

// Hook for getting all deals for a card
export function useGetAllDealsForCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);

  const getAllDealsForCard = useCallback(async (cardId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deals/card/${cardId}`);
      const result = await response.json();

      if (result.success && result.deals) {
        setDeals(result.deals);
        return result.deals;
      } else {
        setError(result.error || "Failed to get deals for card");
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
    setDeals(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    deals,
    loading,
    error,
    getAllDealsForCard,
    reset,
  };
}

// Hook for getting all deals for a collection
export function useGetAllDealsForCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[] | null>(null);

  const getAllDealsForCollection = useCallback(async (collectionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deals/collection/${collectionId}`);
      const result = await response.json();

      if (result.success && result.deals) {
        setDeals(result.deals);
        return result.deals;
      } else {
        setError(result.error || "Failed to get deals for collection");
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
    setDeals(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    deals,
    loading,
    error,
    getAllDealsForCollection,
    reset,
  };
}

// Hook for getting a deal
export function useGetDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);

  const getDeal = useCallback(async (dealId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deals/${dealId}`);
      const result = await response.json();

      if (result.success && result.deal) {
        setDeal(result.deal);
        return result.deal;
      } else {
        setError(result.error || "Failed to get deal");
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
    setDeal(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    deal,
    loading,
    error,
    getDeal,
    reset,
  };
}

// Hook for updating a deal
export function useUpdateDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDeal = useCallback(async (updateData: UpdateDeal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/deals/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update deal");
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
    updateDeal,
    reset,
  };
}

// Combined hook that provides all deal operations
export function useDeals() {
  const getAllDeals = useGetAllDeals();
  const getAllDealsForUser = useGetAllDealsForUser();
  const getAllDealsForCard = useGetAllDealsForCard();
  const getAllDealsForCollection = useGetAllDealsForCollection();
  const getDeal = useGetDeal();
  const updateDeal = useUpdateDeal();

  return {
    // Get all
    getAllDeals: getAllDeals.getAllDeals,
    getAllDealsLoading: getAllDeals.loading,
    getAllDealsError: getAllDeals.error,
    getAllDealsData: getAllDeals.deals,
    resetGetAllDeals: getAllDeals.reset,

    // Get all for user
    getAllDealsForUser: getAllDealsForUser.getAllDealsForUser,
    getAllDealsForUserLoading: getAllDealsForUser.loading,
    getAllDealsForUserError: getAllDealsForUser.error,
    getAllDealsForUserData: getAllDealsForUser.deals,
    resetGetAllDealsForUser: getAllDealsForUser.reset,

    // Get all for card
    getAllDealsForCard: getAllDealsForCard.getAllDealsForCard,
    getAllDealsForCardLoading: getAllDealsForCard.loading,
    getAllDealsForCardError: getAllDealsForCard.error,
    getAllDealsForCardData: getAllDealsForCard.deals,
    resetGetAllDealsForCard: getAllDealsForCard.reset,

    // Get all for collection
    getAllDealsForCollection: getAllDealsForCollection.getAllDealsForCollection,
    getAllDealsForCollectionLoading: getAllDealsForCollection.loading,
    getAllDealsForCollectionError: getAllDealsForCollection.error,
    getAllDealsForCollectionData: getAllDealsForCollection.deals,
    resetGetAllDealsForCollection: getAllDealsForCollection.reset,

    // Get by ID
    getDeal: getDeal.getDeal,
    getDealLoading: getDeal.loading,
    getDealError: getDeal.error,
    getDealData: getDeal.deal,
    resetGetDeal: getDeal.reset,

    // Update
    updateDeal: updateDeal.updateDeal,
    updateDealLoading: updateDeal.loading,
    updateDealError: updateDeal.error,
    resetUpdateDeal: updateDeal.reset,
  };
}
