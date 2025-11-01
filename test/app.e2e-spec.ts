import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/assistant/query (POST)', () => {
    it('should process a valid query', () => {
      return request(app.getHttpServer())
        .post('/assistant/query')
        .send({ question: 'How do I transfer USDT from Polygon to BSC?' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('messageId');
          expect(res.body).toHaveProperty('answer');
          expect(res.body).toHaveProperty('confidence');
          expect(res.body).toHaveProperty('recommendedActions');
          expect(res.body).toHaveProperty('metrics');
          expect(res.body.metrics).toHaveProperty('total_tokens');
          expect(res.body.metrics).toHaveProperty('latencyMs');
          expect(res.body.metrics).toHaveProperty('estimatedUsd');
        });
    });

    it('should reject empty question', () => {
      return request(app.getHttpServer())
        .post('/assistant/query')
        .send({ question: '' })
        .expect(400);
    });

    it('should reject missing question', () => {
      return request(app.getHttpServer())
        .post('/assistant/query')
        .send({})
        .expect(400);
    });

    it('should reject question that is too long', () => {
      return request(app.getHttpServer())
        .post('/assistant/query')
        .send({ question: 'x'.repeat(1001) })
        .expect(400);
    });

    it('should reject when input tokens exceed 200', () => {
      // Creating a question with many words to exceed 200 tokens
      const longQuestion = 'Please explain in detail how to transfer crypto tokens '.repeat(20) +
        'across multiple blockchain networks including Ethereum Polygon Binance Smart Chain ' +
        'and provide step by step instructions for each network with all security considerations ' +
        'and best practices for large transactions including gas fee optimization techniques '.repeat(3);

      return request(app.getHttpServer())
        .post('/assistant/query')
        .send({ question: longQuestion })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Maximum 200 tokens allowed');
        });
    });
  });

  describe('/metrics (GET)', () => {
    it('should return metrics summary', () => {
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalRequests');
          expect(res.body).toHaveProperty('successes');
          expect(res.body).toHaveProperty('failures');
          expect(res.body).toHaveProperty('errorRate');
          expect(res.body).toHaveProperty('avgLatency');
          expect(res.body).toHaveProperty('totalTokens');
          expect(res.body).toHaveProperty('totalCost');
          expect(res.body).toHaveProperty('insights');
          expect(res.body).toHaveProperty('recent');
          expect(Array.isArray(res.body.recent)).toBe(true);
        });
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(typeof res.body.uptime).toBe('number');
        });
    });
  });
});
