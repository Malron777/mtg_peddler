"use client";

import {
  InsertLocation,
  Location,
  UpdateLocation,
} from "@/src/domain/tcg/location.model";
import { useCallback, useState } from "react";

// Hook for creating a location
export function useCreateLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLocation = useCallback(async (insertLocation: InsertLocation) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(insertLocation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create location");
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
    createLocation,
    reset,
  };
}

// Hook for getting a location
export function useGetLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  const getLocation = useCallback(async (locationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/locations/${locationId}`);
      const result = await response.json();

      if (result.success && result.location) {
        setLocation(result.location);
        return result.location;
      } else {
        setError(result.error || "Failed to get location");
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
    setLocation(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    location,
    loading,
    error,
    getLocation,
    reset,
  };
}

// Hook for getting all locations
export function useGetAllLocations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[] | null>(null);

  const getAllLocations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/locations");
      const result = await response.json();

      if (result.success && result.locations) {
        setLocations(result.locations);
        return result.locations;
      } else {
        setError(result.error || "Failed to get locations");
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
    setLocations(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    locations,
    loading,
    error,
    getAllLocations,
    reset,
  };
}

// Hook for getting all locations for a user
export function useGetAllLocationsForUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[] | null>(null);

  const getAllLocationsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/locations/user/${userId}`);
      const result = await response.json();

      if (result.success && result.locations) {
        setLocations(result.locations);
        return result.locations;
      } else {
        setError(result.error || "Failed to get locations for user");
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
    setLocations(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    locations,
    loading,
    error,
    getAllLocationsForUser,
    reset,
  };
}

// Hook for updating a location
export function useUpdateLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLocation = useCallback(async (updateData: UpdateLocation) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/locations/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update location");
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
    updateLocation,
    reset,
  };
}

// Hook for deleting a location
export function useDeleteLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteLocation = useCallback(async (locationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete location");
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
    deleteLocation,
    reset,
  };
}

// Combined hook that provides all location operations
export function useLocations() {
  const createLocation = useCreateLocation();
  const getLocation = useGetLocation();
  const getAllLocations = useGetAllLocations();
  const getAllLocationsForUser = useGetAllLocationsForUser();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  return {
    // Create
    createLocation: createLocation.createLocation,
    createLocationLoading: createLocation.loading,
    createLocationError: createLocation.error,
    resetCreateLocation: createLocation.reset,

    // Get by ID
    getLocation: getLocation.getLocation,
    getLocationLoading: getLocation.loading,
    getLocationError: getLocation.error,
    getLocationData: getLocation.location,
    resetGetLocation: getLocation.reset,

    // Get all
    getAllLocations: getAllLocations.getAllLocations,
    getAllLocationsLoading: getAllLocations.loading,
    getAllLocationsError: getAllLocations.error,
    getAllLocationsData: getAllLocations.locations,
    resetGetAllLocations: getAllLocations.reset,

    // Get all for user
    getAllLocationsForUser: getAllLocationsForUser.getAllLocationsForUser,
    getAllLocationsForUserLoading: getAllLocationsForUser.loading,
    getAllLocationsForUserError: getAllLocationsForUser.error,
    getAllLocationsForUserData: getAllLocationsForUser.locations,
    resetGetAllLocationsForUser: getAllLocationsForUser.reset,

    // Update
    updateLocation: updateLocation.updateLocation,
    updateLocationLoading: updateLocation.loading,
    updateLocationError: updateLocation.error,
    resetUpdateLocation: updateLocation.reset,

    // Delete
    deleteLocation: deleteLocation.deleteLocation,
    deleteLocationLoading: deleteLocation.loading,
    deleteLocationError: deleteLocation.error,
    resetDeleteLocation: deleteLocation.reset,
  };
}
