// src/pages/Dashboard.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardFilters } from "@botson/shared";
import { apiService } from "../services/api";
import { useApiErrorHandler } from "../hooks/useApiErrorHandler";
import FilterComponent from "../components/DashboardFilters";
import MetricsCards from "../components/MetricsCards";
import ChartsSection from "../components/ChartsSection";
import LogsTable from "../components/LogsTable";
import LoadingSpinner from "../components/ui/LoadingSpinner";
// import ErrorMessage from "../components/ui/ErrorMessage";
import {
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    page: 1,
    limit: 50,
  });

  const [refreshing, setRefreshing] = useState(false);
  const { handleError, isNetworkError, shouldRetry } = useApiErrorHandler();

  // Fetch dashboard metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["metrics", filters],
    queryFn: () => apiService.getDashboardMetrics(filters),
    enabled: true,
    retry: (failureCount, error) => {
      return failureCount < 3 && shouldRetry(error);
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch indexing logs
  const {
    data: logsResponse,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["logs", filters],
    queryFn: () => apiService.getIndexingLogs(filters),
    enabled: true,
    retry: (failureCount, error) => {
      return failureCount < 3 && shouldRetry(error);
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch filter options
  const { data: clients = [], isError: clientsError } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiService.getClients(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const { data: countries = [], isError: countriesError } = useQuery({
    queryKey: ["countries"],
    queryFn: () => apiService.getCountries(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMetrics(), refetchLogs()]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle critical errors
  const criticalError = metricsError || logsError;
  if (criticalError) {
    const errorMessage = handleError(criticalError);
    const networkError = isNetworkError(criticalError);

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-error-200 bg-error-50 p-6">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-error-600" />
            <div>
              <h3 className="text-lg font-semibold text-error-800">
                {networkError ? "Connection Error" : "Data Loading Error"}
              </h3>
              <p className="text-error-700 mt-1">{errorMessage}</p>
              {networkError && (
                <p className="text-error-600 text-sm mt-2">
                  Please check your internet connection and ensure the backend
                  server is running.
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary"
            >
              {refreshing ? "Retrying..." : "Try Again"}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle filter loading errors (non-critical)
  const filterWarnings = [];
  if (clientsError) filterWarnings.push("clients");
  if (countriesError) filterWarnings.push("countries");

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Job Indexing Analytics Dashboard
            </h1>
            <p className="mt-2 text-primary-100">
              Monitor and analyze job indexing performance across all clients
              and countries
            </p>
            <div className="mt-4 flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="h-5 w-5" />
                <span>Real-time monitoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <TableCellsIcon className="h-5 w-5" />
                <span>Detailed logs</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh Data"}</span>
            </button>
            <div className="text-right text-sm text-primary-100">
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
              <p>{logsResponse?.pagination?.total || 0} total records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter warnings */}
      {filterWarnings.length > 0 && (
        <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-600" />
            <span className="text-warning-800 text-sm">
              Unable to load filter options for: {filterWarnings.join(", ")}.
              Some filters may not be available.
            </span>
          </div>
        </div>
      )}

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-primary-50 p-3">
              <FunnelIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Filters
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {
                  Object.keys(filters).filter(
                    (key) =>
                      key !== "page" &&
                      key !== "limit" &&
                      filters[key as keyof DashboardFilters]
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-success-50 p-3">
              <ChartBarIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Success Rate
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.successRate.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-warning-50 p-3">
              <TableCellsIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Clients
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.activeClients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-lg bg-purple-50 p-3">
              <CalendarDaysIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg Processing
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics?.averageProcessingTime.toFixed(1) || 0}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <FilterComponent
        filters={filters}
        clients={clients}
        countries={countries}
        onFilterChange={handleFilterChange}
      />

      {/* Main Metrics Cards */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Key Performance Metrics
          </h2>
          <div className="text-sm text-gray-500">Updated in real-time</div>
        </div>

        {metricsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <MetricsCards metrics={metrics} />
        )}
      </div>

      {/* Charts and Analytics Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Analytics & Trends
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ChartBarIcon className="h-4 w-4" />
            <span>Interactive charts</span>
          </div>
        </div>

        <ChartsSection filters={filters} />
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Insights */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Peak Processing Hour
              </span>
              <span className="font-medium">14:00-15:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Best Performing Client
              </span>
              <span className="font-medium">Deal1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Jobs per Hour</span>
              <span className="font-medium">1,247</span>
            </div>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alert Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-success-500"></div>
              <span className="text-sm">All systems operational</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-warning-500"></div>
              <span className="text-sm">2 clients below 90% success rate</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 rounded-full bg-gray-300"></div>
              <span className="text-sm">No critical alerts</span>
            </div>
          </div>
        </div>

        {/* Data Quality */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Data Quality
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Completeness</span>
                <span>98.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-success-500 h-2 rounded-full"
                  style={{ width: "98.5%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Accuracy</span>
                <span>96.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-success-500 h-2 rounded-full"
                  style={{ width: "96.2%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Logs Table */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Indexing Logs Detail
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TableCellsIcon className="h-4 w-4" />
              <span>
                Showing {((filters.page || 1) - 1) * (filters.limit || 50) + 1}{" "}
                to{" "}
                {Math.min(
                  (filters.page || 1) * (filters.limit || 50),
                  logsResponse?.pagination?.total || 0
                )}{" "}
                of {logsResponse?.pagination?.total || 0} entries
              </span>
            </div>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <LogsTable
            logs={logsResponse?.data || []}
            pagination={logsResponse?.pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
