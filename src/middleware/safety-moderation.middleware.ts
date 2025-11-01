import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { encode } from 'gpt-tokenizer';

interface ModeratedRequest extends Request {
  moderatedQuestion?: string;
}

@Injectable()
export class SafetyModerationMiddleware implements NestMiddleware {
  private readonly MAX_TOKENS = 200; // Reasonable limit for support queries
  private readonly PII_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}\b/g,
    privateKey: /\b([0-9a-fA-F]{64}|[5KL][1-9A-HJ-NP-Za-km-z]{50,51})\b/g,
    walletAddress: /\b(0x[a-fA-F0-9]{40}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b/g,
  };

  use(req: ModeratedRequest, res: Response, next: NextFunction) {
    try {
      const question = req.body?.question;

      if (!question) {
        throw new BadRequestException('Question is required');
      }

      // 1. Validate token size
      const tokens = encode(question);
      if (tokens.length > this.MAX_TOKENS) {
        throw new BadRequestException(
          `Question is too long. Maximum ${this.MAX_TOKENS} tokens allowed, got ${tokens.length}`,
        );
      }

      // 2. Mask PII
      let maskedQuestion = question;
      Object.entries(this.PII_PATTERNS).forEach(([type, pattern]) => {
        maskedQuestion = maskedQuestion.replace(pattern, (match) => {
          const len = match.length;
          return `[REDACTED-${type}-${len}]`;
        });
      });

      // 3. Wrap question with tag
      req.body.question = `<user-query>${maskedQuestion}</user-query>`;

      next();
    } catch (error) {
      next(error);
    }
  }
}
