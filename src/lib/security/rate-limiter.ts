export interface RateLimitPolicy {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
  login: { maxRequests: 5, windowMs: 60 * 1000 }, // 5/min per IP
  ai_request: { maxRequests: 10, windowMs: 60 * 1000 }, // 10/min per user
  chat_message: { maxRequests: 20, windowMs: 60 * 1000 }, // 20/min per user
  web_search: { maxRequests: 10, windowMs: 60 * 1000 }, // 10/min per user
  file_upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10/min per user
  project_create: { maxRequests: 5, windowMs: 60 * 1000 }, // 5/min per user
  project_save: { maxRequests: 30, windowMs: 60 * 1000 }, // 30/min per user
  payment_create: { maxRequests: 5, windowMs: 60 * 1000 }, // 5/min per user
  export: { maxRequests: 5, windowMs: 60 * 1000 }, // 5/min per user
};

interface BucketEntry {
  count: number;
  resetAt: number;
}

// In-process fallback store
const memoryStore = new Map<string, BucketEntry>();

export class RateLimiter {
  /**
   * Evaluates a rate limit key against an action policy.
   * Returns allowed status, remaining requests, and retryAfter in seconds.
   */
  async checkRateLimit(
    action: keyof typeof RATE_LIMIT_POLICIES,
    identifier: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
  }> {
    const policy = RATE_LIMIT_POLICIES[action] || { maxRequests: 20, windowMs: 60000 };
    const now = Date.now();
    const key = `ratelimit:${action}:${identifier}`;

    let entry = memoryStore.get(key);

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 1,
        resetAt: now + policy.windowMs,
      };
      memoryStore.set(key, entry);
      return {
        allowed: true,
        remaining: policy.maxRequests - 1,
        retryAfterSeconds: 0,
      };
    }

    if (entry.count >= policy.maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: policy.maxRequests - entry.count,
      retryAfterSeconds: 0,
    };
  }
}

export const rateLimiter = new RateLimiter();
