import { Module } from '@nestjs/common';
import { MonitorsService } from './monitors.service.js';
import { MonitorsController } from './monitors.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Monitor } from './entities/monitor.entity.js';
import { Check } from './entities/check.entity.js';
import { Incident } from './entities/incident.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor, Check, Incident])
  ],
  controllers: [MonitorsController],
  providers: [MonitorsService],
  exports:[MonitorsService]
})
export class MonitorsModule {}
