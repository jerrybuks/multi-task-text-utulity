import { Injectable } from '@nestjs/common';
import { QueryRequestDto } from './dto/query-request.dto';
import { QueryResponseDto } from './dto/query-response.dto';
import { LLMService } from './services/llm.service';
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
  constructor(private readonly llmService: LLMService) {}

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
      return {
        answer: response.content.answer,
        confidence: typeof response.content.confidence === 'number' ? response.content.confidence : 0.5,
        recommendedActions: response.content.recommendedActions,
        metrics: {
          tokens: response.usage.total_tokens,
          latencyMs: response.latencyMs,
          estimatedUsd: response.usage.total_tokens * 0.000001 // Approximate cost per token
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw error; // LLMService already handles the error appropriately
    }
  }
}
