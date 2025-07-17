// src/components/DashboardFilters.tsx
import { useState } from "react";
import type { DashboardFilters } from "@botson/shared";
import {
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface DashboardFiltersProps {
  filters: DashboardFilters;
  clients: string[];
  countries: string[];
  onFilterChange: (filters: DashboardFilters) => void;
}

const DashboardFiltersComponent = ({
  filters,
  clients,
  countries,
  onFilterChange,
}: DashboardFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (key: keyof DashboardFilters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      page: 1,
      limit: filters.limit || 50,
    });
  };

  const hasActiveFilters = Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.client ||
      filters.country ||
      filters.status
  );

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? "Hide" : "Show"} Filters
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Client Filter - IMPROVED */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                value={filters.client || ""}
                onChange={(e) => handleInputChange("client", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
              {/* Show selected client for clarity */}
              {filters.client && (
                <div className="text-xs text-gray-500">
                  Selected:{" "}
                  <span className="font-medium">{filters.client}</span>
                </div>
              )}
            </div>

            {/* Country Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                value={filters.country || ""}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.client && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Client: {filters.client}
                    <button
                      onClick={() => handleInputChange("client", "")}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.country && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Country: {filters.country}
                    <button
                      onClick={() => handleInputChange("country", "")}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Status: {filters.status}
                    <button
                      onClick={() => handleInputChange("status", "")}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(filters.startDate || filters.endDate) && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Date Range: {filters.startDate || "Start"} to{" "}
                    {filters.endDate || "End"}
                    <button
                      onClick={() => {
                        handleInputChange("startDate", "");
                        handleInputChange("endDate", "");
                      }}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Date Filters */}
          <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">Quick filters:</span>
            <button
              onClick={() => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                onFilterChange({
                  ...filters,
                  startDate: format(yesterday, "yyyy-MM-dd"),
                  endDate: format(today, "yyyy-MM-dd"),
                });
              }}
              className="rounded-lg px-3 py-1 text-xs transition-colors bg-gray-100 hover:bg-gray-200"
            >
              Last 24h
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                onFilterChange({
                  ...filters,
                  startDate: format(lastWeek, "yyyy-MM-dd"),
                  endDate: format(today, "yyyy-MM-dd"),
                });
              }}
              className="rounded-lg px-3 py-1 text-xs transition-colors bg-gray-100 hover:bg-gray-200"
            >
              Last Week
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                onFilterChange({
                  ...filters,
                  startDate: format(lastMonth, "yyyy-MM-dd"),
                  endDate: format(today, "yyyy-MM-dd"),
                });
              }}
              className="rounded-lg px-3 py-1 text-xs transition-colors bg-gray-100 hover:bg-gray-200"
            >
              Last Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFiltersComponent;
