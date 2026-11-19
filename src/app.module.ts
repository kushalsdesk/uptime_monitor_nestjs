import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MonitorsModule } from './monitors/monitors.module.js';
import { UsersModule } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          // 🚀 Use DATABASE_URL in production (Neon), fallback to local vars in dev
          url: isProd ? configService.get<string>('DATABASE_URL') : undefined,
          host: isProd ? undefined : configService.get<string>('DB_HOST'),
          port: isProd ? undefined : configService.get<number>('DB_PORT'),
          username: isProd
            ? undefined
            : configService.get<string>('DB_USERNAME'),
          password: isProd
            ? undefined
            : configService.get<string>('DB_PASSWORD'),
          database: isProd ? undefined : configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: !isProd,
          ssl: isProd ? { rejectUnauthorized: false } : false,
          logging: ['error'],
        };
      },
    }),
    MonitorsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
