/**
 * Logging utilities for API requests
 * Outputs structured JSON logs
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  route: string;
  method: string;
  correlationId: string;
  clientIp: string;
  status: number;
  latencyMs: number;
  errorCode?: string;
}

/**
 * Log a request completion
 */
export function logRequest(entry: LogEntry): void {
  // Output as single-line JSON
  console.log(JSON.stringify(entry));
}
