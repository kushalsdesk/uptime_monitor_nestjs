import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([Monitor, Check, Incident]),
    AuthModule,
  ],
  controllers: [MonitorsController],
  providers: [
    MonitorsService,
    HttpCheckStrategy,
    ApiCheckStrategy,
    PingCheckStrategy,
    CheckStrategyResolver,
  ],
  exports: [
    MonitorsService,
    CheckStrategyResolver,
  ],
})
export class MonitorsModule {}
