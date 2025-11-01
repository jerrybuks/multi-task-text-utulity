import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the health status of the server. Used for keeping the service alive on Render.',
  })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        timestamp: {
          type: 'string',
          example: '2025-11-01T12:00:00.000Z',
        },
        uptime: {
          type: 'number',
          example: 3600,
        },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}