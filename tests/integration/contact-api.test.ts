/**
 * Integration tests for contact API endpoint
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateContactRequest } from '../../api/shared/validation';
import { checkRateLimit, clearAllRateLimits } from '../../api/shared/rateLimit';
import {
  successResponse,
  validationErrorResponse,
  turnstileErrorResponse,
  rateLimitResponse,
  unsupportedMediaTypeResponse,
  emailSendFailedResponse,
} from '../../api/shared/response';

// Mock modules
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
}));

import sgMail from '@sendgrid/mail';

describe('Contact API Integration', () => {
  const mockSend = vi.mocked(sgMail.send);
  const mockFetch = vi.fn();

  const validPayload = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    subject: 'Lorem ipsum',
    message: 'Lorem ipsum dolor sit amet...',
    turnstileToken: '0x4AAAAAA1234567890',
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.stubEnv('SENDGRID_API_KEY', 'SG.test-key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'no-reply@example.com');
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret');
    vi.stubEnv('RATE_LIMIT_WINDOW_SECONDS', '60');
    vi.stubEnv('RATE_LIMIT_MAX_REQUESTS', '5');

    clearAllRateLimits();
    mockSend.mockReset();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('Scenario 1: Valid payload + Turnstile success + SendGrid success', () => {
    it('should return HTTP 200 with ok:true', async () => {
      // Mock Turnstile success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Mock SendGrid success
      mockSend.mockResolvedValueOnce([{ statusCode: 202 }, {}] as never);

      // Validate request
      const validation = validateContactRequest(validPayload);
      expect(validation.isValid).toBe(true);

      // Check rate limit
      const rateLimit = checkRateLimit('192.168.1.1');
      expect(rateLimit.allowed).toBe(true);

      // Expected response
      const response = successResponse();
      expect(response.status).toBe(200);
      expect(JSON.parse(response.body as string)).toEqual({ ok: true });
    });
  });

  describe('Scenario 2: Invalid email', () => {
    it('should return HTTP 400 with VALIDATION_ERROR', () => {
      const invalidPayload = {
        ...validPayload,
        email: 'invalid-email',
      };

      const validation = validateContactRequest(invalidPayload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.field === 'email')).toBe(true);

      const response = validationErrorResponse(validation.errors);
      expect(response.status).toBe(400);

      const body = JSON.parse(response.body as string);
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.details[0].field).toBe('email');
    });
  });

  describe('Scenario 3: Missing Turnstile token', () => {
    it('should return HTTP 400 with VALIDATION_ERROR', () => {
      const noTokenPayload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Test',
        message: 'Test message',
        // Missing turnstileToken
      };

      const validation = validateContactRequest(noTokenPayload);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some((e) => e.field === 'turnstileToken')).toBe(true);

      const response = validationErrorResponse(validation.errors);
      expect(response.status).toBe(400);
    });
  });

  describe('Scenario 4: Turnstile verification failure', () => {
    it('should return HTTP 400 with TURNSTILE_FAILED', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      });

      const response = turnstileErrorResponse();
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body as string)).toEqual({
        ok: false,
        code: 'TURNSTILE_FAILED',
      });
    });
  });

  describe('Scenario 5: Rate limit exceeded', () => {
    it('should return HTTP 429 with RATE_LIMIT on 6th request', () => {
      const ip = '192.168.1.100';

      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(ip);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blocked = checkRateLimit(ip);
      expect(blocked.allowed).toBe(false);

      const response = rateLimitResponse();
      expect(response.status).toBe(429);
      expect(JSON.parse(response.body as string)).toEqual({
        ok: false,
        code: 'RATE_LIMIT',
      });
    });
  });

  describe('Scenario 6: SendGrid error', () => {
    it('should return HTTP 502 with EMAIL_SEND_FAILED', async () => {
      mockSend.mockRejectedValueOnce(new Error('SendGrid API error'));

      const response = emailSendFailedResponse();
      expect(response.status).toBe(502);
      expect(JSON.parse(response.body as string)).toEqual({
        ok: false,
        code: 'EMAIL_SEND_FAILED',
      });
    });
  });

  describe('Scenario 7: Content-Type not JSON', () => {
    it('should return HTTP 415 with UNSUPPORTED_MEDIA_TYPE', () => {
      const response = unsupportedMediaTypeResponse();
      expect(response.status).toBe(415);
      expect(JSON.parse(response.body as string)).toEqual({
        ok: false,
        code: 'UNSUPPORTED_MEDIA_TYPE',
      });
    });
  });

  describe('Validation edge cases', () => {
    it('should trim whitespace from all fields', () => {
      const paddedPayload = {
        name: '  Jane Doe  ',
        email: '  jane@example.com  ',
        subject: '  Test Subject  ',
        message: '  Test message  ',
        turnstileToken: '  token123456  ',
      };

      const validation = validateContactRequest(paddedPayload);
      expect(validation.isValid).toBe(true);
      expect(validation.data?.name).toBe('Jane Doe');
      expect(validation.data?.email).toBe('jane@example.com');
    });

    it('should reject control characters in any field', () => {
      const payloads = [
        { ...validPayload, name: 'Jane\x00Doe' },
        { ...validPayload, subject: 'Test\x08Subject' },
        { ...validPayload, message: 'Hello\x1FWorld' },
      ];

      payloads.forEach((payload) => {
        const validation = validateContactRequest(payload);
        expect(validation.isValid).toBe(false);
      });
    });

    it('should validate field lengths', () => {
      // Name too long (>80)
      let validation = validateContactRequest({
        ...validPayload,
        name: 'a'.repeat(81),
      });
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0].field).toBe('name');

      // Subject too long (>120)
      validation = validateContactRequest({
        ...validPayload,
        subject: 'a'.repeat(121),
      });
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0].field).toBe('subject');

      // Message too long (>2000)
      validation = validateContactRequest({
        ...validPayload,
        message: 'a'.repeat(2001),
      });
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0].field).toBe('message');
    });
  });
});
