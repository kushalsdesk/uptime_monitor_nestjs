import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Monitor } from './entities/monitor.entity.js';
import { Check } from './entities/check.entity.js';
import { Repository } from 'typeorm';
import { CheckStrategyResolver } from './strategies/check-strategy.resolver.js';
import { assertSafeUrl } from './utils/ssrf-guard.js';
import { CheckProducerService } from './check-producer.service.js';

@Injectable()
export class MonitorsService {
  constructor(
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
    @InjectRepository(Check)
    private readonly checkRepository: Repository<Check>,
    private readonly strategyResolver: CheckStrategyResolver,
    private readonly checkProducer: CheckProducerService,
  ) {}

  // 1. Create monitor scoped to authenticated user
  async create(
    userId: string,
    createMonitorDto: CreateMonitorDto,
  ): Promise<Monitor> {
    await assertSafeUrl(createMonitorDto.url);

    const monitor = this.monitorRepository.create({
      ...createMonitorDto,
      user: { id: userId } as any,
    });

    const savedMonitor = await this.monitorRepository.save(monitor);

    // Trigger the BullMQ producer
    if (savedMonitor.isActive) {
      await this.checkProducer.scheduleMonitor(savedMonitor);
    }
    return savedMonitor;
  }

  async findAll(userId: string): Promise<Monitor[]> {
    return await this.monitorRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Monitor> {
    const monitor = await this.monitorRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!monitor) {
      throw new NotFoundException(`Monitor with ID "${id}" not found`);
    }
    return monitor;
  }

  // 🚀 Step 5.4: Worker lookup method (bypasses userId filter since worker is system-level)
  async findOneForWorker(id: string): Promise<Monitor> {
    const monitor = await this.monitorRepository.findOneBy({ id });
    if (!monitor) {
      throw new NotFoundException(`Monitor with ID "${id}" not found`);
    }
    return monitor;
  }

  async update(
    id: string,
    userId: string,
    updateMonitorDto: UpdateMonitorDto,
  ): Promise<Monitor> {
    const monitor = await this.findOne(id, userId);

    if (updateMonitorDto.url) {
      await assertSafeUrl(updateMonitorDto.url);
    }

    Object.assign(monitor, updateMonitorDto);
    const savedMonitor = await this.monitorRepository.save(monitor);

    if (savedMonitor.isActive) {
      await this.checkProducer.scheduleMonitor(savedMonitor);
    } else {
      await this.checkProducer.removeMonitor(savedMonitor.id);
    }
    return savedMonitor;
  }

  // 5. Delete monitor scoped to authenticated user
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const monitor = await this.findOne(id, userId);
    await this.checkProducer.removeMonitor(monitor.id);
    await this.monitorRepository.remove(monitor);
    return { message: `Monitor "${monitor.name}" successfully deleted` };
  }

  // 6. Execute an on-demand health check and save time-series check row
  async runCheck(id: string, userId: string): Promise<Check> {
    const monitor = await this.findOne(id, userId);

    await assertSafeUrl(monitor.url);

    const strategy = this.strategyResolver.resolve(monitor.type);
    const result = await strategy.execute(monitor);

    const check = this.checkRepository.create({
      monitor: { id: monitor.id } as any,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      isUp: result.isUp,
      errorMessage: result.errorMessage,
    });

    return await this.checkRepository.save(check);
  }

  // 7. Get recent check history for a monitor (uses composite B-Tree index)
  async getMonitorChecks(
    id: string,
    userId: string,
    limit = 50,
  ): Promise<Check[]> {
    await this.findOne(id, userId);

    const safeLimit = Math.min(Math.max(limit, 1), 100);

    return await this.checkRepository.find({
      where: { monitor: { id } },
      order: { checkedAt: 'DESC' },
      take: safeLimit,
    });
  }
}
