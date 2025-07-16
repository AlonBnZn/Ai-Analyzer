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

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  responseType: "text" | "table" | "chart";
  data?: any;
}

export interface ChatResponse {
  message: string;
  type: "text" | "table" | "chart" | "error";
  data?: any;
  query?: string;
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
