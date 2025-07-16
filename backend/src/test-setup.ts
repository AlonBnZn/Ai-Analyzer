import { Logger } from "./utils/logger";
import { IndexingLog, DEFAULT_PAGINATION, CHART_COLORS } from "@botson/shared";

Logger.info("🧪 Testing backend setup...");

// Test shared library import
Logger.info("Default pagination:", DEFAULT_PAGINATION);
Logger.info("Chart colors available:", Object.keys(CHART_COLORS));

// Test TypeScript types
const testLog: Partial<IndexingLog> = {
  country_code: "US",
  currency_code: "USD",
  status: "completed",
  transactionSourceName: "Deal1",
};

Logger.info("✅ TypeScript types working correctly");
Logger.info("📦 Shared library integration successful");
Logger.info("🎉 Backend setup is ready!");
