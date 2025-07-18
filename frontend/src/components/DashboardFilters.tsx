import { useState } from "react";
import type { DashboardFilters } from "@botson/shared";
import {
  CalendarIcon,
  FunnelIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

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
    <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
      <div className="px-6 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <FunnelIcon className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border border-purple-500/30">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-300"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-300 text-gray-300 hover:text-white"
            >
              {isExpanded ? (
                <EyeSlashIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
              <span>{isExpanded ? "Hide" : "Show"} Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Section */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                />
                <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                />
                <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Client Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Client
              </label>
              <select
                value={filters.client || ""}
                onChange={(e) => handleInputChange("client", e.target.value)}
                className="w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Country
              </label>
              <select
                value={filters.country || ""}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
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
              <label className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full rounded-xl bg-gray-800/50 border border-gray-700 px-4 py-3 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div className="border-t border-gray-700/50 pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Last 24 Hours", hours: 24 },
                { label: "Last 7 Days", hours: 24 * 7 },
                { label: "Last 30 Days", hours: 24 * 30 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const endDate = new Date();
                    const startDate = new Date(
                      endDate.getTime() - preset.hours * 60 * 60 * 1000
                    );
                    handleInputChange(
                      "startDate",
                      startDate.toISOString().split("T")[0]
                    );
                    handleInputChange(
                      "endDate",
                      endDate.toISOString().split("T")[0]
                    );
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-300 hover:text-purple-200 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 text-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFiltersComponent;
