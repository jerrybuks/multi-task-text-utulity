import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LLMService } from './services/llm.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { MetricsService } from './services/metrics.service';
import { MetricsController } from './controllers/metrics.controller';
import { CacheService } from './services/cache.service';
import { SafetyModerationMiddleware } from './middleware/safety-moderation.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 20, // max 20 requests
          ttl: 60,   // per 60 seconds
        },
      ],
    }),
  ],
  controllers: [AppController, MetricsController],
  providers: [
    AppService,
    LLMService,
    CircuitBreakerService,
    MetricsService,
    CacheService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SafetyModerationMiddleware)
      .forRoutes('assistant/query');
  }
}
