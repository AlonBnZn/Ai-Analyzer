import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Logger } from "./utils/logger";
import { Request, Response } from "express";
import JobIndexing from "./models/Jonindexing";
import axios from "axios";

const app = express();

// Basic security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Logging middleware (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// Test shared library
app.get("/api/shared-test", (req, res) => {
  try {
    const { DEFAULT_PAGINATION, CHART_COLORS } = require("@botson/shared");
    res.json({
      message: "Shared library is working!",
      pagination: DEFAULT_PAGINATION,
      colors: CHART_COLORS,
    });
  } catch (error) {
    res.status(500).json({
      error: "Shared library not working",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// seed route
app.get("/api/seed", async (_req: Request, res: Response) => {
  try {
    const DATA_URL = process.env.DATA_SOURCE_URL!;

    const { data } = await axios.get(DATA_URL);

    if (!Array.isArray(data)) {
      return res.status(400).json({ message: "Data is not an array" });
    }

    const result = await JobIndexing.importData(data);

    return res.status(201).json({
      message: "Data seeded successfully",
      stats: result,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return res.status(500).json({ message: "Failed to seed data", error });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Basic error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    Logger.error("Server error:", err);
    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
);

export default app;
