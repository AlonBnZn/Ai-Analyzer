import mongoose, { Schema, Document, Model } from "mongoose";
import { IndexingLog } from "@botson/shared";

interface JobIndexingDocument extends Omit<IndexingLog, "_id">, Document {
  _id: string;
}

interface JobIndexingModel extends Model<JobIndexingDocument> {
  getAggregatedMetrics(filters?: any): Promise<any>;
  getClientPerformance(filters?: any): Promise<any>;
  getTimeSeriesData(filters?: any): Promise<any>;
  importData(data: any[]): Promise<{
    upsertedCount: number;
    modifiedCount: number;
    matchedCount: number;
  }>;
  getTopPerformers(limit?: number): Promise<any[]>;
  getFailureAnalysis(filters?: any): Promise<any[]>;
}

const progressSchema = new Schema(
  {
    SWITCH_INDEX: { type: Boolean, default: false },
    TOTAL_RECORDS_IN_FEED: { type: Number, required: true, min: 0 },
    TOTAL_JOBS_IN_FEED: { type: Number, required: true, min: 0 },
    TOTAL_JOBS_FAIL_INDEXED: { type: Number, default: 0, min: 0 },
    TOTAL_JOBS_SENT_TO_ENRICH: { type: Number, default: 0, min: 0 },
    TOTAL_JOBS_DONT_HAVE_METADATA: { type: Number, default: 0, min: 0 },
    TOTAL_JOBS_DONT_HAVE_METADATA_V2: { type: Number, default: 0, min: 0 },
    TOTAL_JOBS_SENT_TO_INDEX: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const jobIndexingSchema = new Schema<JobIndexingDocument>(
  {
    _id: { type: String, required: true },
    country_code: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 2,
      maxlength: 3,
    },
    currency_code: {
      type: String,
      required: true,
      uppercase: true,
      length: 3,
      match: /^[A-Z]{3}$/,
    },
    progress: { type: progressSchema, required: true },
    status: {
      type: String,
      enum: ["completed", "failed", "processing"],
      required: true,
      lowercase: true,
    },
    timestamp: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return !isNaN(Date.parse(value));
        },
        message: "Timestamp must be a valid ISO 8601 date string",
      },
    },
    transactionSourceName: {
      type: String,
      required: true,
      trim: true,
    },
    noCoordinatesCount: { type: Number, default: 0, min: 0 },
    recordCount: { type: Number, default: 0, min: 0 },
    uniqueRefNumberCount: { type: Number, default: 0, min: 0 },
  },
  {
    collection: "job_indexing_logs",
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: Record<string, any>) {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

jobIndexingSchema.index({ timestamp: -1 });
jobIndexingSchema.index({ transactionSourceName: 1 });
jobIndexingSchema.index({ country_code: 1 });
jobIndexingSchema.index({ status: 1 });
jobIndexingSchema.index({ transactionSourceName: 1, timestamp: -1 });
jobIndexingSchema.index({ country_code: 1, timestamp: -1 });
jobIndexingSchema.index({ status: 1, timestamp: -1 });
jobIndexingSchema.index({ "progress.TOTAL_JOBS_IN_FEED": -1 });
jobIndexingSchema.index({ "progress.TOTAL_JOBS_SENT_TO_INDEX": -1 });
jobIndexingSchema.index({ "progress.TOTAL_JOBS_FAIL_INDEXED": -1 });
jobIndexingSchema.index({ transactionSourceName: "text" });

jobIndexingSchema
  .virtual("successRate")
  .get(function (this: JobIndexingDocument) {
    const totalJobs = this.progress.TOTAL_JOBS_IN_FEED;
    const failedJobs = this.progress.TOTAL_JOBS_FAIL_INDEXED;
    if (totalJobs === 0) return 0;
    const successfulJobs = totalJobs - failedJobs;
    return Number(((successfulJobs / totalJobs) * 100).toFixed(2));
  });

jobIndexingSchema
  .virtual("enrichmentRate")
  .get(function (this: JobIndexingDocument) {
    const totalJobs = this.progress.TOTAL_JOBS_IN_FEED;
    const enrichedJobs = this.progress.TOTAL_JOBS_SENT_TO_ENRICH;
    if (totalJobs === 0) return 0;
    return Number(((enrichedJobs / totalJobs) * 100).toFixed(2));
  });

jobIndexingSchema
  .virtual("filteringRate")
  .get(function (this: JobIndexingDocument) {
    const totalRecords = this.progress.TOTAL_RECORDS_IN_FEED;
    const filteredJobs = this.progress.TOTAL_JOBS_IN_FEED;
    if (totalRecords === 0) return 0;
    return Number(((filteredJobs / totalRecords) * 100).toFixed(2));
  });

jobIndexingSchema
  .virtual("indexSuccessRate")
  .get(function (this: JobIndexingDocument) {
    const filteredJobs = this.progress.TOTAL_JOBS_IN_FEED;
    const indexedJobs = this.progress.TOTAL_JOBS_SENT_TO_INDEX;
    if (filteredJobs === 0) return 0;
    return Number(((indexedJobs / filteredJobs) * 100).toFixed(2));
  });

jobIndexingSchema
  .virtual("metadataCoverage")
  .get(function (this: JobIndexingDocument) {
    const totalJobs = this.progress.TOTAL_JOBS_IN_FEED;
    const jobsWithoutMetadata = this.progress.TOTAL_JOBS_DONT_HAVE_METADATA;
    if (totalJobs === 0) return 0;
    const jobsWithMetadata = totalJobs - jobsWithoutMetadata;
    return Number(((jobsWithMetadata / totalJobs) * 100).toFixed(2));
  });

jobIndexingSchema
  .virtual("processingEfficiency")
  .get(function (this: JobIndexingDocument) {
    const totalRecords = this.progress.TOTAL_RECORDS_IN_FEED;
    const indexedJobs = this.progress.TOTAL_JOBS_SENT_TO_INDEX;
    if (totalRecords === 0) return 0;
    return Number(((indexedJobs / totalRecords) * 100).toFixed(2));
  });

jobIndexingSchema
  .virtual("failureAnalysis")
  .get(function (this: JobIndexingDocument) {
    const totalRecords = this.progress.TOTAL_RECORDS_IN_FEED;
    const totalJobs = this.progress.TOTAL_JOBS_IN_FEED;
    const failedJobs = this.progress.TOTAL_JOBS_FAIL_INDEXED;
    const indexedJobs = this.progress.TOTAL_JOBS_SENT_TO_INDEX;

    return {
      recordsFiltered: totalRecords - totalJobs,
      jobsFailed: failedJobs,
      jobsSuccessful: indexedJobs,
      filteringLoss:
        totalRecords > 0
          ? (((totalRecords - totalJobs) / totalRecords) * 100).toFixed(2)
          : 0,
      indexingLoss:
        totalJobs > 0 ? ((failedJobs / totalJobs) * 100).toFixed(2) : 0,
    };
  });

jobIndexingSchema.statics.getAggregatedMetrics = async function (
  filters: any = {}
) {
  const matchStage: any = {};

  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: filters.startDate,
      $lte: filters.endDate,
    };
  }

  if (filters.client) {
    matchStage.transactionSourceName = {
      $regex: filters.client,
      $options: "i",
    };
  }

  if (filters.country) {
    matchStage.country_code = filters.country.toUpperCase();
  }

  if (filters.status) {
    matchStage.status = filters.status.toLowerCase();
  }

  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalLogs: { $sum: 1 },
        totalJobsIndexed: { $sum: "$progress.TOTAL_JOBS_SENT_TO_INDEX" },
        totalJobsFailed: { $sum: "$progress.TOTAL_JOBS_FAIL_INDEXED" },
        totalJobsInFeed: { $sum: "$progress.TOTAL_JOBS_IN_FEED" },
        totalRecords: { $sum: "$progress.TOTAL_RECORDS_IN_FEED" },
        activeClients: { $addToSet: "$transactionSourceName" },
      },
    },
    {
      $project: {
        totalLogs: 1,
        totalJobsIndexed: 1,
        totalJobsFailed: 1,
        totalRecords: 1,
        successRate: {
          $multiply: [
            {
              $divide: [
                { $subtract: ["$totalJobsInFeed", "$totalJobsFailed"] },
                "$totalJobsInFeed",
              ],
            },
            100,
          ],
        },
        averageProcessingTime: { $literal: 0 },
        activeClients: { $size: "$activeClients" },
      },
    },
  ]);

  return (
    result[0] || {
      totalLogs: 0,
      totalJobsIndexed: 0,
      totalJobsFailed: 0,
      successRate: 0,
      averageProcessingTime: 0,
      activeClients: 0,
    }
  );
};

jobIndexingSchema.statics.getClientPerformance = async function (
  filters: any = {}
) {
  const matchStage: any = {};

  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: filters.startDate,
      $lte: filters.endDate,
    };
  }

  if (filters.country) {
    matchStage.country_code = filters.country.toUpperCase();
  }

  if (filters.status) {
    matchStage.status = filters.status.toLowerCase();
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$transactionSourceName",
        totalJobs: { $sum: "$progress.TOTAL_JOBS_IN_FEED" },
        successfulJobs: {
          $sum: {
            $subtract: [
              "$progress.TOTAL_JOBS_IN_FEED",
              "$progress.TOTAL_JOBS_FAIL_INDEXED",
            ],
          },
        },
        failedJobs: { $sum: "$progress.TOTAL_JOBS_FAIL_INDEXED" },
        totalTransactions: { $sum: 1 },
        totalRecords: { $sum: "$progress.TOTAL_RECORDS_IN_FEED" },
        lastTransaction: { $max: "$timestamp" },
      },
    },
    {
      $project: {
        client: "$_id",
        totalJobs: 1,
        successfulJobs: 1,
        failedJobs: 1,
        totalTransactions: 1,
        totalRecords: 1,
        lastTransaction: 1,
        successRate: {
          $multiply: [{ $divide: ["$successfulJobs", "$totalJobs"] }, 100],
        },
        averageJobsPerHour: {
          $divide: ["$totalJobs", "$totalTransactions"],
        },
      },
    },
    { $sort: { totalJobs: -1 } },
  ]);
};

jobIndexingSchema.statics.getTimeSeriesData = async function (
  filters: any = {}
) {
  const matchStage: any = {};

  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: filters.startDate,
      $lte: filters.endDate,
    };
  }

  if (filters.client) {
    matchStage.transactionSourceName = {
      $regex: filters.client,
      $options: "i",
    };
  }

  if (filters.country) {
    matchStage.country_code = filters.country.toUpperCase();
  }

  const granularity = filters.granularity || "daily";
  let dateGroup: any;

  switch (granularity) {
    case "hourly":
      dateGroup = {
        $dateToString: {
          format: "%Y-%m-%d %H:00:00",
          date: { $dateFromString: { dateString: "$timestamp" } },
        },
      };
      break;
    case "daily":
      dateGroup = {
        $dateToString: {
          format: "%Y-%m-%d",
          date: { $dateFromString: { dateString: "$timestamp" } },
        },
      };
      break;
    case "weekly":
      dateGroup = {
        $dateToString: {
          format: "%Y-W%U",
          date: { $dateFromString: { dateString: "$timestamp" } },
        },
      };
      break;
    default:
      dateGroup = {
        $dateToString: {
          format: "%Y-%m-%d",
          date: { $dateFromString: { dateString: "$timestamp" } },
        },
      };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: dateGroup,
        totalJobs: { $sum: "$progress.TOTAL_JOBS_IN_FEED" },
        successfulJobs: {
          $sum: {
            $subtract: [
              "$progress.TOTAL_JOBS_IN_FEED",
              "$progress.TOTAL_JOBS_FAIL_INDEXED",
            ],
          },
        },
        failedJobs: { $sum: "$progress.TOTAL_JOBS_FAIL_INDEXED" },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        timestamp: "$_id",
        totalJobs: 1,
        successfulJobs: 1,
        failedJobs: 1,
        transactionCount: 1,
        client: filters.client || null,
      },
    },
    { $sort: { timestamp: 1 } },
  ]);
};

jobIndexingSchema.statics.importData = async function (data: any[]) {
  const operations = data.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: item },
      upsert: true,
    },
  }));

  const result = await this.bulkWrite(operations);

  return {
    upsertedCount: result.upsertedCount,
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount,
  };
};

jobIndexingSchema.statics.getTopPerformers = async function (
  limit: number = 10
) {
  return this.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$transactionSourceName",
        totalJobs: { $sum: "$progress.TOTAL_JOBS_IN_FEED" },
        successfulJobs: {
          $sum: {
            $subtract: [
              "$progress.TOTAL_JOBS_IN_FEED",
              "$progress.TOTAL_JOBS_FAIL_INDEXED",
            ],
          },
        },
        failedJobs: { $sum: "$progress.TOTAL_JOBS_FAIL_INDEXED" },
        totalTransactions: { $sum: 1 },
        lastTransaction: { $max: "$timestamp" },
      },
    },
    {
      $project: {
        client: "$_id",
        totalJobs: 1,
        successfulJobs: 1,
        failedJobs: 1,
        totalTransactions: 1,
        lastTransaction: 1,
        successRate: {
          $multiply: [{ $divide: ["$successfulJobs", "$totalJobs"] }, 100],
        },
      },
    },
    { $sort: { successRate: -1, totalJobs: -1 } },
    { $limit: limit },
  ]);
};

jobIndexingSchema.statics.getFailureAnalysis = async function (
  filters: any = {}
) {
  const matchStage: any = {};

  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: filters.startDate,
      $lte: filters.endDate,
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          client: "$transactionSourceName",
          country: "$country_code",
        },
        totalRecords: { $sum: "$progress.TOTAL_RECORDS_IN_FEED" },
        totalJobs: { $sum: "$progress.TOTAL_JOBS_IN_FEED" },
        failedJobs: { $sum: "$progress.TOTAL_JOBS_FAIL_INDEXED" },
        jobsWithoutMetadata: {
          $sum: "$progress.TOTAL_JOBS_DONT_HAVE_METADATA",
        },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        client: "$_id.client",
        country: "$_id.country",
        totalRecords: 1,
        totalJobs: 1,
        failedJobs: 1,
        jobsWithoutMetadata: 1,
        transactionCount: 1,
        filterLossRate: {
          $multiply: [
            {
              $divide: [
                { $subtract: ["$totalRecords", "$totalJobs"] },
                "$totalRecords",
              ],
            },
            100,
          ],
        },
        indexFailureRate: {
          $multiply: [{ $divide: ["$failedJobs", "$totalJobs"] }, 100],
        },
        metadataMissingRate: {
          $multiply: [{ $divide: ["$jobsWithoutMetadata", "$totalJobs"] }, 100],
        },
      },
    },
    {
      $match: {
        $or: [
          { indexFailureRate: { $gt: 0 } },
          { metadataMissingRate: { $gt: 10 } },
          { filterLossRate: { $gt: 50 } },
        ],
      },
    },
    { $sort: { indexFailureRate: -1 } },
  ]);
};

const JobIndexing = mongoose.model<JobIndexingDocument, JobIndexingModel>(
  "JobIndexing",
  jobIndexingSchema,
  "job_indexing_logs"
);

export default JobIndexing;
export type { JobIndexingDocument, JobIndexingModel };
