import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LLMService } from './services/llm.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, LLMService, CircuitBreakerService],
})
export class AppModule {}
