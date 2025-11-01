# Multi-Task Text Utility
### AI-Powered Support Assistant for Crypto Exchange Product

> **Context**: An engineer on a product team building a helper for customer-support agents. The helper must return a concise JSON response for any incoming question so downstream systems can display an answer, a confidence estimate, and recommended actions. [**Product was assumed to be a  Crypto Exchange**]

## Result
A production-ready NestJS API designed to augment customer support workflows with AI-powered response processing. It transforms support queries into structured JSON responses with dynamic confidence scoring, recommended actions, and comprehensive safety checks. Built with enterprise-grade features including:

- **Intelligent Processing**: LLM-powered response generation with dynamic confidence scoring
- **Enterprise Security**: Multi-layer safety system with PII redaction, content moderation, and channel-specific safety tags
- **Reliability**: Idempotent operations with caching, exponential backoff retry mechanism, and rate limiting
- **Observability**: Per-query metrics tracking for tokens, latency, and cost estimates
- **Validation**: JSON schema validation, input size verification, and adversarial prompt detection
- **E2E Tests**: end-to-end test implemented for each of the enpoints to cover a variety of use cases

The service provides a consistent, secure, and monitored interface between support systems and AI models, with built-in safeguards and comprehensive usage analytics.

## Key Features

- 🎯 **Crypto-Focused**: Optimized for cryptocurrency exchange support queries and terminology
- 🔒 **Security-First**: Built-in content moderation and compliance checking
- 📊 **Performance Monitoring**: Real-time metrics and usage statistics
- ⚡ **Rate Limited**: Protected against abuse while ensuring reliable service

## Live Demo & Monitoring

- **API Documentation**: [https://multi-task-text-utulity.onrender.com/api/v1/docs](https://multi-task-text-utulity.onrender.com/api/v1/docs)
- **Status Page**: [https://stats.uptimerobot.com/5z2EBCHShQ](https://stats.uptimerobot.com/5z2EBCHShQ)
- **Metrics UI**: [https://multi-task-text-utulity.onrender.com/metrics](https://multi-task-text-utulity.onrender.com/metrics)

> **Note**: This service is deployed on Render's free tier. The server may be unavailable sometimes due to the free tier limitations. Please check the status page for real-time availability information. If render server is alseep, please give like it 2 minutes and reload 

## Installation

```bash
$ yarn install
```

## API Key Setup

1. Get your API key from [OpenRouter](https://openrouter.ai/):
   - Sign up for an account at OpenRouter
   - Navigate to API Keys section
   - Create a new API key

2. Add your API key to the `.env` file:
   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   ```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests -  implemented and working for all endoints in /test folder
$ yarn run test:e2e  

# test coverage
$ yarn run test:cov
```

## Known Limitations

### Data Persistence
- **File-based Cache**: 
  - Cache data is stored in memory and file system
  - Cache is cleared on server restart
  - New deployments will reset the cache

### Metrics Storage
- **In-Memory Metrics**: 
  - All metrics are stored in-memory
  - Metrics data is reset when server restarts
  - Historical data is not preserved across deployments
  - The `/metrics` endpoint shows data only since last restart

### Deployment
- Hosted on Render free tier
- Subject to cold starts
- Server sleeps after inactivity
- 2-minute warm-up time may be needed
- Have tried to mitiage this using ```uptimerobot``` that pings my server every 5 minutes, but does not guarnatee 100%