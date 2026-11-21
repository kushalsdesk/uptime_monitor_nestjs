import { MonitorType } from '../entities/monitor.entity.js';

export const CHECK_QUEUE = 'check-queue';
export const CHECK_JOB = 'execute-check';

/**
 * Data payload passed to BullMQ for recurring check execution.
 * Minimal payload to keep Redis memory footprint minimal.
 */
export interface CheckJobData {
  monitorId: string;
}
