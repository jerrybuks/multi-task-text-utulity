import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { QueryRequestDto } from './dto/query-request.dto';
import { QueryResponseDto } from './dto/query-response.dto';

@ApiTags('assistant')
@Controller('assistant')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Post('query')
  @ApiOperation({
    summary: 'Process a text query',
    description: 'Processes a question and returns an AI-generated response with confidence score, recommended actions, and usage metrics.'
  })
  @ApiResponse({
    status: 201,
    description: 'The query was successfully processed',
    type: QueryResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - check the question length and format'
  })
  async processQuery(@Body() query: QueryRequestDto): Promise<QueryResponseDto> {
    this.logger.log(`Processing query: ${query.question?.slice(0, 120)}`);
    return this.appService.processQuery(query);
  }
}
