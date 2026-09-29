export interface RateLimiterConfig {
  maxRequestsPerMinute?: number;
  maxTokensPerMinute?: number;
  maxConcurrent?: number;
}

export class RateLimiter {
  private config: Required<RateLimiterConfig>;
  private requestHistory: Array<{ timestamp: number; tokens: number }> = [];
  private activeRequests: number = 0;
  private waitQueue: Array<() => void> = [];

  constructor(config: RateLimiterConfig = {}) {
    this.config = {
      maxRequestsPerMinute: config.maxRequestsPerMinute ?? 60,
      maxTokensPerMinute: config.maxTokensPerMinute ?? 100000,
      maxConcurrent: config.maxConcurrent ?? 5,
    };
  }

  async acquire(estimatedTokens: number = 1000): Promise<void> {
    while (this.activeRequests >= this.config.maxConcurrent) {
      await this.waitForSlot();
    }
    await this.waitForRateLimit(estimatedTokens);
    this.activeRequests += 1;
    this.requestHistory.push({ timestamp: Date.now(), tokens: estimatedTokens });
  }

  release(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) next();
    }
  }

  canProceed(estimatedTokens: number = 1000): boolean {
    this.pruneOldRecords();
    const requestsInWindow = this.requestHistory.length;
    const tokensInWindow = this.requestHistory.reduce((sum, record) => sum + record.tokens, 0);

    return (
      this.activeRequests < this.config.maxConcurrent &&
      requestsInWindow < this.config.maxRequestsPerMinute &&
      tokensInWindow + estimatedTokens <= this.config.maxTokensPerMinute
    );
  }

  getStatus() {
    this.pruneOldRecords();
    return {
      activeRequests: this.activeRequests,
      requestsInWindow: this.requestHistory.length,
      tokensInWindow: this.requestHistory.reduce((sum, r) => sum + r.tokens, 0),
    };
  }

  private async waitForSlot(): Promise<void> {
    await new Promise<void>((resolve) => this.waitQueue.push(resolve));
  }

  private async waitForRateLimit(estimatedTokens: number): Promise<void> {
    while (!this.canProceed(estimatedTokens)) {
      this.pruneOldRecords();
      const oldestRequest = this.requestHistory[0];
      if (!oldestRequest) break;
      const waitMs = Math.min(
        Math.max(oldestRequest.timestamp + 60000 - Date.now() + 100, 100),
        5000
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  private pruneOldRecords(): void {
    const cutoff = Date.now() - 60000;
    this.requestHistory = this.requestHistory.filter((record) => record.timestamp > cutoff);
  }
}

export const globalRateLimiter = new RateLimiter();

export async function withRateLimit<T>(
  fn: () => Promise<T>,
  estimatedTokens: number = 1000
): Promise<T> {
  await globalRateLimiter.acquire(estimatedTokens);
  try {
    return await fn();
  } finally {
    globalRateLimiter.release();
  }
}