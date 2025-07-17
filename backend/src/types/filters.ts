import { DashboardFilters } from "@botson/shared";
import { Request } from "express";
export interface QueryFilters {
  startDate?: string;
  endDate?: string;
  client?: string;
  country?: string;
  status?: "completed" | "failed" | "processing";
  granularity?: "hourly" | "daily" | "weekly";
  limit?: number;
}

export interface RequestWithFilters extends Request {
  filters?: DashboardFilters & {
    granularity?: string;
  };
}

export interface ParsedFilters extends DashboardFilters {
  granularity?: string;
}
