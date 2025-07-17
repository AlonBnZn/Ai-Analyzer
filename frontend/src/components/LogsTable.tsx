// src/components/LogsTable.tsx
import type { IndexingLog } from "@botson/shared";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { format } from "date-fns";

interface LogsTableProps {
  logs: IndexingLog[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

interface LogDetailsModalProps {
  log: IndexingLog;
  isOpen: boolean;
  onClose: () => void;
}

const LogDetailsModal = ({ log, isOpen, onClose }: LogDetailsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 sm:align-middle">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Log Details - {log.transactionSourceName}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium text-gray-900">
                Basic Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono">{log._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span>{log.transactionSourceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span>{log.country_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span>{log.currency_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === "completed"
                        ? "bg-success-100 text-success-800"
                        : log.status === "failed"
                        ? "bg-error-100 text-error-800"
                        : "bg-warning-100 text-warning-800"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span>{format(new Date(log.timestamp), "PPpp")}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium text-gray-900">
                Processing Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Records:</span>
                  <span>
                    {log.progress.TOTAL_RECORDS_IN_FEED.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs in Feed:</span>
                  <span>
                    {log.progress.TOTAL_JOBS_IN_FEED.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Indexed:</span>
                  <span className="text-success-600 font-medium">
                    {log.progress.TOTAL_JOBS_SENT_TO_INDEX.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Failed:</span>
                  <span className="text-error-600 font-medium">
                    {log.progress.TOTAL_JOBS_FAIL_INDEXED.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sent to Enrich:</span>
                  <span>
                    {log.progress.TOTAL_JOBS_SENT_TO_ENRICH.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No Metadata:</span>
                  <span>
                    {log.progress.TOTAL_JOBS_DONT_HAVE_METADATA.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Switch Index:</span>
                  <span>{log.progress.SWITCH_INDEX ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-3 font-medium text-gray-900">Additional Data</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center rounded-lg bg-gray-50 p-3">
                <div className="text-lg font-semibold">
                  {log.recordCount.toLocaleString()}
                </div>
                <div className="text-gray-600">Record Count</div>
              </div>
              <div className="text-center rounded-lg bg-gray-50 p-3">
                <div className="text-lg font-semibold">
                  {log.uniqueRefNumberCount.toLocaleString()}
                </div>
                <div className="text-gray-600">Unique Ref Numbers</div>
              </div>
              <div className="text-center rounded-lg bg-gray-50 p-3">
                <div className="text-lg font-semibold">
                  {log.noCoordinatesCount.toLocaleString()}
                </div>
                <div className="text-gray-600">No Coordinates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogsTable = ({ logs, pagination, onPageChange }: LogsTableProps) => {
  const [selectedLog, setSelectedLog] = useState<IndexingLog | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case "failed":
        return <XCircleIcon className="h-5 w-5 text-error-500" />;
      case "processing":
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-success-100 text-success-800`;
      case "failed":
        return `${baseClasses} bg-error-100 text-error-800`;
      case "processing":
        return `${baseClasses} bg-warning-100 text-warning-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const calculateSuccessRate = (log: IndexingLog) => {
    const total = log.progress.TOTAL_JOBS_IN_FEED;
    const successful = log.progress.TOTAL_JOBS_SENT_TO_INDEX;
    return total > 0 ? ((successful / total) * 100).toFixed(1) : "0.0";
  };

  return (
    <>
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Client & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Jobs Processed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.map((log, index) => (
                <tr
                  key={log._id}
                  className={`hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-3">{getStatusIcon(log.status)}</div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.transactionSourceName}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className={getStatusBadge(log.status)}>
                            {log.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.country_code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.currency_code}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.progress.TOTAL_JOBS_SENT_TO_INDEX.toLocaleString()} /{" "}
                      {log.progress.TOTAL_JOBS_IN_FEED.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.progress.TOTAL_JOBS_FAIL_INDEXED.toLocaleString()}{" "}
                      failed
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {calculateSuccessRate(log)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(calculateSuccessRate(log)) >= 90
                            ? "bg-success-500"
                            : parseFloat(calculateSuccessRate(log)) >= 70
                            ? "bg-warning-500"
                            : "bg-error-500"
                        }`}
                        style={{ width: `${calculateSuccessRate(log)}%` }}
                      ></div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = Math.max(1, pagination.page - 2) + i;
                    if (pageNum > pagination.totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                          pageNum === pagination.page
                            ? "bg-primary-600 text-white"
                            : "border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}

                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <LogDetailsModal
        log={selectedLog!}
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
};

export default LogsTable;
