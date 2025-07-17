// Dark Theme MetricsCards.tsx
import type { DashboardMetrics } from "@botson/shared";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
}

const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  // Function to format large numbers
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6"
          >
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-600/50"></div>
            <div className="h-8 w-1/2 rounded bg-gray-600/50"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Logs",
      value: formatLargeNumber(metrics.totalLogs),
      exactValue: metrics.totalLogs.toLocaleString(),
      icon: DocumentTextIcon,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      hoverBgColor: "group-hover:bg-blue-500/30",
      gradientFrom: "from-blue-500/5",
      gradientTo: "to-purple-500/5",
      change: null,
    },
    {
      title: "Jobs Indexed",
      value: formatLargeNumber(metrics.totalJobsIndexed),
      exactValue: metrics.totalJobsIndexed.toLocaleString(),
      icon: CheckCircleIcon,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      hoverBgColor: "group-hover:bg-green-500/30",
      gradientFrom: "from-green-500/5",
      gradientTo: "to-emerald-500/5",
      change: null,
    },
    {
      title: "Jobs Failed",
      value: formatLargeNumber(metrics.totalJobsFailed),
      exactValue: metrics.totalJobsFailed.toLocaleString(),
      icon: XCircleIcon,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      hoverBgColor: "group-hover:bg-red-500/30",
      gradientFrom: "from-red-500/5",
      gradientTo: "to-pink-500/5",
      change: null,
    },
    {
      title: "Success Rate",
      value: `${metrics.successRate.toFixed(1)}%`,
      exactValue: null,
      icon: ChartBarIcon,
      color:
        metrics.successRate >= 90
          ? "text-green-400"
          : metrics.successRate >= 70
          ? "text-yellow-400"
          : "text-red-400",
      bgColor:
        metrics.successRate >= 90
          ? "bg-green-500/20"
          : metrics.successRate >= 70
          ? "bg-yellow-500/20"
          : "bg-red-500/20",
      hoverBgColor:
        metrics.successRate >= 90
          ? "group-hover:bg-green-500/30"
          : metrics.successRate >= 70
          ? "group-hover:bg-yellow-500/30"
          : "group-hover:bg-red-500/30",
      gradientFrom:
        metrics.successRate >= 90
          ? "from-green-500/5"
          : metrics.successRate >= 70
          ? "from-yellow-500/5"
          : "from-red-500/5",
      gradientTo:
        metrics.successRate >= 90
          ? "to-emerald-500/5"
          : metrics.successRate >= 70
          ? "to-orange-500/5"
          : "to-pink-500/5",
      change: null,
    },
    {
      title: "Avg Processing Time",
      value: `${metrics.averageProcessingTime.toFixed(1)}m`,
      exactValue: null,
      icon: ClockIcon,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      hoverBgColor: "group-hover:bg-purple-500/30",
      gradientFrom: "from-purple-500/5",
      gradientTo: "to-indigo-500/5",
      change: null,
    },
    {
      title: "Active Clients",
      value: metrics.activeClients.toString(),
      exactValue: null,
      icon: UserGroupIcon,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      hoverBgColor: "group-hover:bg-cyan-500/30",
      gradientFrom: "from-cyan-500/5",
      gradientTo: "to-blue-500/5",
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 justify-items-center">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6 transition-all duration-500 hover:bg-gray-800/80 hover:scale-105 hover:shadow-xl w-full min-h-[160px] flex flex-col justify-between mb-8"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          ></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl ${card.bgColor} ${card.hoverBgColor} transition-all duration-300`}
              >
                <card.icon
                  className={`h-6 w-6 ${card.color} group-hover:scale-110 transition-transform duration-300`}
                />
              </div>
              {card.change && (
                <div className="flex items-center text-sm font-medium text-green-400">
                  <span className="mr-1">↗</span>
                  {card.change}%
                </div>
              )}
            </div>
            <div>
              <h3 className="text-gray-300 text-sm font-semibold mb-3 group-hover:text-gray-200 transition-colors duration-300 uppercase tracking-wider">
                {card.title}
              </h3>
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <p className="text-3xl font-bold text-white mb-1 group-hover:text-gray-100 transition-colors duration-300 tracking-tight">
                    {card.value}
                  </p>
                  {/* Show info icon for numbers that have exact values */}
                  {card.exactValue && card.exactValue !== card.value && (
                    <div className="w-4 h-4 rounded-full bg-gray-600/50 flex items-center justify-center group-hover:bg-gray-500/50 transition-colors duration-300">
                      <span className="text-xs text-gray-400 group-hover:text-gray-300">
                        i
                      </span>
                    </div>
                  )}
                </div>
                {/* Show exact number on hover for large formatted numbers */}
                {card.exactValue && card.exactValue !== card.value && (
                  <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900/95 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700/50 shadow-xl z-10">
                    <p className="text-xs text-gray-300 font-medium whitespace-nowrap">
                      Exact: {card.exactValue}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
