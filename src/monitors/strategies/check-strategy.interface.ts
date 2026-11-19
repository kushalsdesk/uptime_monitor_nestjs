import { Monitor, MonitorType } from '../entities/monitor.entity.js';

/**
 * Standardized result returned by any check strategy.
 * Maps directly to our PostgreSQL `checks` table columns.
 */
export interface CheckResult {
  statusCode: number | null;
  responseTimeMs: number;
  isUp: boolean;
  errorMessage?: string | null;
}

/**
 * Contract that every check strategy must implement.
 * Follows the SOLID Open/Closed Principle (OCP):
 * new check types can be added without modifying existing code.
 */
export interface CheckStrategy {
  /**
   * Identifies which monitor type this strategy handles (HTTP, API, PING)
   */
  readonly type: MonitorType;

  /**
   * Executes the health check against the monitor target and produces a standardized CheckResult
   */
  execute(monitor: Monitor): Promise<CheckResult>;
}
