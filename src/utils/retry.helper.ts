export class RetryConfig {
  maxRetries: number = 3;
  baseDelay: number = 1000; // Base delay in milliseconds
  maxDelay: number = 10000; // Maximum delay in milliseconds
  jitterFactor: number = 0.25; // Random jitter factor (0-1)
}

export class RetryHelper {
  private retryCount: number = 0;
  
  constructor(private config: RetryConfig = new RetryConfig()) {}

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(): number {
    // Exponential backoff: baseDelay * 2^retryCount
    const exponentialDelay = this.config.baseDelay * Math.pow(2, this.retryCount);
    
    // Add random jitter
    const jitter = Math.random() * this.config.jitterFactor * exponentialDelay;
    
    // Apply maximum delay limit
    return Math.min(exponentialDelay + jitter, this.config.maxDelay);
  }

  /**
   * Sleep for the calculated delay
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if we should retry based on the error
   */
  private shouldRetry(error: any): boolean {
    // Retry on rate limit errors (429) or server errors (500-599)
    if (error?.status === 429 || (error?.status >= 500 && error?.status < 600)) {
      return this.retryCount < this.config.maxRetries;
    }
    return false;
  }

  /**
   * Execute an async function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (true) {
      try {
        return await fn();
      } catch (error) {
        if (this.shouldRetry(error)) {
          this.retryCount++;
          const delay = this.calculateDelay();
          console.log(`Retry ${this.retryCount}/${this.config.maxRetries} after ${delay}ms`);
          await this.sleep(delay);
          continue;
        }
        throw error;
      }
    }
  }
}