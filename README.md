# Multi-Task Text Utility

A specialized NestJS-based API designed to enhance cryptocurrency exchange customer support through AI-powered text processing. Built with industry-specific knowledge, it helps support teams quickly analyze, categorize, and respond to crypto-related queries while maintaining compliance and security standards. The service features rate limiting, retry eith exponential back off, safety moderation (seperate channels with tag and PII redacting), and metrics trakcing with insights.

## Key Features

- 🎯 **Crypto-Focused**: Optimized for cryptocurrency exchange support queries and terminology
- 🔒 **Security-First**: Built-in content moderation and compliance checking
- 📊 **Performance Monitoring**: Real-time metrics and usage statistics
- ⚡ **Rate Limited**: Protected against abuse while ensuring reliable service

## Live Demo & Monitoring

- **API Documentation**: [https://multi-task-text-utulity.onrender.com/api/v1/docs](https://multi-task-text-utulity.onrender.com/api/v1/docs)
- **Status Page**: [https://stats.uptimerobot.com/5z2EBCHShQ](https://stats.uptimerobot.com/5z2EBCHShQ)
- **Metrics UI**: [https://multi-task-text-utulity.onrender.com/metrics](https://multi-task-text-utulity.onrender.com/metrics)

> **Note**: This service is deployed on Render's free tier. The server may be unavailable sometimes due to the free tier limitations. Please check the status page for real-time availability information.

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

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

# e2e tests - E2E implemented and working for all endoints in /test folder
$ yarn run test:e2e  

# test coverage
$ yarn run test:cov
```