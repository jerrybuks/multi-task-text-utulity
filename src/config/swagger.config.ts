import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configures Swagger documentation for the application
 * @param app - The NestJS application instance
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Multi-Task Text Utility API')
    .setDescription(' AI Helper for customer-support agents for Cryptoexchange product')
    .setVersion('1.0')
    .addTag('assistant')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      showRequestDuration: true,
    },
  });
}