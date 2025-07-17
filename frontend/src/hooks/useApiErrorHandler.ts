// src/hooks/useApiErrorHandler.ts
import { useCallback } from "react";
import type { APIError } from "../services/api";

export const useApiErrorHandler = () => {
  const handleError = useCallback((error: unknown): string => {
    if (error && typeof error === "object" && "error" in error) {
      const apiError = error as APIError;

      // Handle different HTTP status codes
      switch (apiError.status) {
        case 400:
          return "Invalid request. Please check your input and try again.";
        case 401:
          return "Authentication required. Please log in again.";
        case 403:
          return "Access denied. You don't have permission to perform this action.";
        case 404:
          return "The requested resource was not found.";
        case 429:
          return "Too many requests. Please wait a moment before trying again.";
        case 500:
          return "Server error. Please try again later.";
        case 503:
          return "Service temporarily unavailable. Please try again later.";
        default:
          return apiError.error || "An unexpected error occurred";
      }
    }

    // Handle network errors
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return "Request timed out. Please check your connection and try again.";
      }
      if (error.message.includes("Network Error")) {
        return "Network error. Please check your connection.";
      }
      return error.message;
    }

    return "An unexpected error occurred";
  }, []);

  const isNetworkError = useCallback((error: unknown): boolean => {
    if (error && typeof error === "object" && "error" in error) {
      const apiError = error as APIError;
      return !apiError.status || apiError.status >= 500;
    }
    return false;
  }, []);

  const shouldRetry = useCallback((error: unknown): boolean => {
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as APIError;
      // Retry on 5xx errors and network errors
      return (
        !apiError.status || apiError.status >= 500 || apiError.status === 429
      );
    }
    return false;
  }, []);

  return {
    handleError,
    isNetworkError,
    shouldRetry,
  };
};
