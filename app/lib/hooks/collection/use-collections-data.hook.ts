"use client";

import { Collection } from "@/src/domain/tcg/collection.model";
import { useCallback, useState } from "react";

// Hook for getting all collections for the current user
export function useGetUserCollections() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);

  const getUserCollections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/collections");
      const result = await response.json();

      if (result.success && result.collections) {
        setCollections(result.collections);
        return result.collections;
      } else {
        setError(result.error || "Failed to get user collections");
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
    setCollections(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collections,
    loading,
    error,
    getUserCollections,
    reset,
  };
}

// Hook for getting a single collection
export function useGetCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);

  const getCollection = useCallback(async (collectionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collections/${collectionId}`);
      const result = await response.json();

      if (result.success && result.collection) {
        setCollection(result.collection);
        return result.collection;
      } else {
        setError(result.error || "Failed to get collection");
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
    setCollection(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collection,
    loading,
    error,
    getCollection,
    reset,
  };
}

// Hook for creating a collection
export function useCreateCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCollection = useCallback(
    async (data: {
      name: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/collections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create collection");
        }

        const result = await response.json();
        return result.collection;
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
    createCollection,
    reset,
  };
}

// Hook for updating a collection
export function useUpdateCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCollection = useCallback(
    async (
      collectionId: string,
      data: { name?: string; description?: string; isPublic?: boolean }
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/collections/${collectionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update collection");
        }

        const result = await response.json();
        return result.collection;
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
    updateCollection,
    reset,
  };
}

// Hook for deleting a collection
export function useDeleteCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCollection = useCallback(async (collectionId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete collection");
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
    deleteCollection,
    reset,
  };
}

// Combined hook that provides all collection operations
export function useCollections() {
  const getUserCollections = useGetUserCollections();
  const getCollection = useGetCollection();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  return {
    // Get user collections
    getUserCollections: getUserCollections.getUserCollections,
    getUserCollectionsLoading: getUserCollections.loading,
    getUserCollectionsError: getUserCollections.error,
    getUserCollectionsData: getUserCollections.collections,
    resetGetUserCollections: getUserCollections.reset,

    // Get single collection
    getCollection: getCollection.getCollection,
    getCollectionLoading: getCollection.loading,
    getCollectionError: getCollection.error,
    getCollectionData: getCollection.collection,
    resetGetCollection: getCollection.reset,

    // Create collection
    createCollection: createCollection.createCollection,
    createCollectionLoading: createCollection.loading,
    createCollectionError: createCollection.error,
    resetCreateCollection: createCollection.reset,

    // Update collection
    updateCollection: updateCollection.updateCollection,
    updateCollectionLoading: updateCollection.loading,
    updateCollectionError: updateCollection.error,
    resetUpdateCollection: updateCollection.reset,

    // Delete collection
    deleteCollection: deleteCollection.deleteCollection,
    deleteCollectionLoading: deleteCollection.loading,
    deleteCollectionError: deleteCollection.error,
    resetDeleteCollection: deleteCollection.reset,
  };
}
