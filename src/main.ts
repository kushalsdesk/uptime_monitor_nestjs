import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  //security header
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // shutdown
  app.enableShutdownHooks();

  // Enable Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger OpenAPI Docs UI with Bearer Auth
  const config = new DocumentBuilder()
    .setTitle('Uptime & Status Monitor API')
    .setDescription(
      'Production-grade API for self-hosted website & API monitoring',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & account registration')
    .addTag('monitors', 'Monitor management (Protected with JWT)')
    .addTag('users', 'User profile operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📄 Swagger Docs available on http://localhost:3000/api/docs`);
}
await bootstrap();
