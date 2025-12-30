/**
 * Tests for rate limiting module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  clearRateLimit,
  clearAllRateLimits,
  getRateLimitEntry,
} from '../../../api/shared/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    clearAllRateLimits();
    vi.stubEnv('RATE_LIMIT_WINDOW_SECONDS', '60');
    vi.stubEnv('RATE_LIMIT_MAX_REQUESTS', '5');
  });

  it('should allow first request', () => {
    const result = checkRateLimit('192.168.1.1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should track request count', () => {
    const ip = '192.168.1.2';

    checkRateLimit(ip);
    expect(getRateLimitEntry(ip)?.count).toBe(1);

    checkRateLimit(ip);
    expect(getRateLimitEntry(ip)?.count).toBe(2);

    checkRateLimit(ip);
    expect(getRateLimitEntry(ip)?.count).toBe(3);
  });

  it('should decrement remaining count', () => {
    const ip = '192.168.1.3';

    expect(checkRateLimit(ip).remaining).toBe(4);
    expect(checkRateLimit(ip).remaining).toBe(3);
    expect(checkRateLimit(ip).remaining).toBe(2);
    expect(checkRateLimit(ip).remaining).toBe(1);
    expect(checkRateLimit(ip).remaining).toBe(0);
  });

  it('should block after exceeding limit', () => {
    const ip = '192.168.1.4';

    // First 5 requests should be allowed
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    }

    // 6th request should be blocked
    const blocked = checkRateLimit(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('should track different IPs separately', () => {
    const ip1 = '192.168.1.5';
    const ip2 = '192.168.1.6';

    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip1);
    }

    // ip2 should still be allowed
    const result = checkRateLimit(ip2);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);

    // ip1 should be blocked
    const blocked = checkRateLimit(ip1);
    expect(blocked.allowed).toBe(false);
  });

  it('should reset after window expires', () => {
    const ip = '192.168.1.7';
    const originalNow = Date.now;

    // Exhaust limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip);
    }
    expect(checkRateLimit(ip).allowed).toBe(false);

    // Mock time to be after window
    vi.spyOn(Date, 'now').mockImplementation(() => originalNow() + 61000);

    // Should be allowed again
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);

    vi.restoreAllMocks();
  });

  it('should clear rate limit for specific key', () => {
    const ip = '192.168.1.8';

    checkRateLimit(ip);
    checkRateLimit(ip);
    expect(getRateLimitEntry(ip)?.count).toBe(2);

    clearRateLimit(ip);
    expect(getRateLimitEntry(ip)).toBeUndefined();
  });

  it('should use default values when env vars not set', () => {
    vi.stubEnv('RATE_LIMIT_WINDOW_SECONDS', '');
    vi.stubEnv('RATE_LIMIT_MAX_REQUESTS', '');

    const ip = '192.168.1.9';
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // Default is 5, so 4 remaining after first
  });

  it('should return reset time', () => {
    const ip = '192.168.1.10';
    const before = Date.now();
    const result = checkRateLimit(ip);

    expect(result.resetTime).toBeGreaterThanOrEqual(before + 60000);
    expect(result.resetTime).toBeLessThanOrEqual(Date.now() + 60000);
  });
});
