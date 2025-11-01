import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MetricsService } from '../services/metrics.service';
import { MetricsSummaryDto } from '../dto/metrics-summary.dto';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get metrics summary',
    description: 'Returns aggregated metrics including request counts, token usage, costs, and insights',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics summary retrieved successfully',
    type: MetricsSummaryDto,
  })
  async summary(): Promise<MetricsSummaryDto> {
    return this.metricsService.summary();
  }
}
