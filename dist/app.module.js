"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const nestjs_throttler_storage_redis_1 = require("nestjs-throttler-storage-redis");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_manager_redis_yet_1 = require("cache-manager-redis-yet");
const core_1 = require("@nestjs/core");
const ioredis_1 = __importDefault(require("ioredis"));
const prisma_module_1 = require("./prisma/prisma.module");
const mail_module_1 = require("./mail/mail.module");
const auth_module_1 = require("./auth/auth.module");
const event_module_1 = require("./event/event.module");
const payment_module_1 = require("./payment/payment.module");
const ticket_module_1 = require("./ticket/ticket.module");
const notification_module_1 = require("./notification/notification.module");
const analytics_module_1 = require("./analytics/analytics.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRootAsync({
                useFactory: () => ({
                    throttlers: [
                        {
                            ttl: 60000,
                            limit: 100,
                        },
                    ],
                    storage: new nestjs_throttler_storage_redis_1.ThrottlerStorageRedisService(new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379')),
                }),
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => {
                    const store = await (0, cache_manager_redis_yet_1.redisStore)({
                        url: process.env.REDIS_URL || 'redis://localhost:6379',
                        ttl: 60 * 1000,
                    });
                    return { stores: [store], ttl: 60 * 1000 };
                },
            }),
            prisma_module_1.PrismaModule,
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            event_module_1.EventModule,
            payment_module_1.PaymentModule,
            ticket_module_1.TicketModule,
            notification_module_1.NotificationModule,
            analytics_module_1.AnalyticsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map