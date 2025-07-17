// src/routes/dashboard.routes.ts
import express from "express";
import {
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
} from "../controllers/dashboard.contoller";
import { validateAndParseFilters } from "../middleware/queryFilters.middleware";

const router = express.Router();

router.get("/", validateAndParseFilters, getDashboardData);
router.get(
  "/aggregated-metrics",
  validateAndParseFilters,
  getAggregatedMetrics
);
router.get("/time-series", validateAndParseFilters, getTimeSeriesData);
router.get("/clients", validateAndParseFilters, getClientPerformance);
router.get("/status", validateAndParseFilters, getStatusDistribution);

// Advanced analytics routes
router.get("/top-performers", validateAndParseFilters, getTopPerformers);
router.get("/failure-analysis", validateAndParseFilters, getFailureAnalysis);
router.get(
  "/performance-trends",
  validateAndParseFilters,
  getPerformanceTrends
);
router.get(
  "/performance-alerts",
  validateAndParseFilters,
  getPerformanceAlerts
);
router.get("/data-quality", validateAndParseFilters, getDataQualityMetrics);

// Client-specific routes
router.get("/client/:clientName/stats", getClientStats);

// Health check for dashboard service
router.get("/health", getHealthCheck);

export default router;
