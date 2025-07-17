// src/services/dashboard.service.ts
import {
  DashboardFilters,
  DashboardMetrics,
  APIResponse,
} from "@botson/shared";
import JobIndexingRepository from "../repositories/jobindexing.repository";
import { Logger } from "../utils/logger";

export class DashboardService {
  private jobIndexingRepo: JobIndexingRepository;

  constructor() {
    this.jobIndexingRepo = new JobIndexingRepository();
  }

  async getDashboardData(
    filters: DashboardFilters,
    page: number = 1,
    limit: number = 50
  ) {
    try {
      Logger.info("Fetching dashboard data", { filters, page, limit });

      const result = await this.jobIndexingRepo.findMany(filters, page, limit);

      const response: APIResponse<typeof result.data> = {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      };

      Logger.info("Dashboard data fetched successfully", {
        totalRecords: result.total,
        currentPage: result.page,
        totalPages: result.totalPages,
      });

      return response;
    } catch (error) {
      Logger.error("Error fetching dashboard data", error);
      throw new Error("Failed to fetch dashboard data");
    }
  }

  async getDashboardMetrics(
    filters: DashboardFilters
  ): Promise<DashboardMetrics> {
    try {
      Logger.info("Fetching dashboard metrics", { filters });

      const metrics = await this.jobIndexingRepo.getAggregatedMetrics(filters);

      // Add additional business logic/calculations if needed
      const enhancedMetrics: DashboardMetrics = {
        ...metrics,
        // Add computed fields or business logic here
        successRate: Math.round(metrics.successRate * 100) / 100, // Round to 2 decimal places
        averageProcessingTime: metrics.averageProcessingTime || 0,
      };

      Logger.info("Dashboard metrics fetched successfully", {
        totalLogs: enhancedMetrics.totalLogs,
        successRate: enhancedMetrics.successRate,
      });

      return enhancedMetrics;
    } catch (error) {
      Logger.error("Error fetching dashboard metrics", error);
      throw new Error("Failed to fetch dashboard metrics");
    }
  }

  async getTimeSeriesData(filters: DashboardFilters) {
    try {
      Logger.info("Fetching time series data", { filters });

      const data = await this.jobIndexingRepo.getTimeSeriesData(filters);

      // Add business logic for data processing
      const processedData = data.map((item) => ({
        ...item,
        // Add computed fields
        successRate:
          item.totalJobs > 0
            ? Math.round((item.successfulJobs / item.totalJobs) * 100 * 100) /
              100
            : 0,
        failureRate:
          item.totalJobs > 0
            ? Math.round((item.failedJobs / item.totalJobs) * 100 * 100) / 100
            : 0,
      }));

      Logger.info("Time series data fetched successfully", {
        dataPoints: processedData.length,
        dateRange:
          filters.startDate && filters.endDate
            ? `${filters.startDate} to ${filters.endDate}`
            : "All time",
      });

      return processedData;
    } catch (error) {
      Logger.error("Error fetching time series data", error);
      throw new Error("Failed to fetch time series data");
    }
  }

  async getClientPerformance(filters: DashboardFilters) {
    try {
      Logger.info("Fetching client performance data", { filters });

      const data = await this.jobIndexingRepo.getClientPerformance(filters);

      // Add business logic for performance analysis
      const processedData = data.map((client) => ({
        ...client,
        // Add performance ratings
        performanceRating: this.calculatePerformanceRating(
          client.successRate,
          client.totalJobs
        ),
        // Add trend indicators (you could fetch historical data for comparison)
        trend: "stable", // This would be calculated based on historical data
      }));

      Logger.info("Client performance data fetched successfully", {
        clientCount: processedData.length,
        topPerformer: processedData[0]?.client || "N/A",
      });

      return processedData;
    } catch (error) {
      Logger.error("Error fetching client performance data", error);
      throw new Error("Failed to fetch client performance data");
    }
  }

  async getStatusDistribution(filters: DashboardFilters) {
    try {
      Logger.info("Fetching status distribution", { filters });

      const data = await this.jobIndexingRepo.getStatusDistribution(filters);

      // Add business logic for status analysis
      const totalCount = data.reduce((sum, item) => sum + item.value, 0);
      const processedData = data.map((item) => ({
        ...item,
        percentage:
          totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0,
      }));

      Logger.info("Status distribution fetched successfully", {
        totalRecords: totalCount,
        statusTypes: processedData.length,
      });

      return processedData;
    } catch (error) {
      Logger.error("Error fetching status distribution", error);
      throw new Error("Failed to fetch status distribution");
    }
  }

  async getTopPerformers(limit: number = 10) {
    try {
      Logger.info("Fetching top performers", { limit });

      const data = await this.jobIndexingRepo.getTopPerformers(limit);

      // Add business logic for ranking
      const processedData = data.map((client, index) => ({
        ...client,
        rank: index + 1,
        performanceGrade: this.calculatePerformanceGrade(client.successRate),
      }));

      Logger.info("Top performers fetched successfully", {
        performerCount: processedData.length,
        topPerformer: processedData[0]?.client || "N/A",
      });

      return processedData;
    } catch (error) {
      Logger.error("Error fetching top performers", error);
      throw new Error("Failed to fetch top performers");
    }
  }

  async getFailureAnalysis(filters: DashboardFilters) {
    try {
      Logger.info("Fetching failure analysis", { filters });

      const data = await this.jobIndexingRepo.getFailureAnalysis(filters);

      // Add business logic for failure categorization
      const processedData = data.map((item) => ({
        ...item,
        // Add failure severity levels
        severity: this.calculateFailureSeverity(
          item.indexFailureRate,
          item.metadataMissingRate,
          item.filterLossRate
        ),
        // Add recommendations
        recommendations: this.generateRecommendations(item),
      }));

      Logger.info("Failure analysis fetched successfully", {
        issuesFound: processedData.length,
        criticalIssues: processedData.filter(
          (item) => item.severity === "critical"
        ).length,
      });

      return processedData;
    } catch (error) {
      Logger.error("Error fetching failure analysis", error);
      throw new Error("Failed to fetch failure analysis");
    }
  }

  async getUniqueClients(): Promise<string[]> {
    try {
      Logger.info("Fetching unique clients");

      const clients = await this.jobIndexingRepo.getUniqueClients();
      const sortedClients = clients.sort();

      Logger.info("Unique clients fetched successfully", {
        clientCount: sortedClients.length,
      });

      return sortedClients;
    } catch (error) {
      Logger.error("Error fetching unique clients", error);
      throw new Error("Failed to fetch unique clients");
    }
  }

  async getUniqueCountries(): Promise<string[]> {
    try {
      Logger.info("Fetching unique countries");

      const countries = await this.jobIndexingRepo.getUniqueCountries();
      const sortedCountries = countries.sort();

      Logger.info("Unique countries fetched successfully", {
        countryCount: sortedCountries.length,
      });

      return sortedCountries;
    } catch (error) {
      Logger.error("Error fetching unique countries", error);
      throw new Error("Failed to fetch unique countries");
    }
  }

  async getClientStats(clientName: string) {
    try {
      Logger.info("Fetching client statistics", { clientName });

      const stats = await this.jobIndexingRepo.getClientStats(clientName);

      if (!stats) {
        throw new Error(`Client '${clientName}' not found`);
      }

      // Add business logic for client analysis
      const enhancedStats = {
        ...stats,
        successRate:
          stats.totalJobs > 0
            ? Math.round((stats.successfulJobs / stats.totalJobs) * 100 * 100) /
              100
            : 0,
        performanceRating: this.calculatePerformanceRating(
          stats.totalJobs > 0
            ? (stats.successfulJobs / stats.totalJobs) * 100
            : 0,
          stats.totalJobs
        ),
      };

      Logger.info("Client statistics fetched successfully", {
        clientName,
        totalLogs: enhancedStats.totalLogs,
        successRate: enhancedStats.successRate,
      });

      return enhancedStats;
    } catch (error) {
      Logger.error("Error fetching client statistics", error);
      throw new Error(`Failed to fetch statistics for client '${clientName}'`);
    }
  }

  async getPerformanceTrends(days: number = 30) {
    try {
      Logger.info("Fetching performance trends", { days });

      const trends = await this.jobIndexingRepo.getPerformanceTrends(days);

      // Add business logic for trend analysis
      const processedTrends = trends.map((trend, index) => ({
        ...trend,
        date: trend._id,
        // Add trend indicators
        dayOverDayChange:
          index > 0
            ? this.calculateDayOverDayChange(
                trend.avgSuccessRate,
                trends[index - 1].avgSuccessRate
              )
            : 0,
      }));

      Logger.info("Performance trends fetched successfully", {
        dataPoints: processedTrends.length,
        periodDays: days,
      });

      return processedTrends;
    } catch (error) {
      Logger.error("Error fetching performance trends", error);
      throw new Error("Failed to fetch performance trends");
    }
  }

  // Private helper methods for business logic
  private calculatePerformanceRating(
    successRate: number,
    totalJobs: number
  ): string {
    if (totalJobs < 100) return "insufficient_data";
    if (successRate >= 95) return "excellent";
    if (successRate >= 90) return "good";
    if (successRate >= 80) return "fair";
    if (successRate >= 70) return "poor";
    return "critical";
  }

  private calculatePerformanceGrade(successRate: number): string {
    if (successRate >= 95) return "A+";
    if (successRate >= 90) return "A";
    if (successRate >= 85) return "B+";
    if (successRate >= 80) return "B";
    if (successRate >= 75) return "C+";
    if (successRate >= 70) return "C";
    return "F";
  }

  private calculateFailureSeverity(
    indexFailureRate: number,
    metadataMissingRate: number,
    filterLossRate: number
  ): string {
    if (
      indexFailureRate > 20 ||
      metadataMissingRate > 50 ||
      filterLossRate > 80
    ) {
      return "critical";
    }
    if (
      indexFailureRate > 10 ||
      metadataMissingRate > 30 ||
      filterLossRate > 60
    ) {
      return "high";
    }
    if (
      indexFailureRate > 5 ||
      metadataMissingRate > 20 ||
      filterLossRate > 40
    ) {
      return "medium";
    }
    return "low";
  }

  private generateRecommendations(failureData: any): string[] {
    const recommendations: string[] = [];

    if (failureData.indexFailureRate > 10) {
      recommendations.push("Review indexing configuration and error logs");
    }

    if (failureData.metadataMissingRate > 30) {
      recommendations.push("Improve metadata enrichment process");
    }

    if (failureData.filterLossRate > 60) {
      recommendations.push("Optimize data filtering criteria");
    }

    if (failureData.indexFailureRate > 5) {
      recommendations.push("Monitor system resources and capacity");
    }

    if (recommendations.length === 0) {
      recommendations.push("Monitor performance metrics regularly");
    }

    return recommendations;
  }

  private calculateDayOverDayChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }

  // Business validation methods
  async validateFilters(
    filters: DashboardFilters
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      if (startDate > endDate) {
        errors.push("Start date cannot be after end date");
      }

      // Check if date range is too large (e.g., more than 1 year)
      const diffInDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffInDays > 365) {
        errors.push("Date range cannot exceed 365 days");
      }
    }

    if (filters.client) {
      const clients = await this.getUniqueClients();
      if (!clients.includes(filters.client)) {
        errors.push(`Client '${filters.client}' does not exist`);
      }
    }

    if (filters.country) {
      const countries = await this.getUniqueCountries();
      if (!countries.includes(filters.country)) {
        errors.push(`Country '${filters.country}' does not exist`);
      }
    }

    if (
      filters.status &&
      !["completed", "failed", "processing"].includes(filters.status)
    ) {
      errors.push(`Invalid status '${filters.status}'`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Advanced analytics methods
  async getPerformanceAlerts(
    thresholds: {
      minSuccessRate?: number;
      maxProcessingTime?: number;
      minJobVolume?: number;
    } = {}
  ) {
    try {
      const defaultThresholds = {
        minSuccessRate: 90,
        maxProcessingTime: 300, // 5 minutes
        minJobVolume: 100,
        ...thresholds,
      };

      Logger.info("Generating performance alerts", {
        thresholds: defaultThresholds,
      });

      const clients = await this.jobIndexingRepo.getClientPerformance({});
      const alerts = [];

      for (const client of clients) {
        if (client.successRate < defaultThresholds.minSuccessRate) {
          alerts.push({
            type: "low_success_rate",
            severity: "high",
            client: client.client,
            message: `Success rate (${client.successRate.toFixed(
              1
            )}%) below threshold (${defaultThresholds.minSuccessRate}%)`,
            value: client.successRate,
            threshold: defaultThresholds.minSuccessRate,
          });
        }

        if (client.totalJobs < defaultThresholds.minJobVolume) {
          alerts.push({
            type: "low_volume",
            severity: "medium",
            client: client.client,
            message: `Job volume (${client.totalJobs}) below expected threshold (${defaultThresholds.minJobVolume})`,
            value: client.totalJobs,
            threshold: defaultThresholds.minJobVolume,
          });
        }
      }

      Logger.info("Performance alerts generated", {
        alertCount: alerts.length,
        highSeverityCount: alerts.filter((a) => a.severity === "high").length,
      });

      return alerts;
    } catch (error) {
      Logger.error("Error generating performance alerts", error);
      throw new Error("Failed to generate performance alerts");
    }
  }

  async getDataQualityMetrics(filters: DashboardFilters = {}) {
    try {
      Logger.info("Calculating data quality metrics", { filters });

      const metrics = await this.jobIndexingRepo.getAggregatedMetrics(filters);

      // Calculate data quality scores
      const dataQualityMetrics = {
        completeness: this.calculateCompletenessScore(metrics),
        accuracy: this.calculateAccuracyScore(metrics),
        consistency: this.calculateConsistencyScore(metrics),
        timeliness: this.calculateTimelinessScore(metrics),
        overall: 0,
      };

      // Calculate overall score
      dataQualityMetrics.overall = Math.round(
        (dataQualityMetrics.completeness +
          dataQualityMetrics.accuracy +
          dataQualityMetrics.consistency +
          dataQualityMetrics.timeliness) /
          4
      );

      Logger.info("Data quality metrics calculated", {
        overall: dataQualityMetrics.overall,
        completeness: dataQualityMetrics.completeness,
      });

      return dataQualityMetrics;
    } catch (error) {
      Logger.error("Error calculating data quality metrics", error);
      throw new Error("Failed to calculate data quality metrics");
    }
  }

  // Private data quality calculation methods
  private calculateCompletenessScore(metrics: any): number {
    // Calculate based on missing data percentage
    const totalRecords = metrics.totalRecords || 0;
    const processedRecords = metrics.totalJobsIndexed || 0;

    if (totalRecords === 0) return 0;
    return Math.round((processedRecords / totalRecords) * 100);
  }

  private calculateAccuracyScore(metrics: any): number {
    // Calculate based on success rate
    return Math.round(metrics.successRate || 0);
  }

  private calculateConsistencyScore(metrics: any): number {
    // This would typically involve comparing data across time periods
    // For now, using a simple calculation based on client distribution
    const activeClients = metrics.activeClients || 0;
    const totalLogs = metrics.totalLogs || 0;

    if (activeClients === 0 || totalLogs === 0) return 0;

    // Higher consistency if logs are evenly distributed across clients
    const avgLogsPerClient = totalLogs / activeClients;
    return Math.min(100, Math.round(avgLogsPerClient * 2)); // Simplified calculation
  }

  private calculateTimelinessScore(metrics: any): number {
    // This would typically involve analyzing processing delays
    // For now, returning a fixed score - would need historical data for proper calculation
    return 95; // Simplified calculation
  }
}

export default DashboardService;
