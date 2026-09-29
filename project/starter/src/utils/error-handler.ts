export const ErrorCodes = {
  RETRY_EXHAUSTED: 'RETRY_EXHAUSTED',
  AGENT_TIMEOUT: 'AGENT_TIMEOUT',
  STRUCTURED_OUTPUT_FAILED: 'STRUCTURED_OUTPUT_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export class ReviewError extends Error {
  code: string;
  metadata?: Record<string, unknown>;

  constructor(message: string, code: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = 'ReviewError';
    this.code = code;
    this.metadata = metadata;
  }
}

export function isReviewError(error: unknown): error is ReviewError {
  return error instanceof ReviewError;
}

export function formatError(error: unknown): string {
  if (isReviewError(error)) {
    return `[${error.code}] ${error.message}${error.metadata ? ` (${JSON.stringify(error.metadata)})` : ''}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      const backoffMs = delayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 100);
      await sleep(backoffMs);
    }
  }
  throw new ReviewError('Retry attempts exhausted', ErrorCodes.RETRY_EXHAUSTED, {
    maxRetries,
    cause: lastError instanceof Error ? lastError.message : String(lastError),
  });
}

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new ReviewError(errorMessage, ErrorCodes.AGENT_TIMEOUT, { timeoutMs }));
    }, timeoutMs);
  });

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}