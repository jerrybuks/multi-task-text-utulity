import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { MetricEntry } from '../services/metrics.service';

export class MetricInsight {
  @ApiProperty({
    description: 'Insight message about the metrics',
    example: 'Error rate over 5% — investigate upstream LLM or network issues',
  })
  @IsString()
  message: string;
}

export class MetricsSummaryDto {
  @ApiProperty({
    description: 'Total number of requests processed',
    example: 1000,
  })
  @IsNumber()
  totalRequests: number;

  @ApiProperty({
    description: 'Number of successful requests',
    example: 950,
  })
  @IsNumber()
  successes: number;

  @ApiProperty({
    description: 'Number of failed requests',
    example: 50,
  })
  @IsNumber()
  failures: number;

  @ApiProperty({
    description: 'Error rate as a decimal (0-1)',
    example: 0.05,
  })
  @IsNumber()
  errorRate: number;

  @ApiProperty({
    description: 'Average latency in milliseconds',
    example: 450.5,
  })
  @IsNumber()
  avgLatency: number;

  @ApiProperty({
    description: 'Median latency in milliseconds',
    example: 425.0,
  })
  @IsNumber()
  medianLatency: number;

  @ApiProperty({
    description: 'Total tokens consumed across all requests',
    example: 150000,
  })
  @IsNumber()
  totalTokens: number;

  @ApiProperty({
    description: 'Total prompt tokens used',
    example: 75000,
  })
  @IsNumber()
  totalPrompt: number;

  @ApiProperty({
    description: 'Total completion tokens used',
    example: 75000,
  })
  @IsNumber()
  totalCompletion: number;

  @ApiProperty({
    description: 'Total cost in USD',
    example: 0.15,
  })
  @IsNumber()
  totalCost: number;

  @ApiProperty({
    description: 'Average confidence score (0-1)',
    example: 0.85,
    nullable: true,
  })
  @IsNumber()
  avgConfidence: number | null;

  @ApiProperty({
    description: 'List of insights and recommendations based on the metrics',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  insights: string[];

  @ApiProperty({
    description: 'Most recent metric entries (up to 50)',
    type: [Object],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  recent: MetricEntry[];
}