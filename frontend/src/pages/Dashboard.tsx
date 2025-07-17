// Fixed Dashboard Component - frontend/src/pages/Dashboard.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardFilters } from "@botson/shared";
import { apiService } from "../services/api";
import FilterComponent from "../components/DashboardFilters";
import MetricsCards from "../components/MetricsCards";
import ChartsSection from "../components/ChartsSection";
import LogsTable from "../components/LogsTable";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  ChartBarIcon,
  ArrowPathIcon,
  CircleStackIcon, // Using CircleStackIcon instead of DatabaseIcon
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    page: 1,
    limit: 50,
  });

  const [refreshing, setRefreshing] = useState(false);

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
    retry: 2,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch indexing logs
  const {
    data: logsResponse,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["logs", filters],
    queryFn: () =>
      apiService.getLogs(filters.page || 1, filters.limit || 50, filters),
    enabled: true,
    retry: 2,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch filter options
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiService.getClients(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const { data: countries = [] } = useQuery({
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

  // Handle page changes
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMetrics(), refetchLogs()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Check if database is empty
  const isDatabaseEmpty =
    !metricsLoading &&
    !metricsError &&
    (!metrics || metrics.totalLogs === 0) &&
    (!logsResponse || !logsResponse.data || logsResponse.data.length === 0);

  // Loading state
  if (metricsLoading && logsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  // Database empty state
  if (isDatabaseEmpty) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <ChartBarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Job Indexing Analytics
              </h1>
              <p className="text-gray-400">
                Real-time insights into job processing performance
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-gray-800/50 p-6">
                <CircleStackIcon className="h-16 w-16 text-gray-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              No Data Available
            </h2>

            <p className="text-gray-400 mb-6">
              The database appears to be empty. To get started, you need to
              import job indexing data.
            </p>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-blue-300 font-semibold mb-2">Quick Setup:</h3>
              <div className="text-sm text-blue-200 space-y-1 text-left">
                <p>1. Open your backend terminal</p>
                <p>
                  2. Run:{" "}
                  <code className="bg-blue-800/30 px-1 rounded">
                    npm run import-data
                  </code>
                </p>
                <p>3. Wait for data import to complete</p>
                <p>4. Refresh this page</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300"
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Checking..." : "Check Again"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
            <ChartBarIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Job Indexing Analytics
            </h1>
            <p className="text-gray-400">
              Real-time insights into job processing performance
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-300 disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0">
        <FilterComponent
          filters={filters}
          onFilterChange={handleFilterChange}
          clients={clients}
          countries={countries}
        />
      </div>

      {/* Metrics Cards */}
      <div className="flex-shrink-0">
        <MetricsCards metrics={metrics} />
      </div>

      {/* Charts Section */}
      <div className="flex-shrink-0">
        <ChartsSection filters={filters} />
      </div>

      {/* Logs Table - Allow this to grow and handle scrolling */}
      <div className="flex-1 min-h-0">
        <LogsTable
          logs={logsResponse?.data || []}
          pagination={logsResponse?.pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Dashboard;
