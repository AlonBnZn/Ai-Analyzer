// Fixed API Service - frontend/src/services/api.ts
import axios, { type AxiosInstance } from "axios";
import type {
  DashboardFilters,
  IndexingLog,
  DashboardMetrics,
  TimeSeriesData,
  ClientPerformance,
  APIResponse,
} from "@botson/shared";
import type { HealthCheckResponse } from "../types/health";
import type {
  SendChatMessageRequest,
  SendChatMessageResponse,
} from "../types/chat";

// Status distribution interface (not in shared types)
export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
      timeout: 30000, // 30 seconds for AI responses
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(
          `Making ${config.method?.toUpperCase()} request to ${config.url}`
        );
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Helper method to build query parameters - Fixed to match DashboardFilters structure
  private buildQueryParams(filters: DashboardFilters): URLSearchParams {
    const params = new URLSearchParams();

    // Fixed: Use 'client' instead of 'clients' (singular, as string not array)
    if (filters.client) {
      params.append("client", filters.client);
    }

    // Fixed: Use 'country' instead of 'countries' (singular, as string not array)
    if (filters.country) {
      params.append("country", filters.country);
    }

    // Fixed: status is a string, not array
    if (filters.status) {
      params.append("status", filters.status);
    }

    if (filters.startDate) {
      params.append("startDate", filters.startDate);
    }

    if (filters.endDate) {
      params.append("endDate", filters.endDate);
    }

    return params;
  }

  // Get paginated logs with filters
  async getLogs(
    page: number = 1,
    limit: number = 100,
    filters: DashboardFilters = {}
  ): Promise<APIResponse<IndexingLog[]>> {
    const params = this.buildQueryParams(filters);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const endpoint = `/api/dashboard${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await this.axiosInstance.get<APIResponse<IndexingLog[]>>(
      endpoint
    );
    return response.data;
  }

  // Get dashboard metrics
  async getDashboardMetrics(
    filters: DashboardFilters = {}
  ): Promise<DashboardMetrics> {
    const params = this.buildQueryParams(filters);
    const endpoint = `/api/dashboard/aggregated-metrics${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await this.axiosInstance.get<DashboardMetrics>(endpoint);
    return response.data;
  }

  // Get time series data for charts
  async getTimeSeriesData(
    filters: DashboardFilters = {}
  ): Promise<TimeSeriesData[]> {
    const params = this.buildQueryParams(filters);
    const endpoint = `/api/dashboard/time-series${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await this.axiosInstance.get<
      APIResponse<TimeSeriesData[]>
    >(endpoint);
    return response.data.data || [];
  }

  // Get client performance data
  async getClientPerformance(
    filters: DashboardFilters = {}
  ): Promise<ClientPerformance[]> {
    const params = this.buildQueryParams(filters);
    const endpoint = `/api/dashboard/clients${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await this.axiosInstance.get<
      APIResponse<ClientPerformance[]>
    >(endpoint);
    return response.data.data || [];
  }

  // Get status distribution for pie chart
  async getStatusDistribution(
    filters: DashboardFilters = {}
  ): Promise<StatusDistribution[]> {
    const params = this.buildQueryParams(filters);
    const endpoint = `/api/dashboard/status${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const response = await this.axiosInstance.get<
      APIResponse<StatusDistribution[]>
    >(endpoint);
    return response.data.data || [];
  }

  // Get unique clients for filter dropdown
  async getClients(): Promise<string[]> {
    const response = await this.axiosInstance.get<APIResponse<string[]>>(
      "/api/clients"
    );
    return response.data.data || [];
  }

  // Get unique countries for filter dropdown
  async getCountries(): Promise<string[]> {
    const response = await this.axiosInstance.get<APIResponse<string[]>>(
      "/api/countries"
    );
    return response.data.data || [];
  }

  // Health check endpoint
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await this.axiosInstance.get<HealthCheckResponse>(
      "/api/health"
    );
    return response.data;
  }

  // AI Assistant endpoint - Updated to use the correct route and request format
  async sendAssistantMessage(
    request: SendChatMessageRequest
  ): Promise<SendChatMessageResponse> {
    try {
      // Transform the request to match backend's expected format
      const backendRequest = {
        question: request.message, // Backend expects 'question', not 'message'
      };

      console.log("Sending to backend:", backendRequest);

      const response = await this.axiosInstance.post(
        "/api/assistant", // Updated to match your backend route
        backendRequest
      );

      console.log("Backend response:", response.data);

      // Transform backend response to match frontend expectations
      const backendData = response.data;

      // Handle different response types from backend
      if (backendData.type === "success") {
        return {
          success: true,
          data: {
            message: backendData.message,
            type: backendData.responseType || "text",
            timestamp: new Date().toISOString(),
            data: backendData.data,
            query: backendData.query,
          },
        };
      } else if (backendData.type === "clarification") {
        return {
          success: true,
          data: {
            message: `${backendData.message}\n\nSuggestions:\n${
              backendData.suggestions?.join("\n") || ""
            }`,
            type: "text" as const,
            timestamp: new Date().toISOString(),
          },
        };
      } else if (backendData.type === "unsupported") {
        return {
          success: true,
          data: {
            message: `${backendData.message}\n\n${
              backendData.suggestions?.join("\n") || ""
            }`,
            type: "text" as const,
            timestamp: new Date().toISOString(),
          },
        };
      } else if (backendData.type === "no_data") {
        return {
          success: true,
          data: {
            message: `${backendData.message}\n\nHint: ${
              backendData.hint || ""
            }`,
            type: "text" as const,
            timestamp: new Date().toISOString(),
          },
        };
      } else {
        // Fallback for unknown response types
        return {
          success: true,
          data: {
            message: JSON.stringify(backendData, null, 2),
            type: "text" as const,
            timestamp: new Date().toISOString(),
          },
        };
      }
    } catch (error: unknown) {
      console.error("Error sending assistant message:", error);

      // Handle axios errors specifically
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
          message: string;
        };
        console.error("Axios error details:", axiosError.response?.data);

        return {
          success: false,
          error: `Backend error: ${
            axiosError.response?.data?.message || axiosError.message
          }`,
          data: {
            message:
              "I'm sorry, I encountered an error processing your request. Please try again.",
            type: "error" as const,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Return a structured error response
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send message",
        data: {
          message:
            "I'm sorry, I'm having trouble processing your request right now. Please try again.",
          type: "error" as const,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Legacy method for backward compatibility (can be removed later)
  async sendChatMessage(
    request: SendChatMessageRequest
  ): Promise<SendChatMessageResponse> {
    return this.sendAssistantMessage(request);
  }

  // Test assistant connection
  async testAssistantConnection(): Promise<boolean> {
    try {
      // Use a proper database query that Gemini will understand and process
      const testRequest = {
        question: "What is the total number of jobs in the collection?", // Valid question for testing
      };

      const response = await this.axiosInstance.post(
        "/api/assistant",
        testRequest
      );

      // Accept any valid response type from backend (success, clarification, no_data, etc.)
      // We just want to confirm the backend can process requests
      return (
        response.status === 200 &&
        response.data &&
        (response.data.type === "success" ||
          response.data.type === "clarification" ||
          response.data.type === "no_data")
      );
    } catch (error) {
      console.error("Assistant connection test failed:", error);
      return false;
    }
  }

  // Utility method to test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error("API connection test failed:", error);
      return false;
    }
  }

  // Get API base URL (useful for debugging)
  getBaseURL(): string {
    return this.axiosInstance.defaults.baseURL || "";
  }

  // Update request timeout
  setTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }
}

// Create singleton instance
export const apiService = new ApiService();
