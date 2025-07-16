import mongoose from "mongoose";
import { Logger } from "../utils/logger";

export async function connectDatabase(): Promise<void> {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/botson-ai";

  try {
    await mongoose.connect(mongoUri);
    Logger.info("✅ Connected to MongoDB successfully");
  } catch (error) {
    Logger.error("❌ MongoDB connection error", error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    Logger.info("✅ Disconnected from MongoDB");
  } catch (error) {
    Logger.error("❌ Error disconnecting from MongoDB", error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on("connected", () => {
  Logger.info("📊 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  Logger.error("❌ Mongoose connection error", err);
});

mongoose.connection.on("disconnected", () => {
  Logger.info("📊 Mongoose disconnected from MongoDB");
});

mongoose.connection.on("reconnected", () => {
  Logger.info("🔄 Mongoose reconnected to MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    Logger.info("👋 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    Logger.error("❌ Error during graceful shutdown", error);
    process.exit(1);
  }
});
