import { Injectable } from '@nestjs/common';
import { Monitor, MonitorType } from '../entities/monitor.entity.js';
import { CheckResult, CheckStrategy } from './check-strategy.interface.js';

@Injectable()
export class ApiCheckStrategy implements CheckStrategy {
  readonly type = MonitorType.API;

  async execute(monitor: Monitor): Promise<CheckResult> {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutMs = 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(monitor.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'UptimeMonitor-API/1.0',
        },
      });

      const responseTimeMs = Math.round(performance.now() - startTime);
      const statusCode = response.status;
      // In APIs, 2xx (200 OK, 201 Created, etc.) is considered healthy
      const isUp = statusCode >= 200 && statusCode < 300;

      return {
        statusCode,
        responseTimeMs,
        isUp,
        errorMessage: isUp ? null : `API returned unexpected status code ${statusCode}`,
      };
    } catch (error: any) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const isTimeout = error.name === 'AbortError';

      return {
        statusCode: 0,
        responseTimeMs,
        isUp: false,
        errorMessage: isTimeout
          ? `API request timed out after ${timeoutMs}ms`
          : error.message || 'API request failed',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
