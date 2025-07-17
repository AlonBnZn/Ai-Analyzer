// src/components/MetricsCards.tsx
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
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-white p-6 shadow-sm"
          >
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-8 w-1/2 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Logs",
      value: metrics.totalLogs.toLocaleString(),
      icon: DocumentTextIcon,
      color: "text-primary-600",
      bgColor: "bg-primary-50",
      change: null,
    },
    {
      title: "Jobs Indexed",
      value: metrics.totalJobsIndexed.toLocaleString(),
      icon: CheckCircleIcon,
      color: "text-success-600",
      bgColor: "bg-success-50",
      change: null,
    },
    {
      title: "Jobs Failed",
      value: metrics.totalJobsFailed.toLocaleString(),
      icon: XCircleIcon,
      color: "text-error-600",
      bgColor: "bg-error-50",
      change: null,
    },
    {
      title: "Success Rate",
      value: `${metrics.successRate.toFixed(1)}%`,
      icon: ChartBarIcon,
      color:
        metrics.successRate >= 90
          ? "text-success-600"
          : metrics.successRate >= 70
          ? "text-warning-600"
          : "text-error-600",
      bgColor:
        metrics.successRate >= 90
          ? "bg-success-50"
          : metrics.successRate >= 70
          ? "bg-warning-50"
          : "bg-error-50",
      change: null,
    },
    {
      title: "Avg Processing Time",
      value: `${metrics.averageProcessingTime.toFixed(1)}m`,
      icon: ClockIcon,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      change: null,
    },
    {
      title: "Active Clients",
      value: metrics.activeClients.toString(),
      icon: UserGroupIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            id={index.toString()}
            key={card.title}
            className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex items-center">
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>

              {card.change && (
                <div className="mt-2 flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      card.change > 0 ? "text-success-600" : "text-error-600"
                    }`}
                  >
                    {card.change > 0 ? "+" : ""}
                    {card.change}%
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    vs last period
                  </span>
                </div>
              )}
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-10 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%]"></div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;
