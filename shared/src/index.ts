// Updated Shared Index - shared/src/index.ts

// Export all types
export * from "./types";
export * from "./utils/constants";

// Named exports for better organization
export type {
  IndexingLog,
  DashboardFilters,
  DashboardMetrics,
  ClientPerformance,
  TimeSeriesData,
  StatusDistribution,
  HealthCheckResponse,
  ChatMessage,
  ChatResponse,
  SendChatMessageRequest,
  SendChatMessageResponse,
  APIResponse,
} from "./types";

export {
  DEFAULT_PAGINATION,
  DATE_FORMATS,
  PROGRESS_METRICS,
  SUPPORTED_COUNTRIES,
  LOG_STATUSES,
  CHART_COLORS,
} from "./utils/constants";
