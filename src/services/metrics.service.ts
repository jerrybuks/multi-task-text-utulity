import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface MetricEntry {
  timestamp: string; // ISO
  latencyMs: number;
  tokens: number;
  tokens_prompt: number;
  tokens_completion: number;
  costUsd: number;
  success: boolean;
  error?: { message: string; status?: number } | null;
  confidence?: number | null;
  model?: string | null;
  questionSnippet?: string | null;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly dir = path.join(process.cwd(), 'metrics');
  private readonly file = path.join(this.dir, 'metrics.json');

  private async ensureDir() {
    try {
      await fs.mkdir(this.dir, { recursive: true });
    } catch (e) {
      // ignore
    }
  }

  private async readAll(): Promise<MetricEntry[]> {
    try {
      const exists = await fs.stat(this.file).then(() => true).catch(() => false);
      if (!exists) return [];
      const raw = await fs.readFile(this.file, 'utf-8');
      if (!raw) return [];
      return JSON.parse(raw) as MetricEntry[];
    } catch (e) {
      this.logger.warn('Failed to read metrics file, returning empty list');
      return [];
    }
  }

  private async writeAll(records: MetricEntry[]) {
    try {
      await this.ensureDir();
      await fs.writeFile(this.file, JSON.stringify(records, null, 2), 'utf-8');
    } catch (e) {
      this.logger.error('Failed to write metrics file', e?.stack || e);
    }
  }

  async record(entry: MetricEntry): Promise<void> {
    try {
      const records = await this.readAll();
      records.push(entry);
      await this.writeAll(records);
    } catch (e) {
      this.logger.error('Failed to record metric', e?.stack || e);
    }
  }

  /**
   * Return aggregated summary and simple insights
   */
  async summary() {
    const records = await this.readAll();
    const total = records.length;
    const successes = records.filter(r => r.success).length;
    const failures = total - successes;
    const errorRate = total === 0 ? 0 : failures / total;
    const avgLatency = total === 0 ? 0 : records.reduce((s, r) => s + r.latencyMs, 0) / total;
    const medianLatency = (() => {
      if (records.length === 0) return 0;
      const arr = records.map(r => r.latencyMs).sort((a, b) => a - b);
      const mid = Math.floor(arr.length / 2);
      return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
    })();

    const totalTokens = records.reduce((s, r) => s + (r.tokens || 0), 0);
    const totalPrompt = records.reduce((s, r) => s + (r.tokens_prompt || 0), 0);
    const totalCompletion = records.reduce((s, r) => s + (r.tokens_completion || 0), 0);
    const totalCost = records.reduce((s, r) => s + (r.costUsd || 0), 0);
    const avgConfidence = (() => {
      const withConf = records.filter(r => typeof r.confidence === 'number');
      if (withConf.length === 0) return null;
      return withConf.reduce((s, r) => s + (r.confidence || 0), 0) / withConf.length;
    })();

    const insights: string[] = [];
    if (errorRate > 0.05) insights.push('Error rate over 5% — investigate upstream LLM or network issues');
    if (avgLatency > 2000) insights.push('Average latency > 2s — consider increasing timeouts or switching models');
    if (avgConfidence !== null && avgConfidence < 0.5) insights.push('Low average confidence — calibrate prompt or investigate model quality');

    return {
      totalRequests: total,
      successes,
      failures,
      errorRate,
      avgLatency,
      medianLatency,
      totalTokens,
      totalPrompt,
      totalCompletion,
      totalCost,
      avgConfidence,
      insights,
      recent: records.slice(-50).reverse(), // most recent 50
    };
  }
}
