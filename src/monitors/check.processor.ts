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
    this.logger.debug(`Processing recurring check for monitor ${monitorId}...`);

    try {
      // 1. Fetch fresh monitor from database (bypass user ownership check)
      const monitor = await this.monitorsService.findOneForWorker(monitorId);

      // 2. If monitor is paused/inactive, skip check execution
      if (!monitor.isActive) {
        this.logger.debug(
          `Monitor "${monitor.name}" (${monitor.id}) is paused (isActive=false). Skipping check.`,
        );
        return;
      }

      // 3. Defense in depth: Verify URL against SSRF
      await assertSafeUrl(monitor.url);

      // 4. Resolve strategy and execute probe
      const strategy = this.strategyResolver.resolve(monitor.type);
      const result = await strategy.execute(monitor);

      // 5. Persist time-series check record
      const check = this.checkRepository.create({
        monitor: { id: monitor.id } as any,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        isUp: result.isUp,
        errorMessage: result.errorMessage,
      });

      await this.checkRepository.save(check);

      this.logger.log(
        `[Worker] Check completed for "${monitor.name}" - ${result.isUp ? 'UP' : 'DOWN'} (${result.responseTimeMs}ms, status: ${result.statusCode ?? 'N/A'})`,
      );
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `[Worker] Monitor ${monitorId} was deleted. Skipping check.`,
        );
        return;
      }

      // Log but DO NOT rethrow, so BullMQ does not infinitely retry dead endpoints
      this.logger.error(
        `[Worker] Error executing check for monitor ${monitorId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
