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
    private readonly monitorRepository:Repository<Monitor>
  ){}

  async create(createMonitorDto: CreateMonitorDto): Promise<Monitor> {
    const monitor = this.monitorRepository.create(createMonitorDto)
    return await this.monitorRepository.save(monitor);
  }

  async findAll():Promise<Monitor[]> {
    return await this.monitorRepository.find({
      order: { createdAt: "DESC" }
    });
  }

  async findOne(id: string):Promise<Monitor> {
    const monitor = await this.monitorRepository.findOneBy({id})
    if (!monitor) {
      throw new NotFoundException(`Monitor with ID ${id} not found`)
    }
    return monitor
  }

  async update(id: string, updateMonitorDto: UpdateMonitorDto):Promise<Monitor> {
    const monitor = await this.findOne(id)
    Object.assign(monitor, updateMonitorDto)
    return await this.monitorRepository.save(monitor)
  }

  async remove(id: string):Promise<{message:string}> {
    const monitor = await this.findOne(id)
    await this.monitorRepository.remove(monitor)
    return {message:`Monitor ${monitor.name} successfully deleted`}
  }
}
