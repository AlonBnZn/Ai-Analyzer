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

// Main dashboard routes (matching frontend API calls)
router.get("/", validateAndParseFilters, getDashboardData); // GET /api/dashboard
router.get(
  "/aggregated-metrics",
  validateAndParseFilters,
  getAggregatedMetrics
); // GET /api/dashboard/aggregated-metrics
router.get("/time-series", validateAndParseFilters, getTimeSeriesData); // GET /api/dashboard/time-series
router.get("/clients", validateAndParseFilters, getClientPerformance); // GET /api/dashboard/clients
router.get("/status", validateAndParseFilters, getStatusDistribution); // GET /api/dashboard/status

// Advanced analytics routes
router.get("/top-performers", validateAndParseFilters, getTopPerformers); // GET /api/dashboard/top-performers
router.get("/failure-analysis", validateAndParseFilters, getFailureAnalysis); // GET /api/dashboard/failure-analysis
router.get(
  "/performance-trends",
  validateAndParseFilters,
  getPerformanceTrends
); // GET /api/dashboard/performance-trends
router.get(
  "/performance-alerts",
  validateAndParseFilters,
  getPerformanceAlerts
); // GET /api/dashboard/performance-alerts
router.get("/data-quality", validateAndParseFilters, getDataQualityMetrics); // GET /api/dashboard/data-quality

// Client-specific routes
router.get("/client/:clientName/stats", getClientStats); // GET /api/dashboard/client/Deal1/stats

// Health check for dashboard service
router.get("/health", getHealthCheck); // GET /api/dashboard/health

export default router;
