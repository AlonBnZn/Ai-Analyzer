// src/types/health.ts
export interface HealthCheckResponse {
  status: "OK" | "ERROR";
  timestamp: string;
  uptime?: number;
  version?: string;
  environment?: string;
}
