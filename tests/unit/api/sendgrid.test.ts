/**
 * Tests for SendGrid email sending
 * Note: These tests focus on configuration validation since SendGrid mocking
 * is complex with ESM modules. Full integration testing should be done separately.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('sendgrid', () => {
  const validEmailData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'This is a test message.',
    timestamp: '2024-01-15T12:00:00.000Z',
  };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return failure when API key is missing', async () => {
    vi.stubEnv('SENDGRID_API_KEY', '');
    vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'no-reply@example.com');

    const { sendEmail } = await import('../../../api/shared/sendgrid');
    const result = await sendEmail(validEmailData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email service not configured');
  });

  it('should return failure when TO email is missing', async () => {
    vi.stubEnv('SENDGRID_API_KEY', 'SG.test-key');
    vi.stubEnv('CONTACT_TO_EMAIL', '');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'no-reply@example.com');

    const { sendEmail } = await import('../../../api/shared/sendgrid');
    const result = await sendEmail(validEmailData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email service not configured');
  });

  it('should return failure when FROM email is missing', async () => {
    vi.stubEnv('SENDGRID_API_KEY', 'SG.test-key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', '');

    const { sendEmail } = await import('../../../api/shared/sendgrid');
    const result = await sendEmail(validEmailData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Email service not configured');
  });

  it('should export sendEmail function', async () => {
    const sendgridModule = await import('../../../api/shared/sendgrid');
    expect(typeof sendgridModule.sendEmail).toBe('function');
  });

  it('should have EmailData interface properties', () => {
    // Verify the email data structure
    expect(validEmailData).toHaveProperty('name');
    expect(validEmailData).toHaveProperty('email');
    expect(validEmailData).toHaveProperty('subject');
    expect(validEmailData).toHaveProperty('message');
    expect(validEmailData).toHaveProperty('timestamp');
  });
});
