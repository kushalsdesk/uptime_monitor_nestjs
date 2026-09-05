import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // enable Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform:true
    }),
  )

  // swagger openAPI DOCS UI
  const config = new DocumentBuilder()
    .setTitle("Uptime & Status Monitor API")
    .setDescription("Production-grade API for self-hosted website & API monitoring")
    .setVersion("1.0")
    .addTag("monitors")
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("api/docs", app, document)


  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on http://localhost:3000`);
  console.log(`📄 Swagger Docs available on http://localhost:3000/api/docs`);
}
await bootstrap();
