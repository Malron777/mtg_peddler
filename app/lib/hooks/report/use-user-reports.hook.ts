"use client";

import {
  InsertUserReport,
  UpdateUserReport,
  UserReport,
} from "@/src/domain/auth/user-reports.model";
import { useCallback, useState } from "react";

// Hook for creating a user report
export function useCreateUserReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUserReport = useCallback(
    async (insertUserReport: InsertUserReport) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/user-reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertUserReport),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create user report");
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
    createUserReport,
    reset,
  };
}

// Hook for getting a user report
export function useGetUserReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReport, setUserReport] = useState<UserReport | null>(null);

  const getUserReport = useCallback(async (reportId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-reports/${reportId}`);
      const result = await response.json();

      if (result.success && result.userReport) {
        setUserReport(result.userReport);
        return result.userReport;
      } else {
        setError(result.error || "Failed to get user report");
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
    setUserReport(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    userReport,
    loading,
    error,
    getUserReport,
    reset,
  };
}

// Hook for getting all user reports
export function useGetAllUserReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<UserReport[] | null>(null);

  const getAllUserReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user-reports");
      const result = await response.json();

      if (result.success && result.userReports) {
        setUserReports(result.userReports);
        return result.userReports;
      } else {
        setError(result.error || "Failed to get user reports");
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
    setUserReports(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    userReports,
    loading,
    error,
    getAllUserReports,
    reset,
  };
}

// Hook for getting all user reports for a user
export function useGetAllUserReportsForUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<UserReport[] | null>(null);

  const getAllUserReportsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-reports/user/${userId}`);
      const result = await response.json();

      if (result.success && result.userReports) {
        setUserReports(result.userReports);
        return result.userReports;
      } else {
        setError(result.error || "Failed to get user reports for user");
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
    setUserReports(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    userReports,
    loading,
    error,
    getAllUserReportsForUser,
    reset,
  };
}

// Hook for getting all user reports for a deal
export function useGetAllUserReportsForDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userReports, setUserReports] = useState<UserReport[] | null>(null);

  const getAllUserReportsForDeal = useCallback(async (dealId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-reports/deal/${dealId}`);
      const result = await response.json();

      if (result.success && result.userReports) {
        setUserReports(result.userReports);
        return result.userReports;
      } else {
        setError(result.error || "Failed to get user reports for deal");
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
    setUserReports(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    userReports,
    loading,
    error,
    getAllUserReportsForDeal,
    reset,
  };
}

// Hook for updating a user report
export function useUpdateUserReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserReport = useCallback(async (updateData: UpdateUserReport) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-reports/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update user report");
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
    updateUserReport,
    reset,
  };
}

// Hook for deleting a user report
export function useDeleteUserReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUserReport = useCallback(async (reportId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user report");
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
    deleteUserReport,
    reset,
  };
}

// Combined hook that provides all user report operations
export function useUserReports() {
  const createUserReport = useCreateUserReport();
  const getUserReport = useGetUserReport();
  const getAllUserReports = useGetAllUserReports();
  const getAllUserReportsForUser = useGetAllUserReportsForUser();
  const getAllUserReportsForDeal = useGetAllUserReportsForDeal();
  const updateUserReport = useUpdateUserReport();
  const deleteUserReport = useDeleteUserReport();

  return {
    // Create
    createUserReport: createUserReport.createUserReport,
    createUserReportLoading: createUserReport.loading,
    createUserReportError: createUserReport.error,
    resetCreateUserReport: createUserReport.reset,

    // Get by ID
    getUserReport: getUserReport.getUserReport,
    getUserReportLoading: getUserReport.loading,
    getUserReportError: getUserReport.error,
    getUserReportData: getUserReport.userReport,
    resetGetUserReport: getUserReport.reset,

    // Get all
    getAllUserReports: getAllUserReports.getAllUserReports,
    getAllUserReportsLoading: getAllUserReports.loading,
    getAllUserReportsError: getAllUserReports.error,
    getAllUserReportsData: getAllUserReports.userReports,
    resetGetAllUserReports: getAllUserReports.reset,

    // Get all for user
    getAllUserReportsForUser: getAllUserReportsForUser.getAllUserReportsForUser,
    getAllUserReportsForUserLoading: getAllUserReportsForUser.loading,
    getAllUserReportsForUserError: getAllUserReportsForUser.error,
    getAllUserReportsForUserData: getAllUserReportsForUser.userReports,
    resetGetAllUserReportsForUser: getAllUserReportsForUser.reset,

    // Get all for deal
    getAllUserReportsForDeal: getAllUserReportsForDeal.getAllUserReportsForDeal,
    getAllUserReportsForDealLoading: getAllUserReportsForDeal.loading,
    getAllUserReportsForDealError: getAllUserReportsForDeal.error,
    getAllUserReportsForDealData: getAllUserReportsForDeal.userReports,
    resetGetAllUserReportsForDeal: getAllUserReportsForDeal.reset,

    // Update
    updateUserReport: updateUserReport.updateUserReport,
    updateUserReportLoading: updateUserReport.loading,
    updateUserReportError: updateUserReport.error,
    resetUpdateUserReport: updateUserReport.reset,

    // Delete
    deleteUserReport: deleteUserReport.deleteUserReport,
    deleteUserReportLoading: deleteUserReport.loading,
    deleteUserReportError: deleteUserReport.error,
    resetDeleteUserReport: deleteUserReport.reset,
  };
}
