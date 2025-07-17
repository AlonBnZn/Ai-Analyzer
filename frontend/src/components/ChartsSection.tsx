// Dark Theme ChartsSection.tsx
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

const ChartsSection = ({ filters }: ChartsSectionProps) => {
  // Fetch time series data
  const {
    data: timeSeriesData,
    isLoading: timeSeriesLoading,
    error: timeSeriesError,
  } = useQuery({
    queryKey: ["timeSeries", filters],
    queryFn: () => apiService.getTimeSeriesData(filters),
    enabled: true,
  });

  // Fetch client performance data
  const {
    data: clientData,
    isLoading: clientLoading,
    error: clientError,
  } = useQuery({
    queryKey: ["clientPerformance", filters],
    queryFn: () => apiService.getClientPerformance(filters),
    enabled: true,
  });

  // Fetch status distribution
  const {
    data: statusData,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({
    queryKey: ["statusDistribution", filters],
    queryFn: () => apiService.getStatusDistribution(filters),
    enabled: true,
  });

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

  // Dark theme tooltip styles
  const tooltipStyle = {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "12px",
    color: "#ffffff",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  };

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

      {/* Status Distribution Pie Chart */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 hover:bg-gray-800/60 transition-all duration-500">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Status Distribution
          </h3>
          <div className="text-sm text-gray-400">Job status breakdown</div>
        </div>

        {statusLoading ? (
          <div className="flex justify-center items-center h-80">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#1f2937"
                >
                  {statusData?.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {statusData?.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-300 text-sm">{entry.name}</span>
                </div>
              ))}
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
