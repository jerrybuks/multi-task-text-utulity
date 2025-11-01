import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for the incoming question endpoint.
 * Validates the question text.
 */
export class QueryRequestDto {
  @ApiProperty({
    description: 'Customer query or support ticket content that needs to be analyzed',
    example: 'Can I send USDT on polygon to BNB chain?',
    maxLength: 1000,
    required: true
  })
  @IsString()
  @MaxLength(1000, { message: 'Question cannot exceed 1000 characters' })
  question!: string;
}