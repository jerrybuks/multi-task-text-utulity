import { Controller, Get } from '@nestjs/common';
import { MetricsService } from '../services/metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async summary() {
    // returns summary and some insights
    return this.metricsService.summary();
  }
}
