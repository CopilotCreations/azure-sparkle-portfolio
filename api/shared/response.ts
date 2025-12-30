/**
 * HTTP response helpers
 * Provides consistent JSON response formatting
 */

import { HttpResponseSimple } from '@azure/functions';

export interface ApiResponse {
  ok: boolean;
  code?: string;
  details?: unknown;
}

/**
 * Create a JSON response
 */
function jsonResponse(status: number, body: ApiResponse): HttpResponseSimple {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

/**
 * Success response (200)
 */
export function successResponse(): HttpResponseSimple {
  return jsonResponse(200, { ok: true });
}

/**
 * Validation error response (400)
 */
export function validationErrorResponse(
  details: Array<{ field: string; message: string }>
): HttpResponseSimple {
  return jsonResponse(400, {
    ok: false,
    code: 'VALIDATION_ERROR',
    details,
  });
}

/**
 * Turnstile verification failed response (400)
 */
export function turnstileErrorResponse(): HttpResponseSimple {
  return jsonResponse(400, {
    ok: false,
    code: 'TURNSTILE_FAILED',
  });
}

/**
 * Rate limit exceeded response (429)
 */
export function rateLimitResponse(): HttpResponseSimple {
  return jsonResponse(429, {
    ok: false,
    code: 'RATE_LIMIT',
  });
}

/**
 * Unsupported media type response (415)
 */
export function unsupportedMediaTypeResponse(): HttpResponseSimple {
  return jsonResponse(415, {
    ok: false,
    code: 'UNSUPPORTED_MEDIA_TYPE',
  });
}

/**
 * Server error response (500)
 */
export function serverErrorResponse(): HttpResponseSimple {
  return jsonResponse(500, {
    ok: false,
    code: 'SERVER_ERROR',
  });
}

/**
 * Service unavailable response (503)
 */
export function serviceUnavailableResponse(): HttpResponseSimple {
  return jsonResponse(503, {
    ok: false,
    code: 'SERVICE_UNAVAILABLE',
  });
}

/**
 * Email send failed response (502)
 */
export function emailSendFailedResponse(): HttpResponseSimple {
  return jsonResponse(502, {
    ok: false,
    code: 'EMAIL_SEND_FAILED',
  });
}
