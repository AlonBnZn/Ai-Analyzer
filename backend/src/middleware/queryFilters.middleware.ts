import { Request, Response, NextFunction } from "express";
import { RequestWithFilters, ParsedFilters } from "../types/filters";

export const validateAndParseFilters = (
  req: RequestWithFilters,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: ParsedFilters = {};

    // Date filters
    if (req.query.startDate && typeof req.query.startDate === "string") {
      const startDate = new Date(req.query.startDate);
      if (!isNaN(startDate.getTime())) {
        filters.startDate = startDate.toISOString();
      }
    }

    if (req.query.endDate && typeof req.query.endDate === "string") {
      const endDate = new Date(req.query.endDate);
      if (!isNaN(endDate.getTime())) {
        filters.endDate = endDate.toISOString();
      }
    }

    // String filters
    if (req.query.client && typeof req.query.client === "string") {
      filters.client = req.query.client.trim();
    }

    if (req.query.country && typeof req.query.country === "string") {
      filters.country = req.query.country.trim().toUpperCase();
    }

    if (req.query.status && typeof req.query.status === "string") {
      const validStatuses = ["completed", "failed", "processing"];
      const status = req.query.status.toLowerCase();
      if (validStatuses.includes(status)) {
        filters.status = status;
      }
    }

    // Pagination
    if (req.query.page && typeof req.query.page === "string") {
      const page = parseInt(req.query.page, 10);
      if (!isNaN(page) && page > 0) {
        filters.page = page;
      }
    }

    if (req.query.limit && typeof req.query.limit === "string") {
      const limit = parseInt(req.query.limit, 10);
      if (!isNaN(limit) && limit > 0 && limit <= 1000) {
        filters.limit = limit;
      }
    }

    // Additional filters
    if (req.query.granularity && typeof req.query.granularity === "string") {
      const validGranularities = ["hourly", "daily", "weekly"];
      if (validGranularities.includes(req.query.granularity)) {
        filters.granularity = req.query.granularity;
      }
    }

    req.filters = filters;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Invalid query parameters",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
