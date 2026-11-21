import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, NotFoundException } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CHECK_QUEUE, CheckJobData } from './constants/queue.constants.js';
import { MonitorsService } from './monitors.service.js';
import { CheckStrategyResolver } from './strategies/check-strategy.resolver.js';
import { Check } from './entities/check.entity.js';
import { assertSafeUrl } from './utils/ssrf-guard.js';

@Processor(CHECK_QUEUE, { concurrency: 5 })
export class CheckProcessor extends WorkerHost {
  private readonly logger = new Logger(CheckProcessor.name);

  constructor(
    private readonly monitorsService: MonitorsService,
    private readonly strategyResolver: CheckStrategyResolver,
    @InjectRepository(Check)
    private readonly checkRepository: Repository<Check>,
  ) {
    super();
  }

  async process(job: Job<CheckJobData>): Promise<void> {
    const { monitorId } = job.data;
    let monitor;
    try {
      monitor = await this.monitorsService.findOneForWorker(monitorId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `[WORKER] Monitor "${monitorId}" is deleted. Skipping.`,
        );
        return;
      }
      throw error;
    }
    if (!monitor.isActive) {
      this.logger.debug(
        `[WORKER] Monitor "${monitor.name} is paused, Skipping."`,
      );
      return;
    }

    //Execute the check
    await assertSafeUrl(monitor.url);
    const strategy = this.strategyResolver.resolve(monitor.type);
    const result = await strategy.execute(monitor);

    try {
      const check = this.checkRepository.create({
        monitor: { id: monitor.id } as any,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        isUp: result.isUp,
        errorMessage: result.errorMessage,
      });
      await this.checkRepository.save(check);

      this.logger.log(
        `[WORKER] Check completed for "${monitor.name}" - ${result.isUp ? 'UP' : 'DOWN'} (${result.responseTimeMs}ms, status: ${result.statusCode ?? 'N/A'})`,
      );
    } catch (error: any) {
      this.logger.error(
        `[WORKER] database save failed for "${monitorId}"`,
        error.stack,
      );
      throw error;
    }
  }
}
