/**
 * Tests for response helpers
 */

import { describe, it, expect } from 'vitest';
import {
  successResponse,
  validationErrorResponse,
  turnstileErrorResponse,
  rateLimitResponse,
  unsupportedMediaTypeResponse,
  serverErrorResponse,
  serviceUnavailableResponse,
  emailSendFailedResponse,
} from '../../../api/shared/response';

describe('response helpers', () => {
  it('should create success response', () => {
    const response = successResponse();
    expect(response.status).toBe(200);
    expect(response.headers?.['Content-Type']).toBe('application/json');
    expect(JSON.parse(response.body as string)).toEqual({ ok: true });
  });

  it('should create validation error response', () => {
    const details = [{ field: 'email', message: 'Invalid email format.' }];
    const response = validationErrorResponse(details);

    expect(response.status).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual({
      ok: false,
      code: 'VALIDATION_ERROR',
      details,
    });
  });

  it('should create turnstile error response', () => {
    const response = turnstileErrorResponse();
    expect(response.status).toBe(400);
    expect(JSON.parse(response.body as string)).toEqual({
      ok: false,
      code: 'TURNSTILE_FAILED',
    });
  });

  it('should create rate limit response', () => {
    const response = rateLimitResponse();
    expect(response.status).toBe(429);
    expect(JSON.parse(response.body as string)).toEqual({
      ok: false,
      code: 'RATE_LIMIT',
    });
  });

  it('should create unsupported media type response', () => {
    const response = unsupportedMediaTypeResponse();
    expect(response.status).toBe(415);
    expect(JSON.parse(response.body as string)).toEqual({
      ok: false,
      code: 'UNSUPPORTED_MEDIA_TYPE',
    });
  });

  it('should create server error response', () => {
    const response = serverErrorResponse();
    expect(response.status).toBe(500);
    expect(JSON.parse(response.body as string)).toEqual({
      ok: false,
      code: 'SERVER_ERROR',
    });
  });

  it('should create service unavailable response', () => {
    const response = serviceUnavailableResponse();
    expect(response.status).toBe(503);
    expect(JSON.parse(response.body as string)).toEqual({
      ok: false,
      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('should create email send failed response', () => {
    const response = emailSendFailedResponse();
    expect(response.status).toBe(502);
    expect(JSON.parse(response.body as string)).toEqual({
      ok: false,
      code: 'EMAIL_SEND_FAILED',
    });
  });

  it('should include Content-Type header in all responses', () => {
    const responses = [
      successResponse(),
      validationErrorResponse([]),
      turnstileErrorResponse(),
      rateLimitResponse(),
      unsupportedMediaTypeResponse(),
      serverErrorResponse(),
      serviceUnavailableResponse(),
      emailSendFailedResponse(),
    ];

    responses.forEach((response) => {
      expect(response.headers?.['Content-Type']).toBe('application/json');
    });
  });
});
