// Health Types - frontend/src/types/health.ts
export interface HealthCheckResponse {
  status: "OK" | "ERROR" | "healthy" | "unhealthy";
  timestamp: string;
  uptime?: number;
  version?: string;
  environment?: string;
  service?: string;
  checks?: {
    database?: string;
    repository?: string;
    service?: string;
  };
}
