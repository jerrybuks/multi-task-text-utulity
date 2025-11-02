# Technical Reports

## Architecture Overview

The Multi-Task Text Utility is built on a robust NestJS architecture, featuring:

### Core Components

1. **API Layer**
   - RESTful endpoints using [NestJS controllers](../src/app.controller.ts)
   - OpenAPI/Swagger documentation in [main.ts](../src/main.ts)
   - Request validation using [class-validator DTOs](../src/dtos)
   - Rate limiting with [@nestjs/throttler](../src/app.module.ts) for app-wide rate limiting

2. **Service Layer**
   - Modular service architecture via [app.module.ts](../src/app.module.ts)
   - AI model integration via [LLMService](../src/services/llm.service.ts)
   - Error handling with [Circuit Breaker & Retry](../src/services/llm.service.ts)
   - Caching strategies via [CacheService](../src/services/cache.service.ts)

3. **Middleware**
   - [Safety moderation](../src/middleware/safety-moderation.middleware.ts) for content filtering, token size validation, PII redaction, seperatig channels with tags e.t.c
   - Request logging with [Morgan](../src/main.ts)

4. **Monitoring**
   - [Custom metrics](../metrics/metrics.json) collection
   - [Performance monitoring via metrics endpoint & service](../src/services/metrics.service.ts)
   - [Health check](../src/health/health.controller.ts) endpoints
   - [UptimeRobot integration](https://stats.uptimerobot.com/5z2EBCHShQ)

5. **E2E tests**
   - [E2E tests for all endpints](../test/app.e2e-spec.ts) 

## Prompt Techniques

### Chain-of-Thought Prompting

The system uses chain-of-thought prompting, which guides the model through a step-by-step reasoning process before reaching a conclusion. 

Example system prompt:
```You are a customer support AI assistant for a cryptocurrency exchange. 
Analyze the customer's query and provide:
1. A concise analysis of the issue
2. Recommended actions
3. A brief, professional response

Note: If the user asks a question outside of customer support related to our product, respond letting the user know you can only assist with customer support queries.

Return your response as valid JSON with this structure:
{
  "answer": "Brief analysis of the issue",
  "confidence": 0.0-1.0, // Numeric confidence score (0 = not sure, 1 = certain)
  "recommendedActions": [{
    "type": "action_type",
    "payload": {
      "suggestedReply": "Brief professional response"
    }
  }]
}
```

### Why This Technique?

I initialy started with zero shot but modified to chain-of-thought. This technique is particularly effective for customer support as it helps the model:
- Break down complex queries
- Consider multiple aspects systematically
- Provide traceable reasoning
- Generate more accurate confidence scores

## Metrics Summary

Metrics are collected and exposed through our [metrics endpoint](https://multi-task-text-utulity.onrender.com/metrics). The service tracks:

- Request counts, success & error rates
- Response times (latency)
- Token usage
- Cost estimates per request
- confidence levels

Metrics are gathered by intercepting requests and responses using our [MetricsService](../src/services/metrics.service.ts), which:
1. Tracks request timing
2. Counts tokens used
3. Calculates costs
4. Monitors rate limiting

Sample metrics response:
```json
{
    "timestamp": "2025-11-02T00:15:08.043Z",
    "latencyMs": 3160,
    "total_tokens": 285,
    "tokens_prompt": 191,
    "tokens_completion": 94,
    "costUsd": 0.000285,
    "success": true,
    "error": null,
    "confidence": 0.9,
    "questionSnippet": "<user-query>Is my token safe here</user-query>"
}
```

Note: Metrics are stored in-memory and reset on server restart. Check the [Known Limitations](#known-limitations) section for more details.

## Challenges

1. **Technical Challenges**
   - Writing unit tests for all services and functionality was quite tedious, so I opted for just e2e tests for now

2. **Integration Challenges**
   - Couldn't setup card on openai directly, had to use OpenRouter

3. **Deployment Challenges**
   - `Render free tier limitation

## Improvements

1. **Performance**
   - Use Redis for caching and get rid of file based caching
   - use Prometheus or any other robust service for monitoring
   - Optimize prompt templates
   - standardize error handling with middleware

2. **Features**
   - Use streaming to maintain a chat-like system that allows users to follow up on questions 
   - Enhanced metrics dashboard

3. **Infrastructure**
   - Move to paid hosting tier
   - Automated scaling
