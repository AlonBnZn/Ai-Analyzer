// src/controllers/dashboard.controller.ts
import { Response } from "express";
import { RequestWithFilters } from "../types/filters";
import DashboardService from "../services/dashboard.service";
import { APIResponse } from "@botson/shared";
import { Logger } from "../utils/logger";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  // Get main dashboard data (logs with pagination)
  getDashboardData = async (req: RequestWithFilters, res: Response) => {
    try {
      const filters = req.filters || {};
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      // Validate filters
      const validation = await this.dashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Invalid filters",
          details: validation.errors,
        });
      }

      const result = await this.dashboardService.getDashboardData(
        filters,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      Logger.error("Dashboard controller - getDashboardData error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get aggregated metrics
  getAggregatedMetrics = async (req: RequestWithFilters, res: Response) => {
    try {
      const filters = req.filters || {};

      // Validate filters
      const validation = await this.dashboardService.validateFilters(filters);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Invalid filters",
          details: validation.errors,
        });
      }

      const metrics = await this.dashboardService.getDashboardMetrics(filters);
      res.status(200).json(metrics);
    } catch (error) {
      Logger.error("Dashboard controller - getAggregatedMetrics error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get client performance data
  getClientPerformance = async (req: RequestWithFilters, res: Response) => {
    try {
      const filters = req.filters || {};

      const data = await this.dashboardService.getClientPerformance(filters);

      const response: APIResponse<typeof data> = {
        success: true,
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getClientPerformance error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get time series data
  getTimeSeriesData = async (req: RequestWithFilters, res: Response) => {
    try {
      const filters = req.filters || {};

      const data = await this.dashboardService.getTimeSeriesData(filters);

      const response: APIResponse<typeof data> = {
        success: true,
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getTimeSeriesData error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get status distribution for pie chart
  getStatusDistribution = async (req: RequestWithFilters, res: Response) => {
    try {
      const filters = req.filters || {};

      const data = await this.dashboardService.getStatusDistribution(filters);

      const response: APIResponse<typeof data> = {
        success: true,
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error(
        "Dashboard controller - getStatusDistribution error:",
        error
      );
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get top performers
  getTopPerformers = async (req: RequestWithFilters, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: "Invalid limit parameter. Must be between 1 and 100.",
        });
      }

      const data = await this.dashboardService.getTopPerformers(limit);

      const response: APIResponse<typeof data> = {
        success: true,
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getTopPerformers error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get failure analysis
  getFailureAnalysis = async (req: RequestWithFilters, res: Response) => {
    try {
      const filters = req.filters || {};

      const data = await this.dashboardService.getFailureAnalysis(filters);

      const response: APIResponse<typeof data> = {
        success: true,
        data,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getFailureAnalysis error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get unique clients
  getClients = async (req: RequestWithFilters, res: Response) => {
    try {
      const clients = await this.dashboardService.getUniqueClients();

      const response: APIResponse<string[]> = {
        success: true,
        data: clients,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getClients error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get unique countries
  getCountries = async (req: RequestWithFilters, res: Response) => {
    try {
      const countries = await this.dashboardService.getUniqueCountries();

      const response: APIResponse<string[]> = {
        success: true,
        data: countries,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getCountries error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get client-specific statistics
  getClientStats = async (req: RequestWithFilters, res: Response) => {
    try {
      const clientName = req.params.clientName;

      if (!clientName) {
        return res.status(400).json({
          success: false,
          error: "Client name is required",
        });
      }

      const stats = await this.dashboardService.getClientStats(clientName);

      const response: APIResponse<typeof stats> = {
        success: true,
        data: stats,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getClientStats error:", error);

      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get performance trends
  getPerformanceTrends = async (req: RequestWithFilters, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;

      if (days < 1 || days > 365) {
        return res.status(400).json({
          success: false,
          error: "Days parameter must be between 1 and 365",
        });
      }

      const trends = await this.dashboardService.getPerformanceTrends(days);

      const response: APIResponse<typeof trends> = {
        success: true,
        data: trends,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getPerformanceTrends error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get performance alerts
  getPerformanceAlerts = async (req: RequestWithFilters, res: Response) => {
    try {
      const thresholds = {
        minSuccessRate: req.query.minSuccessRate
          ? parseFloat(req.query.minSuccessRate as string)
          : undefined,
        maxProcessingTime: req.query.maxProcessingTime
          ? parseFloat(req.query.maxProcessingTime as string)
          : undefined,
        minJobVolume: req.query.minJobVolume
          ? parseInt(req.query.minJobVolume as string)
          : undefined,
      };

      const alerts = await this.dashboardService.getPerformanceAlerts(
        thresholds
      );

      const response: APIResponse<typeof alerts> = {
        success: true,
        data: alerts,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error("Dashboard controller - getPerformanceAlerts error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Get data quality metrics
  getDataQualityMetrics = async (req: RequestWithFilters, res: Response) => {
    try {
      const filters = req.filters || {};

      const metrics = await this.dashboardService.getDataQualityMetrics(
        filters
      );

      const response: APIResponse<typeof metrics> = {
        success: true,
        data: metrics,
      };

      res.status(200).json(response);
    } catch (error) {
      Logger.error(
        "Dashboard controller - getDataQualityMetrics error:",
        error
      );
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Health check specific to dashboard service
  getHealthCheck = async (req: RequestWithFilters, res: Response) => {
    try {
      // Check if the service can connect to database and perform basic operations
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "dashboard",
        checks: {
          database: "connected",
          repository: "operational",
          service: "operational",
        },
      };

      // Perform a simple database check
      try {
        await this.dashboardService.getUniqueClients();
        healthData.checks.database = "connected";
      } catch (error) {
        healthData.status = "unhealthy";
        healthData.checks.database = "disconnected";
      }

      const statusCode = healthData.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(healthData);
    } catch (error) {
      Logger.error("Dashboard controller - getHealthCheck error:", error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "dashboard",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

// Export instances for use in routes
const dashboardController = new DashboardController();

export const {
  getDashboardData,
  getAggregatedMetrics,
  getClientPerformance,
  getTimeSeriesData,
  getStatusDistribution,
  getTopPerformers,
  getFailureAnalysis,
  getClients,
  getCountries,
  getClientStats,
  getPerformanceTrends,
  getPerformanceAlerts,
  getDataQualityMetrics,
  getHealthCheck,
} = dashboardController;
