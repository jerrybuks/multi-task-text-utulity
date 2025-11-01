import { Injectable, Logger } from '@nestjs/common';
import { QueryRequestDto } from './dto/query-request.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import { LLMService } from './services/llm.service';
import { MetricsService } from './services/metrics.service';
import { LLMRequest } from './interfaces/llm.interface';

interface CustomerSupportResponse {
  answer: string;
  confidence?: number;
  recommendedActions: Array<{
    type: string;
    payload: {
      suggestedReply: string;
    };
  }>;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly llmService: LLMService, private readonly metricsService: MetricsService) {}

  async processQuery(query: QueryRequestDto): Promise<QueryResponseDto> {
    // Load the customer support prompt
    const systemPrompt = await this.llmService.loadPrompt('customer-support');

    // Prepare the LLM request
    const request: LLMRequest = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query.question }
      ]
    };

    try {
      // Make the LLM request
      const response = await this.llmService.complete<CustomerSupportResponse>(request);

      // Construct the response
      const confidence = typeof response.content.confidence === 'number' ? response.content.confidence : 0.5;
      const metrics = {
        tokens: response.usage.total_tokens,
        tokens_prompt: response.usage.prompt_tokens || 0,
        tokens_completion: response.usage.completion_tokens || 0,
        latencyMs: response.latencyMs,
        estimatedUsd: response.usage.total_tokens * 0.000001 // Approximate cost per token
      };

      // record metric (best-effort)
      try {
        await this.metricsService.record({
          timestamp: new Date().toISOString(),
          latencyMs: metrics.latencyMs,
          tokens: metrics.tokens,
          tokens_prompt: metrics.tokens_prompt,
          tokens_completion: metrics.tokens_completion,
          costUsd: metrics.estimatedUsd,
          success: true,
          error: null,
          confidence,
          model: undefined,
          questionSnippet: query.question?.slice(0, 200) || null,
        });
      } catch (e) {
        this.logger.warn('Failed to record metric', e?.stack || e);
      }

      return {
        answer: response.content.answer,
        confidence,
        recommendedActions: response.content.recommendedActions,
        metrics: {
          tokens: metrics.tokens,
          latencyMs: metrics.latencyMs,
          estimatedUsd: metrics.estimatedUsd,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing query:', error?.stack || error);
      // record failure metric (best-effort)
      try {
        await this.metricsService.record({
          timestamp: new Date().toISOString(),
          latencyMs: 0,
          tokens: 0,
          tokens_prompt: 0,
          tokens_completion: 0,
          costUsd: 0,
          success: false,
          error: { message: String(error?.message || error), status: error?.status || null },
          confidence: null,
          model: undefined,
          questionSnippet: query.question?.slice(0, 200) || null,
        });
      } catch (e) {
        this.logger.warn('Failed to record failure metric', e?.stack || e);
      }

      throw error; // LLMService already handles the error appropriately
    }
  }
}
