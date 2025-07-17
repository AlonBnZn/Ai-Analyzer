// backend/src/utils/importData.ts
import dotenv from "dotenv";
import axios from "axios";
import { connectDatabase, disconnectDatabase } from "../config/database";
import JobIndexing from "../models/Jobindexing.model";
import { Logger } from "./logger";
import { IndexingLog } from "@botson/shared";

// Load environment variables
dotenv.config();

interface ImportResult {
  total: number;
  imported: number;
  updated: number;
  errors: number;
  skipped: number;
}

/**
 * Transform raw data to match our schema
 */
function transformDataItem(item: any): Partial<IndexingLog> {
  try {
    // Generate a unique ID if not present
    const id =
      item._id ||
      item.id ||
      `${item.transactionSourceName}_${item.timestamp || Date.now()}`;

    return {
      _id: id,
      country_code: (
        item.country_code ||
        item.countryCode ||
        "US"
      ).toUpperCase(),
      currency_code: (
        item.currency_code ||
        item.currencyCode ||
        "USD"
      ).toUpperCase(),
      progress: {
        SWITCH_INDEX: item.progress?.SWITCH_INDEX || false,
        TOTAL_RECORDS_IN_FEED:
          item.progress?.TOTAL_RECORDS_IN_FEED || item.totalRecords || 0,
        TOTAL_JOBS_IN_FEED:
          item.progress?.TOTAL_JOBS_IN_FEED || item.totalJobs || 0,
        TOTAL_JOBS_FAIL_INDEXED:
          item.progress?.TOTAL_JOBS_FAIL_INDEXED || item.failedJobs || 0,
        TOTAL_JOBS_SENT_TO_ENRICH:
          item.progress?.TOTAL_JOBS_SENT_TO_ENRICH || item.enrichedJobs || 0,
        TOTAL_JOBS_DONT_HAVE_METADATA:
          item.progress?.TOTAL_JOBS_DONT_HAVE_METADATA ||
          item.noMetadataJobs ||
          0,
        TOTAL_JOBS_DONT_HAVE_METADATA_V2:
          item.progress?.TOTAL_JOBS_DONT_HAVE_METADATA_V2 ||
          item.noMetadataJobsV2 ||
          0,
        TOTAL_JOBS_SENT_TO_INDEX:
          item.progress?.TOTAL_JOBS_SENT_TO_INDEX || item.indexedJobs || 0,
      },
      status: (item.status || "completed").toLowerCase() as
        | "completed"
        | "failed"
        | "processing",
      timestamp: item.timestamp || new Date().toISOString(),
      transactionSourceName: (
        item.transactionSourceName ||
        item.clientName ||
        item.source ||
        "Unknown"
      ).trim(),
      noCoordinatesCount: item.noCoordinatesCount || 0,
      recordCount:
        item.recordCount || item.progress?.TOTAL_RECORDS_IN_FEED || 0,
      uniqueRefNumberCount: item.uniqueRefNumberCount || 0,
    };
  } catch (error) {
    Logger.error("Error transforming data item:", error);
    throw error;
  }
}

/**
 * Validate transformed data
 */
function validateData(item: Partial<IndexingLog>): boolean {
  try {
    // Basic validation
    if (!item._id || !item.transactionSourceName) {
      return false;
    }

    // Country code validation
    if (
      !item.country_code ||
      item.country_code.length < 2 ||
      item.country_code.length > 3
    ) {
      return false;
    }

    // Currency code validation
    if (!item.currency_code || !/^[A-Z]{3}$/.test(item.currency_code)) {
      return false;
    }

    // Status validation
    if (!["completed", "failed", "processing"].includes(item.status || "")) {
      return false;
    }

    // Progress validation
    if (
      !item.progress ||
      typeof item.progress.TOTAL_JOBS_SENT_TO_INDEX !== "number"
    ) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Fetch data from external source
 */
async function fetchDataFromSource(url: string): Promise<any[]> {
  try {
    Logger.info(`📥 Fetching data from: ${url}`);

    const response = await axios.get(url, {
      timeout: 30000, // 30 seconds timeout
      headers: {
        "User-Agent": "Botson-AI-Importer/1.0",
        Accept: "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = response.data;

    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.results && Array.isArray(data.results)) {
      return data.results;
    } else {
      throw new Error(
        "Invalid data format - expected array or object with data/results array"
      );
    }
  } catch (error) {
    Logger.error("Error fetching data from source:", error);
    throw error;
  }
}

/**
 * Generate sample data if no external source is available
 */
function generateSampleData(count: number = 100): any[] {
  const clients = [
    "Client A",
    "Client B",
    "Client C",
    "Deal Corp",
    "JobSource Ltd",
  ];
  const countries = ["US", "UK", "CA", "AU", "DE"];
  const currencies = ["USD", "GBP", "CAD", "AUD", "EUR"];
  const statuses = ["completed", "failed", "processing"];

  return Array.from({ length: count }, (_, i) => {
    const totalRecords = Math.floor(Math.random() * 10000) + 1000;
    const totalJobs = Math.floor(totalRecords * (0.7 + Math.random() * 0.3));
    const failedJobs = Math.floor(totalJobs * (Math.random() * 0.1));
    const indexedJobs = totalJobs - failedJobs;

    return {
      _id: `sample_${i + 1}_${Date.now()}`,
      country_code: countries[Math.floor(Math.random() * countries.length)],
      currency_code: currencies[Math.floor(Math.random() * currencies.length)],
      progress: {
        SWITCH_INDEX: Math.random() > 0.5,
        TOTAL_RECORDS_IN_FEED: totalRecords,
        TOTAL_JOBS_IN_FEED: totalJobs,
        TOTAL_JOBS_FAIL_INDEXED: failedJobs,
        TOTAL_JOBS_SENT_TO_ENRICH: Math.floor(indexedJobs * 0.8),
        TOTAL_JOBS_DONT_HAVE_METADATA: Math.floor(totalJobs * 0.1),
        TOTAL_JOBS_DONT_HAVE_METADATA_V2: Math.floor(totalJobs * 0.05),
        TOTAL_JOBS_SENT_TO_INDEX: indexedJobs,
      },
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      transactionSourceName:
        clients[Math.floor(Math.random() * clients.length)],
      noCoordinatesCount: Math.floor(Math.random() * 100),
      recordCount: totalRecords,
      uniqueRefNumberCount: Math.floor(totalRecords * 0.9),
    };
  });
}

/**
 * Import data in batches for better performance
 */
async function importDataInBatches(
  data: Partial<IndexingLog>[],
  batchSize: number = 100
): Promise<ImportResult> {
  const result: ImportResult = {
    total: data.length,
    imported: 0,
    updated: 0,
    errors: 0,
    skipped: 0,
  };

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    try {
      Logger.info(
        `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          data.length / batchSize
        )} (${batch.length} items)`
      );

      const operations = batch.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: item },
          upsert: true,
        },
      }));

      const bulkResult = await JobIndexing.bulkWrite(operations, {
        ordered: false, // Continue processing even if some operations fail
      });

      result.imported += bulkResult.upsertedCount;
      result.updated += bulkResult.modifiedCount;

      Logger.info(
        `✅ Batch completed: ${bulkResult.upsertedCount} inserted, ${bulkResult.modifiedCount} updated`
      );
    } catch (error) {
      Logger.error(
        `❌ Error processing batch ${Math.floor(i / batchSize) + 1}:`,
        error
      );
      result.errors += batch.length;
    }
  }

  return result;
}

/**
 * Main import function
 */
async function importData(): Promise<void> {
  const startTime = Date.now();

  try {
    Logger.info("🚀 Starting data import process...");

    // Connect to database
    await connectDatabase();

    // Check if data already exists
    const existingCount = await JobIndexing.countDocuments();
    if (existingCount > 0) {
      Logger.info(`📊 Found ${existingCount} existing records in database`);
      Logger.info(
        "⚠️  Database already contains data. Skipping import to avoid duplicates."
      );
      Logger.info(
        "💡 If you need to reimport, please clear the database first."
      );
      return;
    }

    let rawData: any[] = [];

    // Try to fetch from external source first
    const dataSourceUrl = process.env.DATA_SOURCE_URL;
    if (dataSourceUrl) {
      try {
        rawData = await fetchDataFromSource(dataSourceUrl);
        Logger.info(
          `📥 Fetched ${rawData.length} records from external source`
        );
      } catch (error) {
        Logger.warn(
          "⚠️  Failed to fetch from external source, falling back to sample data"
        );
        Logger.error("External fetch error:", error);
        rawData = generateSampleData(100);
      }
    } else {
      Logger.info(
        "📝 No external data source configured, generating sample data"
      );
      rawData = generateSampleData(100);
    }

    if (rawData.length === 0) {
      Logger.error("❌ No data to import");
      return;
    }

    // Transform and validate data
    Logger.info("🔄 Transforming and validating data...");
    const transformedData: Partial<IndexingLog>[] = [];
    let validationErrors = 0;

    for (const item of rawData) {
      try {
        const transformed = transformDataItem(item);
        if (validateData(transformed)) {
          transformedData.push(transformed);
        } else {
          validationErrors++;
          Logger.warn(`⚠️  Skipping invalid item: ${item._id || "unknown"}`);
        }
      } catch (error) {
        validationErrors++;
        Logger.error(`❌ Error processing item:`, error);
      }
    }

    Logger.info(
      `✅ Transformed ${transformedData.length} valid records (${validationErrors} validation errors)`
    );

    if (transformedData.length === 0) {
      Logger.error("❌ No valid data to import after transformation");
      return;
    }

    // Import data in batches
    const result = await importDataInBatches(transformedData, 100);

    // Log results
    const duration = Date.now() - startTime;
    Logger.info("📊 Import Results:");
    Logger.info(`   Total records processed: ${result.total}`);
    Logger.info(`   Successfully imported: ${result.imported}`);
    Logger.info(`   Updated existing: ${result.updated}`);
    Logger.info(`   Errors: ${result.errors}`);
    Logger.info(`   Skipped: ${result.skipped}`);
    Logger.info(`   Duration: ${(duration / 1000).toFixed(2)}s`);

    // Verify final count
    const finalCount = await JobIndexing.countDocuments();
    Logger.info(
      `🎉 Import completed! Database now contains ${finalCount} records.`
    );
  } catch (error) {
    Logger.error("💥 Import failed:", error);
    throw error;
  } finally {
    // Always disconnect from database
    await disconnectDatabase();
  }
}

/**
 * Run the import if this file is executed directly
 */
if (require.main === module) {
  importData()
    .then(() => {
      Logger.info("✨ Data import completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      Logger.error("💥 Data import failed:", error);
      process.exit(1);
    });
}

export { importData, transformDataItem, validateData, generateSampleData };
