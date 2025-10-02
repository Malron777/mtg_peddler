"use client";

import {
  Collection,
  InsertCollection,
  UpdateCollection,
} from "@/src/domain/tcg/collection.model";
import { useCallback, useState } from "react";

// Hook for creating a collection
export function useCreateCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCollection = useCallback(
    async (insertCollection: InsertCollection) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/collections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertCollection),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create collection");
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
    createCollection,
    reset,
  };
}

// Hook for getting a collection
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

// Hook for getting all collections
export function useGetAllCollections() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);

  const getAllCollections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/collections");
      const result = await response.json();

      if (result.success && result.collections) {
        setCollections(result.collections);
        return result.collections;
      } else {
        setError(result.error || "Failed to get collections");
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
    getAllCollections,
    reset,
  };
}

// Hook for getting all collections for a user
export function useGetAllCollectionsForUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);

  const getAllCollectionsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collections/user/${userId}`);
      const result = await response.json();

      if (result.success && result.collections) {
        setCollections(result.collections);
        return result.collections;
      } else {
        setError(result.error || "Failed to get collections for user");
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
    getAllCollectionsForUser,
    reset,
  };
}

// Hook for getting all collections containing a card
export function useGetAllCollectionsContainingCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[] | null>(null);

  const getAllCollectionsContainingCard = useCallback(
    async (cardId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/collections/card/${cardId}`);
        const result = await response.json();

        if (result.success && result.collections) {
          setCollections(result.collections);
          return result.collections;
        } else {
          setError(result.error || "Failed to get collections containing card");
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
    setCollections(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    collections,
    loading,
    error,
    getAllCollectionsContainingCard,
    reset,
  };
}

// Hook for updating a collection
export function useUpdateCollection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCollection = useCallback(async (updateData: UpdateCollection) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/collections/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update collection");
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
  const createCollection = useCreateCollection();
  const getCollection = useGetCollection();
  const getAllCollections = useGetAllCollections();
  const getAllCollectionsForUser = useGetAllCollectionsForUser();
  const getAllCollectionsContainingCard = useGetAllCollectionsContainingCard();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  return {
    // Create
    createCollection: createCollection.createCollection,
    createCollectionLoading: createCollection.loading,
    createCollectionError: createCollection.error,
    resetCreateCollection: createCollection.reset,

    // Get by ID
    getCollection: getCollection.getCollection,
    getCollectionLoading: getCollection.loading,
    getCollectionError: getCollection.error,
    getCollectionData: getCollection.collection,
    resetGetCollection: getCollection.reset,

    // Get all
    getAllCollections: getAllCollections.getAllCollections,
    getAllCollectionsLoading: getAllCollections.loading,
    getAllCollectionsError: getAllCollections.error,
    getAllCollectionsData: getAllCollections.collections,
    resetGetAllCollections: getAllCollections.reset,

    // Get all for user
    getAllCollectionsForUser: getAllCollectionsForUser.getAllCollectionsForUser,
    getAllCollectionsForUserLoading: getAllCollectionsForUser.loading,
    getAllCollectionsForUserError: getAllCollectionsForUser.error,
    getAllCollectionsForUserData: getAllCollectionsForUser.collections,
    resetGetAllCollectionsForUser: getAllCollectionsForUser.reset,

    // Get all containing card
    getAllCollectionsContainingCard:
      getAllCollectionsContainingCard.getAllCollectionsContainingCard,
    getAllCollectionsContainingCardLoading:
      getAllCollectionsContainingCard.loading,
    getAllCollectionsContainingCardError: getAllCollectionsContainingCard.error,
    getAllCollectionsContainingCardData:
      getAllCollectionsContainingCard.collections,
    resetGetAllCollectionsContainingCard: getAllCollectionsContainingCard.reset,

    // Update
    updateCollection: updateCollection.updateCollection,
    updateCollectionLoading: updateCollection.loading,
    updateCollectionError: updateCollection.error,
    resetUpdateCollection: updateCollection.reset,

    // Delete
    deleteCollection: deleteCollection.deleteCollection,
    deleteCollectionLoading: deleteCollection.loading,
    deleteCollectionError: deleteCollection.error,
    resetDeleteCollection: deleteCollection.reset,
  };
}
