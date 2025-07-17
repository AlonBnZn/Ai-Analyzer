// src/routes/index.ts
import express from "express";
import dashboardRoutes from "./dashboard.route";
import assistantRoutes from "./assistant.route";
import { getClients, getCountries } from "../controllers/dashboard.contoller";

const router = express.Router();

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// assistant routes
router.use("/assistant", assistantRoutes);

// Utility routes for filter dropdowns (these remain at the top level for convenience)
router.get("/clients", getClients); // GET /api/clients
router.get("/countries", getCountries); // GET /api/countries

// Main health check (different from dashboard health check)
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "main-api",
    version: "1.0.0",
  });
});

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    name: "Botson AI Analyzer API",
    version: "1.0.0",
    description: "Job Indexing Analytics API",
    endpoints: {
      dashboard: "/api/dashboard",
      clients: "/api/clients",
      countries: "/api/countries",
      health: "/api/health",
    },
    documentation: "https://docs.botson.ai/api",
  });
});

export default router;
