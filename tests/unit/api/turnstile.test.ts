/**
 * Tests for Turnstile verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyTurnstile } from '../../../api/shared/turnstile';

describe('turnstile', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret-key');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('should return success for valid token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await verifyTurnstile('valid-token', '192.168.1.1');

    expect(result.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );
  });

  it('should return failure for invalid token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-response'],
      }),
    });

    const result = await verifyTurnstile('invalid-token', '192.168.1.1');

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain('invalid-input-response');
  });

  it('should handle missing secret key', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '');

    const result = await verifyTurnstile('token', '192.168.1.1');

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain('missing-secret-key');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should handle fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await verifyTurnstile('token', '192.168.1.1');

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain('verification-request-failed');
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await verifyTurnstile('token', '192.168.1.1');

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain('verification-exception');
  });

  it('should include remote IP in request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await verifyTurnstile('token', '10.0.0.1');

    const callArgs = mockFetch.mock.calls[0];
    const body = callArgs[1].body;
    expect(body).toContain('remoteip=10.0.0.1');
  });
});
