"use client";

import { UpdateUser, User } from "@/src/domain/auth/user.model";
import { useCallback, useState } from "react";

// Hook for getting a user (from use case)
export function useGetUserFromUseCase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();

      if (result.success && result.user) {
        setUser(result.user);
        return result.user;
      } else {
        setError(result.error || "Failed to get user");
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
    setUser(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    error,
    getUser,
    reset,
  };
}

// Hook for getting all users (from use case)
export function useGetAllUsersFromUseCase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users");
      const result = await response.json();

      if (result.success && result.users) {
        setUsers(result.users);
        return result.users;
      } else {
        setError(result.error || "Failed to get users");
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
    setUsers(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    users,
    loading,
    error,
    getAllUsers,
    reset,
  };
}

// Hook for updating a user (from use case)
export function useUpdateUserFromUseCase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (updateData: UpdateUser) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user");
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
    updateUser,
    reset,
  };
}

// Combined hook that provides all user operations from use case
export function useUsersFromUseCase() {
  const getUser = useGetUserFromUseCase();
  const getAllUsers = useGetAllUsersFromUseCase();
  const updateUser = useUpdateUserFromUseCase();

  return {
    // Get by ID
    getUser: getUser.getUser,
    getUserLoading: getUser.loading,
    getUserError: getUser.error,
    getUserData: getUser.user,
    resetGetUser: getUser.reset,

    // Get all
    getAllUsers: getAllUsers.getAllUsers,
    getAllUsersLoading: getAllUsers.loading,
    getAllUsersError: getAllUsers.error,
    getAllUsersData: getAllUsers.users,
    resetGetAllUsers: getAllUsers.reset,

    // Update
    updateUser: updateUser.updateUser,
    updateUserLoading: updateUser.loading,
    updateUserError: updateUser.error,
    resetUpdateUser: updateUser.reset,
  };
}
