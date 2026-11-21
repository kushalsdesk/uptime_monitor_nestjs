import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CHECK_JOB,
  CHECK_QUEUE,
  CheckJobData,
} from './constants/queue.constants.js';
import { Monitor } from './entities/monitor.entity.js';

@Injectable()
export class CheckProducerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(CheckProducerService.name);

  constructor(
    @InjectQueue(CHECK_QUEUE)
    private readonly checkQueue: Queue<CheckJobData>,
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Bootstrapping BullMQ schedulers from PostgreSQL...');
    const activeMonitors = await this.monitorRepository.find({
      where: { isActive: true },
    });

    for (const monitor of activeMonitors) {
      await this.scheduleMonitor(monitor);
    }
    this.logger.log(
      `Synced ${activeMonitors.length} recurring jobs into Redis.`,
    );
  }

  async onApplicationShutdown() {
    await this.checkQueue.close();
    this.logger.log('BullMQ Queue connection closed gracefully.');
  }

  async scheduleMonitor(monitor: Monitor): Promise<void> {
    const intervalMs = monitor.intervalSec * 1000;

    await this.checkQueue.upsertJobScheduler(
      monitor.id,
      { every: intervalMs },
      {
        name: CHECK_JOB,
        data: {
          monitorId: monitor.id,
        },
        opts: {
          removeOnComplete: true,
          removeOnFail: 50,
        },
      },
    );
  }

  async removeMonitor(monitorId: string): Promise<void> {
    await this.checkQueue.removeJobScheduler(monitorId);
    this.logger.log(
      `Removed recurring check scheduler for monitor ID: ${monitorId}`,
    );
  }
}
