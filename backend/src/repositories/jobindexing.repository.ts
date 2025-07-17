// src/repositories/jobIndexing.repository.ts
import JobIndexing, { JobIndexingDocument } from "../models/Jobindexing.model";
import { DashboardFilters } from "@botson/shared";
import { ParsedFilters } from "../types/filters";

// Helper function for exact client matching
const buildClientMatchStage = (filters: DashboardFilters) => {
  const matchStage: any = {};

  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: filters.startDate,
      $lte: filters.endDate,
    };
  }

  // Use exact matching for client
  if (filters.client) {
    matchStage.transactionSourceName = filters.client;
  }

  if (filters.country) {
    matchStage.country_code = filters.country.toUpperCase();
  }

  if (filters.status) {
    matchStage.status = filters.status.toLowerCase();
  }

  return matchStage;
};

export class JobIndexingRepository {
  // Basic CRUD operations
  async findById(id: string): Promise<JobIndexingDocument | null> {
    return await JobIndexing.findById(id).lean();
  }

  async findMany(
    filters: DashboardFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    data: JobIndexingDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const matchStage = buildClientMatchStage(filters);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      JobIndexing.find(matchStage)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobIndexing.countDocuments(matchStage),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(
    data: Partial<JobIndexingDocument>
  ): Promise<JobIndexingDocument> {
    const document = new JobIndexing(data);
    return await document.save();
  }

  async update(
    id: string,
    data: Partial<JobIndexingDocument>
  ): Promise<JobIndexingDocument | null> {
    return await JobIndexing.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await JobIndexing.findByIdAndDelete(id);
    return result !== null;
  }

  // Aggregation methods (moved from static methods)
  async getAggregatedMetrics(filters: DashboardFilters = {}) {
    const matchStage = buildClientMatchStage(filters);

    const result = await JobIndexing.aggregate([
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
            $cond: [
              { $eq: ["$totalJobsInFeed", 0] },
              0,
              {
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
  }

  async getClientPerformance(filters: DashboardFilters = {}) {
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

    // Note: Usually we want to see all clients for comparison
    // if (filters.client) {
    //   matchStage.transactionSourceName = filters.client;
    // }

    return await JobIndexing.aggregate([
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
            $cond: [
              { $eq: ["$totalJobs", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$successfulJobs", "$totalJobs"] },
                  100,
                ],
              },
            ],
          },
          averageJobsPerHour: {
            $cond: [
              { $eq: ["$totalTransactions", 0] },
              0,
              { $divide: ["$totalJobs", "$totalTransactions"] },
            ],
          },
        },
      },
      { $sort: { totalJobs: -1 } },
    ]);
  }

  async getTimeSeriesData(filters: ParsedFilters = {}) {
    const matchStage = buildClientMatchStage(filters);
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

    return await JobIndexing.aggregate([
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
  }

  async getStatusDistribution(filters: DashboardFilters = {}) {
    const matchStage = buildClientMatchStage(filters);

    return await JobIndexing.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "completed"] }, then: "Completed" },
                { case: { $eq: ["$_id", "failed"] }, then: "Failed" },
                { case: { $eq: ["$_id", "processing"] }, then: "Processing" },
              ],
              default: "Unknown",
            },
          },
          value: "$count",
          color: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "completed"] }, then: "#10b981" },
                { case: { $eq: ["$_id", "failed"] }, then: "#ef4444" },
                { case: { $eq: ["$_id", "processing"] }, then: "#f59e0b" },
              ],
              default: "#6b7280",
            },
          },
        },
      },
    ]);
  }

  async getTopPerformers(limit: number = 10) {
    return await JobIndexing.aggregate([
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
            $cond: [
              { $eq: ["$totalJobs", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$successfulJobs", "$totalJobs"] },
                  100,
                ],
              },
            ],
          },
        },
      },
      { $sort: { successRate: -1, totalJobs: -1 } },
      { $limit: limit },
    ]);
  }

  async getFailureAnalysis(filters: DashboardFilters = {}) {
    const matchStage = buildClientMatchStage(filters);

    return await JobIndexing.aggregate([
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
            $cond: [
              { $eq: ["$totalRecords", 0] },
              0,
              {
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
            ],
          },
          indexFailureRate: {
            $cond: [
              { $eq: ["$totalJobs", 0] },
              0,
              {
                $multiply: [{ $divide: ["$failedJobs", "$totalJobs"] }, 100],
              },
            ],
          },
          metadataMissingRate: {
            $cond: [
              { $eq: ["$totalJobs", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$jobsWithoutMetadata", "$totalJobs"] },
                  100,
                ],
              },
            ],
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
  }

  // Utility methods
  async getUniqueClients(): Promise<string[]> {
    return await JobIndexing.distinct("transactionSourceName");
  }

  async getUniqueCountries(): Promise<string[]> {
    return await JobIndexing.distinct("country_code");
  }

  async bulkImport(data: any[]) {
    const operations = data.map((item) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: item },
        upsert: true,
      },
    }));

    const result = await JobIndexing.bulkWrite(operations);

    return {
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    };
  }

  // Advanced queries
  async getClientStats(clientName: string) {
    const result = await JobIndexing.aggregate([
      { $match: { transactionSourceName: clientName } },
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
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
          avgProcessingTime: { $avg: "$progress.TOTAL_JOBS_SENT_TO_INDEX" },
          firstTransaction: { $min: "$timestamp" },
          lastTransaction: { $max: "$timestamp" },
        },
      },
    ]);

    return result[0] || null;
  }

  async getPerformanceTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await JobIndexing.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate.toISOString() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $dateFromString: { dateString: "$timestamp" } },
            },
          },
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
          avgSuccessRate: {
            $avg: {
              $multiply: [
                {
                  $divide: [
                    {
                      $subtract: [
                        "$progress.TOTAL_JOBS_IN_FEED",
                        "$progress.TOTAL_JOBS_FAIL_INDEXED",
                      ],
                    },
                    "$progress.TOTAL_JOBS_IN_FEED",
                  ],
                },
                100,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

export default JobIndexingRepository;
