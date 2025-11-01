import { Injectable, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import OpenAI from 'openai';
import { LLMConfig, LLMRequest, LLMResponse } from '../interfaces/llm.interface';
import { RetryHelper, RetryConfig } from '../utils/retry.helper';
import { CircuitBreakerService } from './circuit-breaker.service';

@Injectable()
export class LLMService {
  private readonly openai: OpenAI;
  private readonly defaultConfig: LLMConfig = {
    model: 'openai/gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 250,
  };

  constructor(
    private configService: ConfigService,
    private circuitBreakerService: CircuitBreakerService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_ROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_ROUTER_API_KEY is not defined in environment variables');
    }

    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey,
    });
  }

  async loadPrompt(promptName: string): Promise<string> {
    try {
      const promptPath = path.join(process.cwd(), 'prompts', `${promptName}.prompt.txt`);
      const content = await fs.readFile(promptPath, 'utf-8');
      return `<system-rules>${content}</system-rules>`;
    } catch (error) {
      throw new Error(`Failed to load prompt ${promptName}: ${error.message}`);
    }
  }

  /**
   * Complete a chat request. You can optionally override the model per-call
   * by passing a `model` argument which takes precedence over request.config.model.
   */
  async complete<T = any>(request: LLMRequest, model?: string): Promise<LLMResponse<T>> {
    const startTime = Date.now();

    try {
      const config = { ...this.defaultConfig, ...request.config };
      if (model) {
        config.model = model;
      }

      // Prepare retry helper and circuit breaker
      const retryHelper = new RetryHelper(new RetryConfig());
      const breaker = this.circuitBreakerService.getBreaker('llm-service');

      // Fire through circuit breaker, which calls the retry-wrapped API call
      const completion: any = await breaker.fire(async () => {
        return await retryHelper.execute(async () => {
          return await this.openai.chat.completions.create({
            model: config.model,
            messages: request.messages as any,
            temperature: config.temperature,
            max_tokens: config.max_tokens,
          });
        });
      });

      const endTime = Date.now();
      return {
        content: JSON.parse(completion.choices[0].message.content || '{}') as T,
        usage: {
          total_tokens: completion.usage?.total_tokens || 0,
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
        },
        latencyMs: endTime - startTime,
      };
    } catch (error: any) {
      console.error('LLM request failed:', error);

      // Normalize status from different error shapes (openai client, axios, fetch, etc.)
      const status = error?.status || error?.response?.status || error?.statusCode || null;

      // 429 -> Too Many Requests
      if (status === 429) {
        throw new HttpException('Rate limit exceeded. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }

      // 5xx -> Service Unavailable
      if (status && status >= 500 && status < 600) {
        throw new HttpException('LLM service temporarily unavailable. Please try again later.', HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Fallback
      throw new InternalServerErrorException('Failed to process LLM request. Please try again.');
    }
  }
}