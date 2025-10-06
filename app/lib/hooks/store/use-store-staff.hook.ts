"use client";

import {
  InsertStoreStaff,
  StoreStaff,
  UpdateStoreStaff,
} from "@/src/domain/auth/store-staff.model";
import { useCallback, useState } from "react";

// Hook for creating store staff
export function useCreateStoreStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStoreStaff = useCallback(
    async (insertStoreStaff: InsertStoreStaff) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/store-staff", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertStoreStaff),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create store staff");
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
    createStoreStaff,
    reset,
  };
}

// Hook for getting store staff
export function useGetStoreStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeStaff, setStoreStaff] = useState<StoreStaff | null>(null);

  const getStoreStaff = useCallback(
    async (storeId: string, staffId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/store-staff/${storeId}/${staffId}`);
        const result = await response.json();

        if (result.success && result.storeStaff) {
          setStoreStaff(result.storeStaff);
          return result.storeStaff;
        } else {
          setError(result.error || "Failed to get store staff");
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
    setStoreStaff(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    storeStaff,
    loading,
    error,
    getStoreStaff,
    reset,
  };
}

// Hook for getting all store staff
export function useGetAllStoreStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeStaff, setStoreStaff] = useState<StoreStaff[] | null>(null);

  const getAllStoreStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/store-staff");
      const result = await response.json();

      if (result.success && result.storeStaff) {
        setStoreStaff(result.storeStaff);
        return result.storeStaff;
      } else {
        setError(result.error || "Failed to get store staff");
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
    setStoreStaff(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    storeStaff,
    loading,
    error,
    getAllStoreStaff,
    reset,
  };
}

// Hook for getting all store staff for a store
export function useGetAllStoreStaffForStore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeStaff, setStoreStaff] = useState<StoreStaff[] | null>(null);

  const getAllStoreStaffForStore = useCallback(async (storeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/store-staff/store/${storeId}`);
      const result = await response.json();

      if (result.success && result.storeStaff) {
        setStoreStaff(result.storeStaff);
        return result.storeStaff;
      } else {
        setError(result.error || "Failed to get store staff for store");
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
    setStoreStaff(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    storeStaff,
    loading,
    error,
    getAllStoreStaffForStore,
    reset,
  };
}

// Hook for updating store staff
export function useUpdateStoreStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStoreStaff = useCallback(async (updateData: UpdateStoreStaff) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/store-staff/${updateData.storeId}/${updateData.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update store staff");
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
    updateStoreStaff,
    reset,
  };
}

// Hook for deleting store staff
export function useDeleteStoreStaff() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteStoreStaff = useCallback(
    async (storeId: string, userId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/store-staff/${storeId}/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete store staff");
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
    deleteStoreStaff,
    reset,
  };
}

// Combined hook that provides all store staff operations
export function useStoreStaff() {
  const createStoreStaff = useCreateStoreStaff();
  const getStoreStaff = useGetStoreStaff();
  const getAllStoreStaff = useGetAllStoreStaff();
  const getAllStoreStaffForStore = useGetAllStoreStaffForStore();
  const updateStoreStaff = useUpdateStoreStaff();
  const deleteStoreStaff = useDeleteStoreStaff();

  return {
    // Create
    createStoreStaff: createStoreStaff.createStoreStaff,
    createStoreStaffLoading: createStoreStaff.loading,
    createStoreStaffError: createStoreStaff.error,
    resetCreateStoreStaff: createStoreStaff.reset,

    // Get by store and staff ID
    getStoreStaff: getStoreStaff.getStoreStaff,
    getStoreStaffLoading: getStoreStaff.loading,
    getStoreStaffError: getStoreStaff.error,
    getStoreStaffData: getStoreStaff.storeStaff,
    resetGetStoreStaff: getStoreStaff.reset,

    // Get all
    getAllStoreStaff: getAllStoreStaff.getAllStoreStaff,
    getAllStoreStaffLoading: getAllStoreStaff.loading,
    getAllStoreStaffError: getAllStoreStaff.error,
    getAllStoreStaffData: getAllStoreStaff.storeStaff,
    resetGetAllStoreStaff: getAllStoreStaff.reset,

    // Get all for store
    getAllStoreStaffForStore: getAllStoreStaffForStore.getAllStoreStaffForStore,
    getAllStoreStaffForStoreLoading: getAllStoreStaffForStore.loading,
    getAllStoreStaffForStoreError: getAllStoreStaffForStore.error,
    getAllStoreStaffForStoreData: getAllStoreStaffForStore.storeStaff,
    resetGetAllStoreStaffForStore: getAllStoreStaffForStore.reset,

    // Update
    updateStoreStaff: updateStoreStaff.updateStoreStaff,
    updateStoreStaffLoading: updateStoreStaff.loading,
    updateStoreStaffError: updateStoreStaff.error,
    resetUpdateStoreStaff: updateStoreStaff.reset,

    // Delete
    deleteStoreStaff: deleteStoreStaff.deleteStoreStaff,
    deleteStoreStaffLoading: deleteStoreStaff.loading,
    deleteStoreStaffError: deleteStoreStaff.error,
    resetDeleteStoreStaff: deleteStoreStaff.reset,
  };
}
