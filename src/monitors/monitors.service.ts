import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Monitor } from './entities/monitor.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class MonitorsService {
  constructor(
    @InjectRepository(Monitor)
    private readonly monitorRepository: Repository<Monitor>,
  ) {}

  // 1. Create monitor scoped to authenticated user
  async create(userId: string, createMonitorDto: CreateMonitorDto): Promise<Monitor> {
    const monitor = this.monitorRepository.create({
      ...createMonitorDto,
      user: { id: userId } as any,
    });
    return await this.monitorRepository.save(monitor);
  }

  // 2. Fetch all monitors belonging to authenticated user
  async findAll(userId: string): Promise<Monitor[]> {
    return await this.monitorRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Find one monitor scoped to authenticated user
  async findOne(id: string, userId: string): Promise<Monitor> {
    const monitor = await this.monitorRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!monitor) {
      throw new NotFoundException(`Monitor with ID "${id}" not found`);
    }
    return monitor;
  }

  // 4. Update monitor scoped to authenticated user
  async update(id: string, userId: string, updateMonitorDto: UpdateMonitorDto): Promise<Monitor> {
    const monitor = await this.findOne(id, userId);
    Object.assign(monitor, updateMonitorDto);
    return await this.monitorRepository.save(monitor);
  }

  // 5. Delete monitor scoped to authenticated user
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const monitor = await this.findOne(id, userId);
    await this.monitorRepository.remove(monitor);
    return { message: `Monitor "${monitor.name}" successfully deleted` };
  }
}
