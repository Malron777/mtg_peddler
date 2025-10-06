"use client";

import {
  InsertWantList,
  UpdateWantList,
  WantList,
} from "@/src/domain/tcg/want-list.model";
import { useCallback, useState } from "react";

// Hook for creating a want list
export function useCreateWantList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWantList = useCallback(async (insertWantList: InsertWantList) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/want-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(insertWantList),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create want list");
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
    createWantList,
    reset,
  };
}

// Hook for getting a want list
export function useGetWantList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantList, setWantList] = useState<WantList | null>(null);

  const getWantList = useCallback(async (wantListId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/want-lists/${wantListId}`);
      const result = await response.json();

      if (result.success && result.wantList) {
        setWantList(result.wantList);
        return result.wantList;
      } else {
        setError(result.error || "Failed to get want list");
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
    setWantList(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    wantList,
    loading,
    error,
    getWantList,
    reset,
  };
}

// Hook for getting all want lists
export function useGetAllWantLists() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantLists, setWantLists] = useState<WantList[] | null>(null);

  const getAllWantLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/want-lists");
      const result = await response.json();

      if (result.success && result.wantLists) {
        setWantLists(result.wantLists);
        return result.wantLists;
      } else {
        setError(result.error || "Failed to get want lists");
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
    setWantLists(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    wantLists,
    loading,
    error,
    getAllWantLists,
    reset,
  };
}

// Hook for getting all want lists for a user
export function useGetAllWantListsForUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantLists, setWantLists] = useState<WantList[] | null>(null);

  const getAllWantListsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/want-lists/user/${userId}`);
      const result = await response.json();

      if (result.success && result.wantLists) {
        setWantLists(result.wantLists);
        return result.wantLists;
      } else {
        setError(result.error || "Failed to get want lists for user");
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
    setWantLists(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    wantLists,
    loading,
    error,
    getAllWantListsForUser,
    reset,
  };
}

// Hook for updating a want list
export function useUpdateWantList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWantList = useCallback(async (updateData: UpdateWantList) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/want-lists/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update want list");
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
    updateWantList,
    reset,
  };
}

// Hook for deleting a want list
export function useDeleteWantList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteWantList = useCallback(async (wantListId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/want-lists/${wantListId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete want list");
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
    deleteWantList,
    reset,
  };
}

// Combined hook that provides all want list operations
export function useWantLists() {
  const createWantList = useCreateWantList();
  const getWantList = useGetWantList();
  const getAllWantLists = useGetAllWantLists();
  const getAllWantListsForUser = useGetAllWantListsForUser();
  const updateWantList = useUpdateWantList();
  const deleteWantList = useDeleteWantList();

  return {
    // Create
    createWantList: createWantList.createWantList,
    createWantListLoading: createWantList.loading,
    createWantListError: createWantList.error,
    resetCreateWantList: createWantList.reset,

    // Get by ID
    getWantList: getWantList.getWantList,
    getWantListLoading: getWantList.loading,
    getWantListError: getWantList.error,
    getWantListData: getWantList.wantList,
    resetGetWantList: getWantList.reset,

    // Get all
    getAllWantLists: getAllWantLists.getAllWantLists,
    getAllWantListsLoading: getAllWantLists.loading,
    getAllWantListsError: getAllWantLists.error,
    getAllWantListsData: getAllWantLists.wantLists,
    resetGetAllWantLists: getAllWantLists.reset,

    // Get all for user
    getAllWantListsForUser: getAllWantListsForUser.getAllWantListsForUser,
    getAllWantListsForUserLoading: getAllWantListsForUser.loading,
    getAllWantListsForUserError: getAllWantListsForUser.error,
    getAllWantListsForUserData: getAllWantListsForUser.wantLists,
    resetGetAllWantListsForUser: getAllWantListsForUser.reset,

    // Update
    updateWantList: updateWantList.updateWantList,
    updateWantListLoading: updateWantList.loading,
    updateWantListError: updateWantList.error,
    resetUpdateWantList: updateWantList.reset,

    // Delete
    deleteWantList: deleteWantList.deleteWantList,
    deleteWantListLoading: deleteWantList.loading,
    deleteWantListError: deleteWantList.error,
    resetDeleteWantList: deleteWantList.reset,
  };
}
