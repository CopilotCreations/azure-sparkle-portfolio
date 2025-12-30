/**
 * Tests for logger module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logRequest, LogLevel } from '../../../api/shared/logger';

describe('logger', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log request as JSON', () => {
    const entry = {
      timestamp: '2024-01-15T12:00:00.000Z',
      level: LogLevel.INFO,
      route: '/api/contact',
      method: 'POST',
      correlationId: 'test-correlation-id',
      clientIp: '192.168.1.1',
      status: 200,
      latencyMs: 150,
    };

    logRequest(entry);

    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(entry));
  });

  it('should log INFO level', () => {
    const entry = {
      timestamp: '2024-01-15T12:00:00.000Z',
      level: LogLevel.INFO,
      route: '/api/contact',
      method: 'POST',
      correlationId: 'id',
      clientIp: '127.0.0.1',
      status: 200,
      latencyMs: 100,
    };

    logRequest(entry);

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.level).toBe('INFO');
  });

  it('should log WARN level', () => {
    const entry = {
      timestamp: '2024-01-15T12:00:00.000Z',
      level: LogLevel.WARN,
      route: '/api/contact',
      method: 'POST',
      correlationId: 'id',
      clientIp: '127.0.0.1',
      status: 429,
      latencyMs: 50,
      errorCode: 'RATE_LIMIT',
    };

    logRequest(entry);

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.level).toBe('WARN');
    expect(logged.errorCode).toBe('RATE_LIMIT');
  });

  it('should log ERROR level', () => {
    const entry = {
      timestamp: '2024-01-15T12:00:00.000Z',
      level: LogLevel.ERROR,
      route: '/api/contact',
      method: 'POST',
      correlationId: 'id',
      clientIp: '127.0.0.1',
      status: 500,
      latencyMs: 200,
      errorCode: 'SERVER_ERROR',
    };

    logRequest(entry);

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.level).toBe('ERROR');
  });

  it('should include all required fields', () => {
    const entry = {
      timestamp: '2024-01-15T12:00:00.000Z',
      level: LogLevel.INFO,
      route: '/api/contact',
      method: 'POST',
      correlationId: 'abc123',
      clientIp: '10.0.0.1',
      status: 200,
      latencyMs: 75,
    };

    logRequest(entry);

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.timestamp).toBe('2024-01-15T12:00:00.000Z');
    expect(logged.route).toBe('/api/contact');
    expect(logged.method).toBe('POST');
    expect(logged.correlationId).toBe('abc123');
    expect(logged.clientIp).toBe('10.0.0.1');
    expect(logged.status).toBe(200);
    expect(logged.latencyMs).toBe(75);
  });

  it('should handle optional errorCode field', () => {
    const entryWithError = {
      timestamp: '2024-01-15T12:00:00.000Z',
      level: LogLevel.WARN,
      route: '/api/contact',
      method: 'POST',
      correlationId: 'id',
      clientIp: '127.0.0.1',
      status: 400,
      latencyMs: 50,
      errorCode: 'VALIDATION_ERROR',
    };

    logRequest(entryWithError);

    const logged = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logged.errorCode).toBe('VALIDATION_ERROR');
  });

  describe('LogLevel enum', () => {
    it('should have INFO level', () => {
      expect(LogLevel.INFO).toBe('INFO');
    });

    it('should have WARN level', () => {
      expect(LogLevel.WARN).toBe('WARN');
    });

    it('should have ERROR level', () => {
      expect(LogLevel.ERROR).toBe('ERROR');
    });
  });
});
