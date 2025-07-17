// src/services/api.ts
import axios, { type AxiosInstance, AxiosError } from "axios";
import type {
  IndexingLog,
  DashboardFilters,
  DashboardMetrics,
  APIResponse,
  TimeSeriesData,
  ClientPerformance,
} from "@botson/shared";
import type { HealthCheckResponse } from "../types/health";
import type {
  SendChatMessageRequest,
  SendChatMessageResponse,
} from "../types/chat";

// API Error type
export interface APIError {
  success: false;
  error: string;
  details?: string;
  status?: number;
}

// Status distribution interface
export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
      timeout: 10000, // 10 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor for debugging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (import.meta.env.DEV) {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
          );
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          console.log(
            `✅ API Response: ${response.status} ${response.config.url}`
          );
        }
        return response;
      },
      (error: AxiosError) => {
        const apiError: APIError = {
          success: false,
          error: error.message || "An error occurred",
          status: error.response?.status,
        };

        if (error.response?.data) {
          const responseData = error.response.data as any;
          apiError.error =
            responseData.error || responseData.message || apiError.error;
          apiError.details = responseData.details;
        }

        console.error("❌ API Error:", apiError);
        return Promise.reject(apiError);
      }
    );
  }

  // Helper method to build query parameters
  private buildQueryParams(filters: DashboardFilters): URLSearchParams {
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.client) params.append("client", filters.client);
    if (filters.country) params.append("country", filters.country);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    return params;
  }

  // Get indexing logs with filters (main dashboard data)
  async getIndexingLogs(
    filters: DashboardFilters = {}
  ): Promise<APIResponse<IndexingLog[]>> {
    const params = this.buildQueryParams(filters);
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
      "/health"
    );
    return response.data;
  }

  // Chat AI endpoint (type-safe)
  async sendChatMessage(
    request: SendChatMessageRequest
  ): Promise<SendChatMessageResponse> {
    const response = await this.axiosInstance.post<SendChatMessageResponse>(
      "/api/chat",
      request
    );
    return response.data;
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
