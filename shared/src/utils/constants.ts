export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50,
  maxLimit: 1000,
};

export const DATE_FORMATS = {
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
  DISPLAY: "MMM DD, YYYY HH:mm",
  DATE_ONLY: "YYYY-MM-DD",
};

export const PROGRESS_METRICS = [
  "TOTAL_RECORDS_IN_FEED",
  "TOTAL_JOBS_IN_FEED",
  "TOTAL_JOBS_FAIL_INDEXED",
  "TOTAL_JOBS_SENT_TO_ENRICH",
  "TOTAL_JOBS_DONT_HAVE_METADATA",
  "TOTAL_JOBS_SENT_TO_INDEX",
] as const;

export const SUPPORTED_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "AU",
  "DE",
  "FR",
] as const;

export const LOG_STATUSES = ["completed", "failed", "processing"] as const;

export const CHART_COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  secondary: "#6B7280",
};
