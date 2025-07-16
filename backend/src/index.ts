import dotenv from "dotenv";
import app from "./app";
import { connectDatabase } from "./config/database";
import { Logger } from "./utils/logger";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    // Start server
    const server = app.listen(PORT, () => {
      Logger.info(`🚀 Server running on port ${PORT}`);
      Logger.info(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      Logger.info(
        `🌐 CORS Origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`
      );
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal: string) => {
      Logger.info(`📨 Received ${signal}, shutting down gracefully`);
      server.close(() => {
        Logger.info("👋 HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    Logger.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  Logger.error("❌ Unhandled Rejection at:", { promise, reason });
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  Logger.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

startServer();
