// Updated Shared Types - shared/src/types/index.ts
export interface IndexingLog {
  _id: string;
  country_code: string;
  currency_code: string;
  progress: {
    SWITCH_INDEX: boolean;
    TOTAL_RECORDS_IN_FEED: number;
    TOTAL_JOBS_IN_FEED: number;
    TOTAL_JOBS_FAIL_INDEXED: number;
    TOTAL_JOBS_SENT_TO_ENRICH: number;
    TOTAL_JOBS_DONT_HAVE_METADATA: number;
    TOTAL_JOBS_DONT_HAVE_METADATA_V2?: number;
    TOTAL_JOBS_SENT_TO_INDEX: number;
  };
  status: "completed" | "failed" | "processing";
  timestamp: string;
  transactionSourceName: string;
  noCoordinatesCount: number;
  recordCount: number;
  uniqueRefNumberCount: number;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  client?: string;
  country?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface DashboardMetrics {
  totalLogs: number;
  totalJobsIndexed: number;
  totalJobsFailed: number;
  successRate: number;
  averageProcessingTime: number;
  activeClients: number;
}

export interface ClientPerformance {
  client: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  successRate: number;
  averageJobsPerHour: number;
}

export interface TimeSeriesData {
  timestamp: string;
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  client?: string;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface HealthCheckResponse {
  status: "OK" | "ERROR" | "healthy" | "unhealthy";
  timestamp: string;
  uptime?: number;
  version?: string;
  environment?: string;
  service?: string;
  checks?: {
    database?: string;
    repository?: string;
    service?: string;
  };
}

// Chat/Assistant Types
export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  responseType: "text" | "table" | "chart";
  data?: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  type: "text" | "table" | "chart" | "error";
  data?: Record<string, unknown>;
  query?: string;
  timestamp: string;
  metadata?: {
    queryType?: string;
    dataPoints?: number;
    executionTime?: number;
    chartType?: "line" | "bar" | "pie";
  };
}

export interface SendChatMessageRequest {
  message: string;
  sessionId?: string;
  conversationId?: string;
}

export interface SendChatMessageResponse {
  success: boolean;
  response?: string;
  type?: "text" | "table" | "chart" | "error";
  data?: ChatResponse;
  error?: string;
  conversationId?: string;
  metadata?: {
    queryType?: string;
    dataPoints?: number;
    executionTime?: number;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
