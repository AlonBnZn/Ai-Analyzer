// src/models/Jobindexing.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { IndexingLog } from "@botson/shared";

interface JobIndexingDocument extends Omit<IndexingLog, "_id">, Document {
  _id: string;
}

// Clean interface without static methods (they're now in repository)
interface JobIndexingModel extends Model<JobIndexingDocument> {}

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

// Indexes for better performance
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

// Virtual fields for calculated metrics (these stay in the model)
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

// Instance methods (these stay in the model)
jobIndexingSchema.methods.calculateMetrics = function () {
  return {
    successRate: this.successRate,
    enrichmentRate: this.enrichmentRate,
    filteringRate: this.filteringRate,
    indexSuccessRate: this.indexSuccessRate,
    metadataCoverage: this.metadataCoverage,
    processingEfficiency: this.processingEfficiency,
    failureAnalysis: this.failureAnalysis,
  };
};

jobIndexingSchema.methods.isHealthy = function () {
  return this.status === "completed" && this.successRate >= 90;
};

jobIndexingSchema.methods.getPerformanceLevel = function () {
  const successRate = this.successRate;
  if (successRate >= 95) return "excellent";
  if (successRate >= 90) return "good";
  if (successRate >= 80) return "fair";
  if (successRate >= 70) return "poor";
  return "critical";
};

// Pre-save middleware for validation
jobIndexingSchema.pre("save", function (next) {
  // Additional validation logic
  if (
    this.progress.TOTAL_JOBS_IN_FEED < this.progress.TOTAL_JOBS_SENT_TO_INDEX
  ) {
    next(
      new Error(
        "TOTAL_JOBS_SENT_TO_INDEX cannot be greater than TOTAL_JOBS_IN_FEED"
      )
    );
  }

  if (this.progress.TOTAL_RECORDS_IN_FEED < this.progress.TOTAL_JOBS_IN_FEED) {
    next(
      new Error(
        "TOTAL_JOBS_IN_FEED cannot be greater than TOTAL_RECORDS_IN_FEED"
      )
    );
  }

  next();
});

// Post-save middleware for logging
jobIndexingSchema.post("save", function (doc) {
  console.log(`JobIndexing document saved: ${doc._id} - ${doc.status}`);
});

const JobIndexing = mongoose.model<JobIndexingDocument, JobIndexingModel>(
  "JobIndexing",
  jobIndexingSchema,
  "job_indexing_logs"
);

export default JobIndexing;
export type { JobIndexingDocument, JobIndexingModel };
