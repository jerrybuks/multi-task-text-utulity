/**
 * DTOs for the assistant's per-query response and metrics.
 *
 * - QueryResponseDto: top-level object returned for any incoming question
 * - ActionDto: recommended action(s) for the downstream UI / agent
 * - MetricsDto: per-query usage metrics for monitoring (tokens, latency, USD cost)
 */
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * A recommended action the UI or agent can present or invoke.
 * - `type` is a short identifier (e.g. "reply", "escalate", "suggest_knowledge_base")
 * - `payload` contains any contextual data needed to perform the action
 */
export class ActionDto {
  @ApiProperty({
    description: 'Type of action to be taken',
    example: 'reply',
    enum: ['reply', 'escalate', 'suggest_knowledge_base', 'check_transaction', 'verify_address', 'monitor_network_status']
  })
  @IsString()
  type!: string;

  @ApiPropertyOptional({
    description: 'Additional data needed for the action',
    example: { 
      transactionDetails: {
        withdrawalId: "W-45678",
        txId: "abc123",
        network: "TRC20",
        asset: "USDT",
        amount: "1000",
        status: "completed",
        confirmations: 150,
        timestamp: "2025-10-31T10:15:23Z"
      },
      networkStatus: {
        name: "TRON",
        status: "operational",
        averageBlockTime: "3s",
        congestion: "low"
      },
      suggestedReply: "Transaction confirmed on blockchain (150+ confirmations). Please check your wallet sync status and verify on TRONSCAN: abc123. Contact us if funds don't appear after wallet sync.",
      knowledgeBaseArticles: [
        {
          id: "kb-789",
          title: "Understanding Crypto Withdrawal Processing Times",
          relevance: 0.95
        },
        {
          id: "kb-101",
          title: "How to Track Your Crypto Transaction on Different Networks",
          relevance: 0.92
        }
      ],
      blockExplorerUrl: "https://tronscan.org/#/transaction/abc123",
      securityChecks: {
        addressFormat: "valid",
        whitelisted: true,
        riskScore: "low"
      }
    }
  })
  @IsOptional()
  payload?: Record<string, unknown>;
}

/**
 * Per-query metrics used for monitoring and cost accounting.
 */
export class MetricsDto {
  @ApiProperty({
    description: 'Number of tokens consumed for the query/response',
    example: 150,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  tokens!: number;

  @ApiProperty({
    description: 'Latency observed for the request in milliseconds',
    example: 420,
    minimum: 1
  })
  @IsNumber()
  @IsPositive()
  latencyMs!: number;

  @ApiProperty({
    description: 'Estimated USD cost for this query',
    example: 0.002,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  estimatedUsd!: number;
}

/**
 * The top-level DTO returned from the assistant helper.
 * Fields are concise to allow downstream systems to present a short answer,
 * a numeric confidence, and a small set of recommended actions, plus metrics.
 *
 * Example shape:
 * {
 *   answer: "Here's the short answer...",
 *   confidence: 0.87,
 *   recommendedActions: [{ type: 'reply', payload: { suggestedReply: '...' } }],
 *   metrics: { tokens: 234, latencyMs: 420, estimatedUsd: 0.00123 }
 * }
 */
export class QueryResponseDto {
  @ApiProperty({
    description: 'Analysis and recommended response for the customer query',
    example: 'Withdrawal W-45678 confirmed on TRC20. 150+ confirmations. Wallet sync delay likely. Address valid.'
  })
  @IsString()
  answer!: string;

  @ApiProperty({
    description: 'Confidence score for the analysis and recommendation (0-1)',
    minimum: 0,
    maximum: 1,
    example: 0.95
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence!: number;

  @ApiProperty({
    description: 'List of recommended actions based on the query and response',
    type: [ActionDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  recommendedActions!: ActionDto[];

  @ApiProperty({
    description: 'Usage metrics for monitoring and billing',
    type: MetricsDto
  })
  @ValidateNested()
  @Type(() => MetricsDto)
  metrics!: MetricsDto;

  @ApiPropertyOptional({
    description: 'ISO timestamp when the response was generated',
    example: '2025-10-31T12:00:00Z'
  })
  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
