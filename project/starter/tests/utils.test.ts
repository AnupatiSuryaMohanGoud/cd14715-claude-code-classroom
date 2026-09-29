import { describe, it, expect } from 'vitest';
import { withRetry, withTimeout } from '../src/utils/error-handler.js';
import { RateLimiter } from '../src/utils/rate-limiter.js';

describe('review utilities', () => {
  it('withRetry retries and eventually succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts += 1;
      if (attempts < 2) throw new Error('temporary failure');
      return 'success';
    }, 2, 1);
    expect(result).toBe('success');
    expect(attempts).toBe(2);
  });

  it('withTimeout resolves before the timeout', async () => {
    await expect(withTimeout(() => Promise.resolve('ok'), 100)).resolves.toBe('ok');
  });

  it('RateLimiter allows requests under the configured limits', () => {
    const limiter = new RateLimiter({ maxRequestsPerMinute: 2, maxTokensPerMinute: 1000 });
    expect(limiter.canProceed(100)).toBe(true);
  });
});