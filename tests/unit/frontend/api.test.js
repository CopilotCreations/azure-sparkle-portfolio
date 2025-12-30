/**
 * Tests for API utility module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { postJson, ApiError } from '../../../src/js/api.js';

describe('api', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('postJson', () => {
    it('should make POST request with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });

      await postJson('/api/test', { name: 'test' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'test' }),
        })
      );
    });

    it('should return parsed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, data: 'test' }),
      });

      const result = await postJson('/api/test', {});

      expect(result).toEqual({ ok: true, data: 'test' });
    });

    it('should throw ApiError on non-2xx response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ ok: false, code: 'VALIDATION_ERROR' }),
      });

      await expect(postJson('/api/test', {})).rejects.toThrow(ApiError);
    });

    it('should include error code from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ ok: false, code: 'TEST_ERROR' }),
      });

      try {
        await postJson('/api/test', {});
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.code).toBe('TEST_ERROR');
        expect(error.status).toBe(400);
      }
    });

    it('should include details from response', async () => {
      const details = [{ field: 'email', message: 'Invalid' }];
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ ok: false, code: 'VALIDATION_ERROR', details }),
      });

      try {
        await postJson('/api/test', {});
      } catch (error) {
        expect(error.details).toEqual(details);
      }
    });

    it('should throw ApiError on invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(postJson('/api/test', {})).rejects.toThrow(ApiError);
    });

    it('should throw ApiError with TIMEOUT code on timeout', async () => {
      // Test with a very short timeout that will always fail
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            const error = new Error('AbortError');
            error.name = 'AbortError';
            reject(error);
          })
      );

      await expect(postJson('/api/test', {}, { timeout: 1 })).rejects.toMatchObject({
        code: 'TIMEOUT',
        status: 408,
      });
    });

    it('should throw ApiError with NETWORK_ERROR code on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failed'));

      await expect(postJson('/api/test', {})).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        status: 0,
      });
    });
  });

  describe('ApiError', () => {
    it('should create error with all properties', () => {
      const error = new ApiError('Test error', 400, 'TEST', [{ field: 'test' }]);

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('TEST');
      expect(error.details).toEqual([{ field: 'test' }]);
      expect(error.name).toBe('ApiError');
    });

    it('should be instance of Error', () => {
      const error = new ApiError('Test', 500, 'TEST');
      expect(error instanceof Error).toBe(true);
    });
  });
});
