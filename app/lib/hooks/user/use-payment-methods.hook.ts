"use client";

import {
  InsertPaymentMethod,
  PaymentMethod,
  UpdatePaymentMethod,
} from "@/src/domain/tcg/payment-method.model";
import { useCallback, useState } from "react";

// Hook for creating a payment method
export function useCreatePaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentMethod = useCallback(
    async (insertPaymentMethod: InsertPaymentMethod) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/payment-methods", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertPaymentMethod),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payment method");
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
    createPaymentMethod,
    reset,
  };
}

// Hook for getting a payment method
export function useGetPaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );

  const getPaymentMethod = useCallback(async (paymentMethodId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`);
      const result = await response.json();

      if (result.success && result.paymentMethod) {
        setPaymentMethod(result.paymentMethod);
        return result.paymentMethod;
      } else {
        setError(result.error || "Failed to get payment method");
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
    setPaymentMethod(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    paymentMethod,
    loading,
    error,
    getPaymentMethod,
    reset,
  };
}

// Hook for getting all payment methods
export function useGetAllPaymentMethods() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(
    null
  );

  const getAllPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment-methods");
      const result = await response.json();

      if (result.success && result.paymentMethods) {
        setPaymentMethods(result.paymentMethods);
        return result.paymentMethods;
      } else {
        setError(result.error || "Failed to get payment methods");
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
    setPaymentMethods(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    getAllPaymentMethods,
    reset,
  };
}

// Hook for getting all payment methods for a user
export function useGetAllPaymentMethodsForUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(
    null
  );

  const getAllPaymentMethodsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment-methods/user/${userId}`);
      const result = await response.json();

      if (result.success && result.paymentMethods) {
        setPaymentMethods(result.paymentMethods);
        return result.paymentMethods;
      } else {
        setError(result.error || "Failed to get payment methods for user");
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
    setPaymentMethods(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    paymentMethods,
    loading,
    error,
    getAllPaymentMethodsForUser,
    reset,
  };
}

// Hook for updating a payment method
export function useUpdatePaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePaymentMethod = useCallback(
    async (updateData: UpdatePaymentMethod) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/payment-methods/${updateData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update payment method");
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
    updatePaymentMethod,
    reset,
  };
}

// Hook for deleting a payment method
export function useDeletePaymentMethod() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete payment method");
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
    deletePaymentMethod,
    reset,
  };
}

// Combined hook that provides all payment method operations
export function usePaymentMethods() {
  const createPaymentMethod = useCreatePaymentMethod();
  const getPaymentMethod = useGetPaymentMethod();
  const getAllPaymentMethods = useGetAllPaymentMethods();
  const getAllPaymentMethodsForUser = useGetAllPaymentMethodsForUser();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();

  return {
    // Create
    createPaymentMethod: createPaymentMethod.createPaymentMethod,
    createPaymentMethodLoading: createPaymentMethod.loading,
    createPaymentMethodError: createPaymentMethod.error,
    resetCreatePaymentMethod: createPaymentMethod.reset,

    // Get by ID
    getPaymentMethod: getPaymentMethod.getPaymentMethod,
    getPaymentMethodLoading: getPaymentMethod.loading,
    getPaymentMethodError: getPaymentMethod.error,
    getPaymentMethodData: getPaymentMethod.paymentMethod,
    resetGetPaymentMethod: getPaymentMethod.reset,

    // Get all
    getAllPaymentMethods: getAllPaymentMethods.getAllPaymentMethods,
    getAllPaymentMethodsLoading: getAllPaymentMethods.loading,
    getAllPaymentMethodsError: getAllPaymentMethods.error,
    getAllPaymentMethodsData: getAllPaymentMethods.paymentMethods,
    resetGetAllPaymentMethods: getAllPaymentMethods.reset,

    // Get all for user
    getAllPaymentMethodsForUser:
      getAllPaymentMethodsForUser.getAllPaymentMethodsForUser,
    getAllPaymentMethodsForUserLoading: getAllPaymentMethodsForUser.loading,
    getAllPaymentMethodsForUserError: getAllPaymentMethodsForUser.error,
    getAllPaymentMethodsForUserData: getAllPaymentMethodsForUser.paymentMethods,
    resetGetAllPaymentMethodsForUser: getAllPaymentMethodsForUser.reset,

    // Update
    updatePaymentMethod: updatePaymentMethod.updatePaymentMethod,
    updatePaymentMethodLoading: updatePaymentMethod.loading,
    updatePaymentMethodError: updatePaymentMethod.error,
    resetUpdatePaymentMethod: updatePaymentMethod.reset,

    // Delete
    deletePaymentMethod: deletePaymentMethod.deletePaymentMethod,
    deletePaymentMethodLoading: deletePaymentMethod.loading,
    deletePaymentMethodError: deletePaymentMethod.error,
    resetDeletePaymentMethod: deletePaymentMethod.reset,
  };
}
