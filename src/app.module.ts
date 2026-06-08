import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { APP_GUARD } from '@nestjs/core';
import Redis from 'ioredis';

// Infrastructure Modules
import { PrismaModule } from './prisma/prisma.module';

import { MailModule } from './mail/mail.module';

// Feature Modules
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { PaymentModule } from './payment/payment.module';
import { TicketModule } from './ticket/ticket.module';
import { NotificationModule } from './notification/notification.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Global background Task Scheduler
    ScheduleModule.forRoot(),

    // Global Rate Limiting Throttler backed by local Redis
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000, // 1 minute
            limit: 10, // 10 requests per IP per minute
          },
        ],
        errorMessage:
          'Too many attempts. Please wait a minute and try again.',
        storage: new ThrottlerStorageRedisService(
          new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
        ),
      }),
    }),

    // Global Caching backed by local Redis
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          url: process.env.REDIS_URL || 'redis://localhost:6379',
          ttl: 60 * 1000,
        });
        return { stores: [store], ttl: 60 * 1000 };
      },
    }),

    PrismaModule,
    MailModule,
    AuthModule,
    EventModule,
    PaymentModule,
    TicketModule,
    NotificationModule,
    AnalyticsModule,
  ],
  providers: [
    // Register the global throttler guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
