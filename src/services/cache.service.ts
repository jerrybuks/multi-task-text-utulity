import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { QueryResponseDto } from '../dto/query-response.dto';

export interface CacheEntry {
  messageId: string;
  response: QueryResponseDto;
  timestamp: string;
}

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private readonly dir = path.join(process.cwd(), 'cache');
  private readonly file = path.join(this.dir, 'cache.json');
  private cache: Map<string, CacheEntry> = new Map();

  async onModuleInit() {
    // Clear cache file on server start
    try {
      await fs.rm(this.file, { force: true });
      await this.ensureDir();
    } catch (e) {
      this.logger.error('Failed to clear cache file', e?.stack || e);
    }
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.dir, { recursive: true });
    } catch (e) {
      // ignore
    }
  }

  generateMessageId(question: string, model: string): string {
    // Create a hash of the question and model to use as the message ID
    return crypto.createHash('sha256')
      .update(`${question.toLowerCase().trim()}_${model}`)
      .digest('hex');
  }

  async get(messageId: string): Promise<QueryResponseDto | null> {
    try {
      const entry = this.cache.get(messageId);
      if (entry) {
        this.logger.debug(`Cache hit for messageId: ${messageId}`);
        return entry.response;
      }
      this.logger.debug(`Cache miss for messageId: ${messageId}`);
      return null;
    } catch (e) {
      this.logger.error('Failed to get from cache', e?.stack || e);
      return null;
    }
  }

  async set(messageId: string, response: QueryResponseDto): Promise<void> {
    try {
      const entry: CacheEntry = {
        messageId,
        response,
        timestamp: new Date().toISOString(),
      };
      
      this.cache.set(messageId, entry);
      
      // Persist to file
      await this.persistCache();
      this.logger.debug(`Response cached for messageId: ${messageId}`);
    } catch (e) {
      this.logger.error('Failed to set cache', e?.stack || e);
    }
  }

  private async persistCache(): Promise<void> {
    try {
      await this.ensureDir();
      const entries = Array.from(this.cache.values());
      await fs.writeFile(this.file, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (e) {
      this.logger.error('Failed to persist cache', e?.stack || e);
    }
  }
}