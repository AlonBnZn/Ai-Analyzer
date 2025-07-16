"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHART_COLORS = exports.LOG_STATUSES = exports.SUPPORTED_COUNTRIES = exports.PROGRESS_METRICS = exports.DATE_FORMATS = exports.DEFAULT_PAGINATION = void 0;
exports.DEFAULT_PAGINATION = {
    page: 1,
    limit: 50,
    maxLimit: 1000,
};
exports.DATE_FORMATS = {
    ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
    DISPLAY: "MMM DD, YYYY HH:mm",
    DATE_ONLY: "YYYY-MM-DD",
};
exports.PROGRESS_METRICS = [
    "TOTAL_RECORDS_IN_FEED",
    "TOTAL_JOBS_IN_FEED",
    "TOTAL_JOBS_FAIL_INDEXED",
    "TOTAL_JOBS_SENT_TO_ENRICH",
    "TOTAL_JOBS_DONT_HAVE_METADATA",
    "TOTAL_JOBS_SENT_TO_INDEX",
];
exports.SUPPORTED_COUNTRIES = [
    "US",
    "CA",
    "GB",
    "AU",
    "DE",
    "FR",
];
exports.LOG_STATUSES = ["completed", "failed", "processing"];
exports.CHART_COLORS = {
    primary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    secondary: "#6B7280",
};
//# sourceMappingURL=constants.js.map