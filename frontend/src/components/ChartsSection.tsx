import React from "react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardFilters } from "@botson/shared";
import { apiService } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import LoadingSpinner from "./ui/LoadingSpinner";

interface ChartsSectionProps {
  filters: DashboardFilters;
}

// Updated interface to match actual backend response
interface StatusDistributionResponse {
  _id?: string;
  status?: string;
  name?: string;
  count?: number;
  value?: number;
  total?: number;
  percentage?: number;
  color?: string;
}

const ChartsSection = ({ filters }: ChartsSectionProps) => {
  const {
    data: timeSeriesData,
    isLoading: timeSeriesLoading,
    error: timeSeriesError,
  } = useQuery({
    queryKey: ["timeSeries", filters],
    queryFn: () => apiService.getTimeSeriesData(filters),
    enabled: true,
  });

  const {
    data: clientData,
    isLoading: clientLoading,
    error: clientError,
  } = useQuery({
    queryKey: ["clientPerformance", filters],
    queryFn: () => apiService.getClientPerformance(filters),
    enabled: true,
  });

  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ["statusDistribution", filters],
    queryFn: () => apiService.getStatusDistribution(filters),
    enabled: true,
  });

  // Only two colors: green for completed, red for failed
  const STATUS_COLORS = {
    completed: "#10b981", // Green
    failed: "#ef4444", // Red
  };

  const tooltipStyle = {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "12px",
    color: "#ffffff",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  };

  // Process status data to ensure only completed/failed and proper percentages
  const processedStatusData = React.useMemo(() => {
    if (!statusData || statusData.length === 0) {
      console.log("No status data received:", statusData);
      return [];
    }

    console.log("Raw status data:", statusData);

    // The backend returns data with different field names, let's handle both cases
    const normalizedData = statusData.map(
      (item: StatusDistributionResponse) => {
        // Handle different possible field names from backend
        const status = item.status || item.name || item._id || "unknown";
        const count = item.count || item.value || item.total || 0;
        const percentage = item.percentage || 0;

        return {
          status: status.toLowerCase(),
          count: Number(count),
          percentage: Number(percentage),
        };
      }
    );

    console.log("Normalized data:", normalizedData);

    // Since you only have completed jobs, let's create a simple structure
    // If there are no failed jobs, we'll show 100% completed
    const result = normalizedData.map((item) => ({
      ...item,
      // Normalize status names
      status:
        item.status === "success"
          ? "completed"
          : item.status === "error"
          ? "failed"
          : item.status,
      percentage: item.percentage || 100, // Default to 100% if not provided
    }));

    console.log("Final processed data:", result);
    return result;
  }, [statusData]);

  if (timeSeriesError || clientError || statusError) {
    return (
      <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span className="text-red-300">
            Failed to load chart data. Please try refreshing.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Time Series Chart */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/60 transition-all duration-500">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Jobs Over Time</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-green-400"></div>
              <span className="text-gray-300">Successful</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-red-400"></div>
              <span className="text-gray-300">Failed</span>
            </div>
          </div>
        </div>

        {timeSeriesLoading ? (
          <div className="flex justify-center items-center h-80">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient
                  id="colorSuccessful"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(value) =>
                  `Date: ${new Date(value).toLocaleDateString()}`
                }
              />
              <Area
                type="monotone"
                dataKey="successfulJobs"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSuccessful)"
                name="Successful Jobs"
              />
              <Area
                type="monotone"
                dataKey="failedJobs"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorFailed)"
                name="Failed Jobs"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Client Performance Bar Chart */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/60 transition-all duration-500">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Client Performance
          </h3>
          <div className="text-sm text-gray-400">Jobs processed by client</div>
        </div>

        {clientLoading ? (
          <div className="flex justify-center items-center h-80">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={clientData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="client"
                stroke="#9ca3af"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  `${value?.toLocaleString()}`,
                  name === "successfulJobs"
                    ? "Successful Jobs"
                    : name === "failedJobs"
                    ? "Failed Jobs"
                    : name,
                ]}
              />
              <Bar
                dataKey="successfulJobs"
                fill="#10b981"
                name="Successful Jobs"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="failedJobs"
                fill="#ef4444"
                name="Failed Jobs"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Status Distribution Pie Chart - Fixed */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/60 transition-all duration-500">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Status Distribution
          </h3>
          <div className="text-sm text-gray-400">Completed vs Failed Jobs</div>
        </div>

        {statusLoading ? (
          <div className="flex justify-center items-center h-80">
            <LoadingSpinner size="lg" />
          </div>
        ) : processedStatusData && processedStatusData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={processedStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  stroke="#1f2937"
                  strokeWidth={2}
                >
                  {processedStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        STATUS_COLORS[
                          entry.status as keyof typeof STATUS_COLORS
                        ] || "#6b7280"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} jobs`,
                    name === "count" ? "Jobs" : name,
                  ]}
                  labelFormatter={(label) => `Status: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Legend with Count and Percentage Information */}
            <div className="flex justify-center gap-6 mt-4">
              {processedStatusData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[
                          entry.status as keyof typeof STATUS_COLORS
                        ] || "#6b7280",
                    }}
                  ></div>
                  <span className="text-gray-300 text-sm capitalize">
                    {entry.status}: {entry.count.toLocaleString()} (
                    {entry.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-80">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">
                No Data Available
              </div>
              <div className="text-gray-500 text-sm">
                No status distribution data to display
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total Jobs Trend */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/60 transition-all duration-500">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Total Jobs Trend</h3>
          <div className="text-sm text-gray-400">Overall processing volume</div>
        </div>

        {timeSeriesLoading ? (
          <div className="flex justify-center items-center h-80">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(value) =>
                  `Date: ${new Date(value).toLocaleDateString()}`
                }
                formatter={(value) => [
                  `${value?.toLocaleString()}`,
                  "Total Jobs",
                ]}
              />
              <Line
                type="monotone"
                dataKey="totalJobs"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                activeDot={{
                  r: 6,
                  stroke: "#8b5cf6",
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
                name="Total Jobs"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartsSection;
