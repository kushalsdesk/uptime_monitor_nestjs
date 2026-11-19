import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  CHECK_JOB,
  CHECK_QUEUE,
  CheckJobData,
} from './constants/queue.constants.js';
import { Monitor } from './entities/monitor.entity.js';

@Injectable()
export class CheckProducerService {
  private readonly logger = new Logger(CheckProducerService.name);

  constructor(
    @InjectQueue(CHECK_QUEUE)
    private readonly checkQueue: Queue<CheckJobData>,
  ) {}

  /**
   * Schedules or updates a repeatable check job for an active monitor.
   * If the monitor already has a scheduler, BullMQ updates its interval atomically.
   */
  async scheduleMonitor(monitor: Monitor): Promise<void> {
    const intervalMs = monitor.intervalSec * 1000;

    await this.checkQueue.upsertJobScheduler(
      monitor.id,
      { every: intervalMs },
      {
        name: CHECK_JOB,
        data: {
          monitorId: monitor.id,
          url: monitor.url,
          type: monitor.type,
        },
        opts: {
          removeOnComplete: true, // Discard completed jobs to preserve Redis memory
          removeOnFail: 50,       // Retain last 50 failed jobs for debugging
        },
      },
    );

    this.logger.log(
      `Scheduled recurring check for monitor "${monitor.name}" (${monitor.id}) every ${monitor.intervalSec}s`,
    );
  }

  /**
   * Removes the repeatable check scheduler from Redis (e.g. on monitor delete or pause).
   */
  async removeMonitor(monitorId: string): Promise<void> {
    await this.checkQueue.removeJobScheduler(monitorId);
    this.logger.log(`Removed recurring check scheduler for monitor ID: ${monitorId}`);
  }
}
