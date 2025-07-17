// Dark Theme LogsTable.tsx
import { useState } from "react";
import type { IndexingLog } from "@botson/shared";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

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

const LogsTable = ({ logs, pagination, onPageChange }: LogsTableProps) => {
  const [selectedLog, setSelectedLog] = useState<IndexingLog | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "failed":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "processing":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "failed":
        return <XCircleIcon className="h-4 w-4" />;
      case "processing":
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateSuccessRate = (log: IndexingLog) => {
    const total = log.progress.TOTAL_JOBS_SENT_TO_INDEX;
    const failed = log.progress.TOTAL_JOBS_FAIL_INDEXED;
    const success = total - failed;
    return total > 0 ? ((success / total) * 100).toFixed(1) : "0.0";
  };

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-700/50 mb-4">
          <EyeIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No logs found</h3>
        <p className="text-gray-400">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-700/50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Jobs Processed
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {logs.map((log, index) => {
              const successRate = calculateSuccessRate(log);
              return (
                <tr
                  key={log._id || index}
                  className="hover:bg-gray-700/30 transition-all duration-300 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white group-hover:text-gray-200 transition-colors duration-300">
                      {log.transactionSourceName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {log.country_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {getStatusIcon(log.status)}
                      <span className="capitalize">{log.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {log.progress.TOTAL_JOBS_SENT_TO_INDEX?.toLocaleString() ||
                        0}
                    </div>
                    <div className="text-xs text-gray-400">
                      {log.progress.TOTAL_JOBS_FAIL_INDEXED || 0} failed
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div
                          className={`text-sm font-medium ${
                            parseFloat(successRate) >= 90
                              ? "text-green-400"
                              : parseFloat(successRate) >= 70
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {successRate}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              parseFloat(successRate) >= 90
                                ? "bg-gradient-to-r from-green-500 to-green-400"
                                : parseFloat(successRate) >= 70
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                : "bg-gradient-to-r from-red-500 to-red-400"
                            }`}
                            style={{ width: `${successRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-300"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="inline-flex items-center px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                          pagination.page === page
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for detailed log view */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-semibold text-white">Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-700 rounded-xl transition-colors duration-300"
              >
                <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Client</label>
                  <p className="text-white font-medium">
                    {selectedLog.transactionSourceName}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Country</label>
                  <p className="text-white font-medium">
                    {selectedLog.country_code}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Status</label>
                  <span
                    className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedLog.status
                    )}`}
                  >
                    {getStatusIcon(selectedLog.status)}
                    <span className="capitalize">{selectedLog.status}</span>
                  </span>
                </div>
              </div>

              {/* Progress Metrics */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Progress Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedLog.progress).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50"
                    >
                      <label className="text-xs text-gray-400 uppercase tracking-wider">
                        {key.replace(/_/g, " ")}
                      </label>
                      <p className="text-lg font-semibold text-white mt-1">
                        {typeof value === "number"
                          ? value.toLocaleString()
                          : value.toString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </label>
                    <p className="text-white mt-1">
                      {formatDate(selectedLog.timestamp)}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">
                      Record Count
                    </label>
                    <p className="text-white mt-1">
                      {selectedLog.recordCount?.toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">
                      No Coordinates Count
                    </label>
                    <p className="text-white mt-1">
                      {selectedLog.noCoordinatesCount?.toLocaleString() ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">
                      Unique Ref Numbers
                    </label>
                    <p className="text-white mt-1">
                      {selectedLog.uniqueRefNumberCount?.toLocaleString() ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsTable;
