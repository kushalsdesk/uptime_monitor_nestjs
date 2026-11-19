import { Injectable } from '@nestjs/common';
import { Monitor, MonitorType } from '../entities/monitor.entity.js';
import { CheckResult, CheckStrategy } from './check-strategy.interface.js';

@Injectable()
export class PingCheckStrategy implements CheckStrategy {
  readonly type = MonitorType.PING;

  async execute(monitor: Monitor): Promise<CheckResult> {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutMs = 5000; // 5-second fast timeout for ping
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // HEAD request verifies host presence with zero body download
      const response = await fetch(monitor.url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'UptimeMonitor-Ping/1.0',
        },
      });

      await response.body?.cancel();

      const responseTimeMs = Math.round(performance.now() - startTime);
      const statusCode = response.status;
      // If the host responds with any valid HTTP status, the host is reachable
      const isUp = statusCode > 0;

      return {
        statusCode,
        responseTimeMs,
        isUp,
        errorMessage: null,
      };
    } catch (error: any) {
      const responseTimeMs = Math.round(performance.now() - startTime);
      const isTimeout = error.name === 'AbortError';

      return {
        statusCode: null,
        responseTimeMs,
        isUp: false,
        errorMessage: isTimeout
          ? `Ping timed out after ${timeoutMs}ms`
          : error.message || 'Host is unreachable',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
