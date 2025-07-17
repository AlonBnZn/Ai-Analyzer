// Dark Theme Dashboard.tsx - Fixed TypeScript errors and preserved all API functionality
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
import {
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
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

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle page changes for logs table
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMetrics(), refetchLogs()]);
    } catch (error) {
      handleError(error);
    }
    setRefreshing(false);
  };

  // Handle critical errors (network/API issues)
  const hasCriticalError =
    (metricsError && isNetworkError(metricsError)) ||
    (logsError && isNetworkError(logsError));

  if (hasCriticalError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 mb-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Connection Error
            </h3>
            <p className="text-gray-300 mb-6">
              Unable to connect to the analytics service. Please check your
              connection and try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? "Retrying..." : "Try Again"}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-300"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle filter warnings (non-critical)
  const filterWarnings = [];
  if (clientsError) filterWarnings.push("clients");
  if (countriesError) filterWarnings.push("countries");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Job Indexing Analytics Dashboard
                </h1>
                <p className="text-gray-400 text-sm">
                  Monitor and analyze job indexing performance across all
                  clients and countries
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-6 text-sm text-purple-200">
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

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 text-white disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Filter warnings */}
        {filterWarnings.length > 0 && (
          <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-300 text-sm">
                Unable to load filter options for: {filterWarnings.join(", ")}.
                Some filters may not be available.
              </span>
            </div>
          </div>
        )}

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-500 hover:bg-gray-800/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300">
                  <FunnelIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">
                    Active Filters
                  </p>
                  <p className="text-2xl font-semibold text-white">
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
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-500 hover:bg-gray-800/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <ChartBarIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">
                    Total Jobs Indexed
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {metricsLoading ? (
                      <span className="animate-pulse">---</span>
                    ) : (
                      metrics?.totalJobsIndexed?.toLocaleString() || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-500 hover:bg-gray-800/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all duration-300">
                  <ChartBarIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">
                    Avg Success Rate
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {metricsLoading ? (
                      <span className="animate-pulse">--.-</span>
                    ) : (
                      `${metrics?.successRate?.toFixed(1) || 0}%`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-500 hover:bg-gray-800/50 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center">
                <div className="rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-3 group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all duration-300">
                  <UserGroupIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">
                    Active Clients
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {metricsLoading ? (
                      <span className="animate-pulse">--</span>
                    ) : (
                      metrics?.activeClients || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section - Dark Theme Update */}
        <div className="rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
          <FilterComponent
            filters={filters}
            clients={clients}
            countries={countries}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Main Metrics Cards - Dark Theme */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Key Performance Metrics
            </h2>
            <div className="text-sm text-gray-400">Updated in real-time</div>
          </div>

          {metricsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6">
              <MetricsCards metrics={metrics} />
            </div>
          )}
        </div>

        {/* Charts and Analytics Section - Dark Theme */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Analytics & Trends
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <ChartBarIcon className="h-4 w-4" />
              <span>Interactive charts</span>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6">
            <ChartsSection filters={filters} />
          </div>
        </div>

        {/* Advanced Analytics Grid - Dark Theme */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Performance Insights */}
          <div className="rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/50 transition-all duration-500">
            <h3 className="text-lg font-semibold text-white mb-4">
              Performance Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30">
                <span className="text-sm text-gray-300">
                  Peak Processing Hour
                </span>
                <span className="font-medium text-white">14:00-15:00</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30">
                <span className="text-sm text-gray-300">
                  Best Performing Client
                </span>
                <span className="font-medium text-white">Deal1</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30">
                <span className="text-sm text-gray-300">Lowest Error Rate</span>
                <span className="font-medium text-white">0.2%</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/50 transition-all duration-500">
            <h3 className="text-lg font-semibold text-white mb-4">
              System Health
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Success Rate</span>
                  <span className="text-white">98.5%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: "98.5%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Accuracy</span>
                  <span className="text-white">96.2%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: "96.2%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/50 transition-all duration-500">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-700/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white text-sm">Job batch completed</p>
                  <p className="text-gray-400 text-xs">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-700/30">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white text-sm">New client connected</p>
                  <p className="text-gray-400 text-xs">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-700/30">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white text-sm">System maintenance</p>
                  <p className="text-gray-400 text-xs">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Logs Table - Dark Theme */}
        <div className="rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/50">
          <div className="border-b border-gray-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Indexing Logs Detail
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <TableCellsIcon className="h-4 w-4" />
                <span>
                  Showing{" "}
                  {((filters.page || 1) - 1) * (filters.limit || 50) + 1} to{" "}
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
      </main>
    </div>
  );
};

export default Dashboard;
