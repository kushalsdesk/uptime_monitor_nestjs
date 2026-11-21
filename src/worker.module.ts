import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitorsModule } from './monitors/monitors.module.js';
import { CheckProcessor } from './monitors/check.processor.js';

@Module({
  imports: [ConfigModule, MonitorsModule],
  providers: [CheckProcessor],
})
export class WorkerModule {}
