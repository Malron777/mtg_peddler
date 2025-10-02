"use client";

import {
  InsertNotification,
  Notification,
  UpdateNotification,
} from "@/src/domain/tcg/notification.model";
import { useCallback, useState } from "react";

// Hook for creating a notification
export function useCreateNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNotification = useCallback(
    async (insertNotification: InsertNotification) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(insertNotification),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create notification");
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
    createNotification,
    reset,
  };
}

// Hook for getting a notification
export function useGetNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const getNotification = useCallback(async (notificationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/${notificationId}`);
      const result = await response.json();

      if (result.success && result.notification) {
        setNotification(result.notification);
        return result.notification;
      } else {
        setError(result.error || "Failed to get notification");
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
    setNotification(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    notification,
    loading,
    error,
    getNotification,
    reset,
  };
}

// Hook for getting all notifications
export function useGetAllNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null
  );

  const getAllNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications");
      const result = await response.json();

      if (result.success && result.notifications) {
        setNotifications(result.notifications);
        return result.notifications;
      } else {
        setError(result.error || "Failed to get notifications");
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
    setNotifications(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    notifications,
    loading,
    error,
    getAllNotifications,
    reset,
  };
}

// Hook for getting all unread notifications for a user
export function useGetAllUnreadNotificationsForUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null
  );

  const getAllUnreadNotificationsForUser = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/notifications/user/${userId}/unread`
        );
        const result = await response.json();

        if (result.success && result.notifications) {
          setNotifications(result.notifications);
          return result.notifications;
        } else {
          setError(
            result.error || "Failed to get unread notifications for user"
          );
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
    setNotifications(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    notifications,
    loading,
    error,
    getAllUnreadNotificationsForUser,
    reset,
  };
}

// Hook for updating a notification
export function useUpdateNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNotification = useCallback(
    async (updateData: UpdateNotification) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notifications/${updateData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update notification");
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
    updateNotification,
    reset,
  };
}

// Hook for deleting a notification
export function useDeleteNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete notification");
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
    deleteNotification,
    reset,
  };
}

// Hook for marking a notification as read
export function useMarkNotificationAsRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/mark-read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to mark notification as read"
        );
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
    markNotificationAsRead,
    reset,
  };
}

// Combined hook that provides all notification operations
export function useNotifications() {
  const createNotification = useCreateNotification();
  const getNotification = useGetNotification();
  const getAllNotifications = useGetAllNotifications();
  const getAllUnreadNotificationsForUser =
    useGetAllUnreadNotificationsForUser();
  const updateNotification = useUpdateNotification();
  const deleteNotification = useDeleteNotification();
  const markNotificationAsRead = useMarkNotificationAsRead();

  return {
    // Create
    createNotification: createNotification.createNotification,
    createNotificationLoading: createNotification.loading,
    createNotificationError: createNotification.error,
    resetCreateNotification: createNotification.reset,

    // Get by ID
    getNotification: getNotification.getNotification,
    getNotificationLoading: getNotification.loading,
    getNotificationError: getNotification.error,
    getNotificationData: getNotification.notification,
    resetGetNotification: getNotification.reset,

    // Get all
    getAllNotifications: getAllNotifications.getAllNotifications,
    getAllNotificationsLoading: getAllNotifications.loading,
    getAllNotificationsError: getAllNotifications.error,
    getAllNotificationsData: getAllNotifications.notifications,
    resetGetAllNotifications: getAllNotifications.reset,

    // Get all unread for user
    getAllUnreadNotificationsForUser:
      getAllUnreadNotificationsForUser.getAllUnreadNotificationsForUser,
    getAllUnreadNotificationsForUserLoading:
      getAllUnreadNotificationsForUser.loading,
    getAllUnreadNotificationsForUserError:
      getAllUnreadNotificationsForUser.error,
    getAllUnreadNotificationsForUserData:
      getAllUnreadNotificationsForUser.notifications,
    resetGetAllUnreadNotificationsForUser:
      getAllUnreadNotificationsForUser.reset,

    // Update
    updateNotification: updateNotification.updateNotification,
    updateNotificationLoading: updateNotification.loading,
    updateNotificationError: updateNotification.error,
    resetUpdateNotification: updateNotification.reset,

    // Delete
    deleteNotification: deleteNotification.deleteNotification,
    deleteNotificationLoading: deleteNotification.loading,
    deleteNotificationError: deleteNotification.error,
    resetDeleteNotification: deleteNotification.reset,

    // Mark as read
    markNotificationAsRead: markNotificationAsRead.markNotificationAsRead,
    markNotificationAsReadLoading: markNotificationAsRead.loading,
    markNotificationAsReadError: markNotificationAsRead.error,
    resetMarkNotificationAsRead: markNotificationAsRead.reset,
  };
}
