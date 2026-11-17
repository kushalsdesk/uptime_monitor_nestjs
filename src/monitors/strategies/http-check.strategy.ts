import { Injectable } from '@nestjs/common';
import { Monitor, MonitorType } from '../entities/monitor.entity.js';
import { CheckResult, CheckStrategy } from './check-strategy.interface.js';

@Injectable()
export class HttpCheckStrategy implements CheckStrategy {
  readonly type = MonitorType.HTTP;

  async execute(monitor: Monitor): Promise<CheckResult> {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutMs = 10000; // 10-second timeout
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(monitor.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'UptimeMonitor/1.0 (HealthChecker)',
        },
      });

      const responseTimeMs = Math.round(performance.now() - startTime);
      const statusCode = response.status;
      const isUp = statusCode >= 200 && statusCode < 400;

      return {
        statusCode,
        responseTimeMs,
        isUp,
        errorMessage: isUp ? null : `HTTP check failed with status ${statusCode}`,
      };
    } catch (error: any) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const isTimeout = error.name === 'AbortError';

      return {
        statusCode: 0,
        responseTimeMs,
        isUp: false,
        errorMessage: isTimeout
          ? `Request timed out after ${timeoutMs}ms`
          : error.message || 'Network connection failed',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
