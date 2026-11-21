import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MonitorsService } from './monitors.service.js';
import { MonitorsController } from './monitors.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Monitor } from './entities/monitor.entity.js';
import { Check } from './entities/check.entity.js';
import { Incident } from './entities/incident.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { HttpCheckStrategy } from './strategies/http-check.strategy.js';
import { ApiCheckStrategy } from './strategies/api-check.strategy.js';
import { PingCheckStrategy } from './strategies/ping-check.strategy.js';
import { CheckStrategyResolver } from './strategies/check-strategy.resolver.js';
import { CHECK_QUEUE } from './constants/queue.constants.js';
import { CheckProducerService } from './check-producer.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor, Check, Incident]),
    AuthModule,
    BullModule.registerQueue({
      name: CHECK_QUEUE,
    }),
  ],
  controllers: [MonitorsController],
  providers: [
    MonitorsService,
    HttpCheckStrategy,
    ApiCheckStrategy,
    PingCheckStrategy,
    CheckStrategyResolver,
    CheckProducerService,
  ],
  exports: [
    MonitorsService,
    CheckStrategyResolver,
    CheckProducerService,
    BullModule,
    TypeOrmModule,
  ],
})
export class MonitorsModule {}
