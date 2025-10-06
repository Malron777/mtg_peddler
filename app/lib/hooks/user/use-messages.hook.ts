"use client";

import {
  InsertMessage,
  Message,
  UpdateMessage,
} from "@/src/domain/tcg/message.model";
import { useCallback, useState } from "react";

// Hook for creating a message
export function useCreateMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMessage = useCallback(async (insertMessage: InsertMessage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(insertMessage),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create message");
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
    createMessage,
    reset,
  };
}

// Hook for getting a message
export function useGetMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const getMessage = useCallback(async (messageId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/${messageId}`);
      const result = await response.json();

      if (result.success && result.message) {
        setMessage(result.message);
        return result.message;
      } else {
        setError(result.error || "Failed to get message");
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
    setMessage(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    message,
    loading,
    error,
    getMessage,
    reset,
  };
}

// Hook for getting all messages
export function useGetAllMessages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);

  const getAllMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/messages");
      const result = await response.json();

      if (result.success && result.messages) {
        setMessages(result.messages);
        return result.messages;
      } else {
        setError(result.error || "Failed to get messages");
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
    setMessages(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    error,
    getAllMessages,
    reset,
  };
}

// Hook for getting all messages for a deal
export function useGetAllMessagesForDeal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);

  const getAllMessagesForDeal = useCallback(async (dealId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/deal/${dealId}`);
      const result = await response.json();

      if (result.success && result.messages) {
        setMessages(result.messages);
        return result.messages;
      } else {
        setError(result.error || "Failed to get messages for deal");
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
    setMessages(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    error,
    getAllMessagesForDeal,
    reset,
  };
}

// Hook for getting all messages for a user pair
export function useGetAllMessagesForUserPair() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);

  const getAllMessagesForUserPair = useCallback(
    async (userId1: string, userId2: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/messages/users/${userId1}/${userId2}`
        );
        const result = await response.json();

        if (result.success && result.messages) {
          setMessages(result.messages);
          return result.messages;
        } else {
          setError(result.error || "Failed to get messages for user pair");
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
    setMessages(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    messages,
    loading,
    error,
    getAllMessagesForUserPair,
    reset,
  };
}

// Hook for updating a message
export function useUpdateMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMessage = useCallback(async (updateData: UpdateMessage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/${updateData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update message");
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
    updateMessage,
    reset,
  };
}

// Hook for deleting a message
export function useDeleteMessage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMessage = useCallback(async (messageId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete message");
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
    deleteMessage,
    reset,
  };
}

// Combined hook that provides all message operations
export function useMessages() {
  const createMessage = useCreateMessage();
  const getMessage = useGetMessage();
  const getAllMessages = useGetAllMessages();
  const getAllMessagesForDeal = useGetAllMessagesForDeal();
  const getAllMessagesForUserPair = useGetAllMessagesForUserPair();
  const updateMessage = useUpdateMessage();
  const deleteMessage = useDeleteMessage();

  return {
    // Create
    createMessage: createMessage.createMessage,
    createMessageLoading: createMessage.loading,
    createMessageError: createMessage.error,
    resetCreateMessage: createMessage.reset,

    // Get by ID
    getMessage: getMessage.getMessage,
    getMessageLoading: getMessage.loading,
    getMessageError: getMessage.error,
    getMessageData: getMessage.message,
    resetGetMessage: getMessage.reset,

    // Get all
    getAllMessages: getAllMessages.getAllMessages,
    getAllMessagesLoading: getAllMessages.loading,
    getAllMessagesError: getAllMessages.error,
    getAllMessagesData: getAllMessages.messages,
    resetGetAllMessages: getAllMessages.reset,

    // Get all for deal
    getAllMessagesForDeal: getAllMessagesForDeal.getAllMessagesForDeal,
    getAllMessagesForDealLoading: getAllMessagesForDeal.loading,
    getAllMessagesForDealError: getAllMessagesForDeal.error,
    getAllMessagesForDealData: getAllMessagesForDeal.messages,
    resetGetAllMessagesForDeal: getAllMessagesForDeal.reset,

    // Get all for user pair
    getAllMessagesForUserPair:
      getAllMessagesForUserPair.getAllMessagesForUserPair,
    getAllMessagesForUserPairLoading: getAllMessagesForUserPair.loading,
    getAllMessagesForUserPairError: getAllMessagesForUserPair.error,
    getAllMessagesForUserPairData: getAllMessagesForUserPair.messages,
    resetGetAllMessagesForUserPair: getAllMessagesForUserPair.reset,

    // Update
    updateMessage: updateMessage.updateMessage,
    updateMessageLoading: updateMessage.loading,
    updateMessageError: updateMessage.error,
    resetUpdateMessage: updateMessage.reset,

    // Delete
    deleteMessage: deleteMessage.deleteMessage,
    deleteMessageLoading: deleteMessage.loading,
    deleteMessageError: deleteMessage.error,
    resetDeleteMessage: deleteMessage.reset,
  };
}
