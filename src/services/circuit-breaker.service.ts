import { Injectable } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

export interface CircuitBreakerConfig {
  timeout?: number;           // Time in milliseconds before request times out
  errorThreshold?: number;    // Error % threshold before opening circuit
  resetTimeout?: number;      // Time in milliseconds before attempting reset
  volumeThreshold?: number;   // Minimum requests before error % calculation
}

@Injectable()
export class CircuitBreakerService {
  private breakers: Map<string, CircuitBreaker> = new Map();
  
  private defaultConfig: CircuitBreakerConfig = {
    timeout: 10000,
    errorThreshold: 50,
    resetTimeout: 30000,
    volumeThreshold: 10
  };

  getBreaker(name: string, config: CircuitBreakerConfig = {}): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const finalConfig = { ...this.defaultConfig, ...config };
  const breaker = new (CircuitBreaker as any)(async (fn: () => Promise<any>) => fn(), {
        timeout: finalConfig.timeout,
        errorThresholdPercentage: finalConfig.errorThreshold,
        resetTimeout: finalConfig.resetTimeout,
        volumeThreshold: finalConfig.volumeThreshold
      });

      // Add event listeners for monitoring
      breaker.on('open', () => console.warn(`Circuit Breaker '${name}' is now OPEN`));
      breaker.on('halfOpen', () => console.info(`Circuit Breaker '${name}' is now HALF-OPEN`));
      breaker.on('close', () => console.info(`Circuit Breaker '${name}' is now CLOSED`));
      breaker.on('reject', () => console.warn(`Circuit Breaker '${name}' rejected request`));

      this.breakers.set(name, breaker);
    }

    return this.breakers.get(name)!;
  }
}