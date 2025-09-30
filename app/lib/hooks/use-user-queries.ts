"use client";

import { UpdateUser, User } from "@/src/domain/auth/user.model";
import {
  GetAllUsersOptions,
  GetAllUsersResult,
} from "@/src/infra/repos/get-all-users.query";
import { GetUserResult } from "@/src/infra/repos/get-user.query";
import { useCallback, useState } from "react";

// Hook for getting a single user
export function useGetUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const getUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      const result: GetUserResult = await response.json();

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

// Hook for updating a user
export function useUpdateUser() {
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

      const updatedUser = await response.json();
      return updatedUser;
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

// Hook for getting all users with pagination
export function useGetAllUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GetAllUsersResult | null>(null);

  const getAllUsers = useCallback(async (options?: GetAllUsersOptions) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      if (options?.page) searchParams.set("page", options.page.toString());
      if (options?.pageSize)
        searchParams.set("pageSize", options.pageSize.toString());

      const response = await fetch(`/api/users?${searchParams.toString()}`);
      const result = await response.json();

      setData(result);
      return result;
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
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    getAllUsers,
    reset,
  };
}

// Combined hook that provides all user operations
export function useUserQueries() {
  const getUser = useGetUser();
  const updateUser = useUpdateUser();
  const getAllUsers = useGetAllUsers();

  return {
    getUser: getUser.getUser,
    getUserLoading: getUser.loading,
    getUserError: getUser.error,
    getUserData: getUser.user,
    resetGetUser: getUser.reset,

    updateUser: updateUser.updateUser,
    updateUserLoading: updateUser.loading,
    updateUserError: updateUser.error,
    resetUpdateUser: updateUser.reset,

    getAllUsers: getAllUsers.getAllUsers,
    getAllUsersLoading: getAllUsers.loading,
    getAllUsersError: getAllUsers.error,
    getAllUsersData: getAllUsers.data,
    resetGetAllUsers: getAllUsers.reset,
  };
}
