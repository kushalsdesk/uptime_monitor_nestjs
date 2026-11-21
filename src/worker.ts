import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  console.log(
    '🚀 Uptime Monitor Background Worker initialized and listening for jobs...',
  );
}
await bootstrap();
