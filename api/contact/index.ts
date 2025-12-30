import { Context, HttpRequest, HttpResponseSimple } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { validateContactRequest, ValidationResult } from '../shared/validation';
import { checkRateLimit } from '../shared/rateLimit';
import { verifyTurnstile } from '../shared/turnstile';
import { sendEmail } from '../shared/sendgrid';
import {
  successResponse,
  validationErrorResponse,
  turnstileErrorResponse,
  rateLimitResponse,
  unsupportedMediaTypeResponse,
  serverErrorResponse,
  serviceUnavailableResponse,
  emailSendFailedResponse,
} from '../shared/response';
import { logRequest, LogLevel } from '../shared/logger';

/**
 * Azure Function HTTP handler for contact form submissions
 */
export default async function contactHandler(
  context: Context,
  req: HttpRequest
): Promise<HttpResponseSimple> {
  const startTime = Date.now();
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  const clientIp = getClientIp(req);

  let status = 500;
  let errorCode: string | undefined;

  try {
    // Check if SendGrid API key is configured (preview environment protection)
    if (!process.env.SENDGRID_API_KEY) {
      status = 503;
      errorCode = 'SERVICE_UNAVAILABLE';
      logRequest({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        route: '/api/contact',
        method: req.method,
        correlationId,
        clientIp,
        status,
        latencyMs: Date.now() - startTime,
        errorCode,
      });
      return serviceUnavailableResponse();
    }

    // Validate Content-Type
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      status = 415;
      errorCode = 'UNSUPPORTED_MEDIA_TYPE';
      logRequest({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        route: '/api/contact',
        method: req.method,
        correlationId,
        clientIp,
        status,
        latencyMs: Date.now() - startTime,
        errorCode,
      });
      return unsupportedMediaTypeResponse();
    }

    // Parse request body
    let body: unknown;
    try {
      body = req.body;
    } catch {
      status = 400;
      errorCode = 'VALIDATION_ERROR';
      return validationErrorResponse([{ field: 'body', message: 'Invalid JSON body.' }]);
    }

    // Validate request payload
    const validation: ValidationResult = validateContactRequest(body);
    if (!validation.isValid) {
      status = 400;
      errorCode = 'VALIDATION_ERROR';
      logRequest({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        route: '/api/contact',
        method: req.method,
        correlationId,
        clientIp,
        status,
        latencyMs: Date.now() - startTime,
        errorCode,
      });
      return validationErrorResponse(validation.errors);
    }

    const { name, email, subject, message, turnstileToken } = validation.data!;

    // Check rate limit
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      status = 429;
      errorCode = 'RATE_LIMIT';
      logRequest({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        route: '/api/contact',
        method: req.method,
        correlationId,
        clientIp,
        status,
        latencyMs: Date.now() - startTime,
        errorCode,
      });
      return rateLimitResponse();
    }

    // Verify Turnstile token
    const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);
    if (!turnstileResult.success) {
      status = 400;
      errorCode = 'TURNSTILE_FAILED';
      logRequest({
        timestamp: new Date().toISOString(),
        level: LogLevel.WARN,
        route: '/api/contact',
        method: req.method,
        correlationId,
        clientIp,
        status,
        latencyMs: Date.now() - startTime,
        errorCode,
      });
      return turnstileErrorResponse();
    }

    // Send email via SendGrid
    const emailResult = await sendEmail({
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    if (!emailResult.success) {
      status = 502;
      errorCode = 'EMAIL_SEND_FAILED';
      logRequest({
        timestamp: new Date().toISOString(),
        level: LogLevel.ERROR,
        route: '/api/contact',
        method: req.method,
        correlationId,
        clientIp,
        status,
        latencyMs: Date.now() - startTime,
        errorCode,
      });
      return emailSendFailedResponse();
    }

    // Success
    status = 200;
    logRequest({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      route: '/api/contact',
      method: req.method,
      correlationId,
      clientIp,
      status,
      latencyMs: Date.now() - startTime,
    });

    return successResponse();
  } catch (error) {
    status = 500;
    errorCode = 'SERVER_ERROR';
    logRequest({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      route: '/api/contact',
      method: req.method,
      correlationId,
      clientIp,
      status,
      latencyMs: Date.now() - startTime,
      errorCode,
    });
    return serverErrorResponse();
  }
}

/**
 * Extract client IP from request headers
 */
function getClientIp(req: HttpRequest): string {
  // Check x-forwarded-for header first
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }

  // Check x-client-ip header
  const clientIp = req.headers['x-client-ip'];
  if (clientIp) {
    return clientIp;
  }

  // Fallback to socket remote address (may not be available in Azure Functions)
  return 'unknown';
}
