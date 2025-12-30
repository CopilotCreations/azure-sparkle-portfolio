/**
 * Rate limiting for API requests
 * Uses fixed-window counter with in-memory storage
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory storage for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configuration
const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS = 5;

/**
 * Get rate limit configuration from environment
 */
function getConfig(): { windowSeconds: number; maxRequests: number } {
  const windowSeconds = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '', 10);
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '', 10);

  return {
    windowSeconds: isNaN(windowSeconds) ? DEFAULT_WINDOW_SECONDS : windowSeconds,
    maxRequests: isNaN(maxRequests) ? DEFAULT_MAX_REQUESTS : maxRequests,
  };
}

/**
 * Check if request is within rate limit
 * @param key - Rate limit key (usually client IP)
 * @returns Rate limit result
 */
export function checkRateLimit(key: string): RateLimitResult {
  const { windowSeconds, maxRequests } = getConfig();
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Get or create entry
  let entry = rateLimitStore.get(key);

  // Check if we need to start a new window
  if (!entry || now - entry.windowStart >= windowMs) {
    entry = {
      count: 0,
      windowStart: now,
    };
    rateLimitStore.set(key, entry);
  }

  // Increment count
  entry.count++;

  const remaining = Math.max(0, maxRequests - entry.count);
  const resetTime = entry.windowStart + windowMs;

  // Check if rate limit exceeded
  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  return {
    allowed: true,
    remaining,
    resetTime,
  };
}

/**
 * Clear rate limit for a specific key (for testing)
 */
export function clearRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limits (for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get current rate limit entry (for testing)
 */
export function getRateLimitEntry(key: string): RateLimitEntry | undefined {
  return rateLimitStore.get(key);
}
