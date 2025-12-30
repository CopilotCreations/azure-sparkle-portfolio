/**
 * Tests for validation module
 */

import { describe, it, expect } from 'vitest';
import {
  validateContactRequest,
  validateStringField,
  validateEmailField,
  hasControlCharacters,
} from '../../../api/shared/validation';

describe('validation', () => {
  describe('hasControlCharacters', () => {
    it('should return false for normal text', () => {
      expect(hasControlCharacters('Hello World')).toBe(false);
      expect(hasControlCharacters('Test 123!')).toBe(false);
      expect(hasControlCharacters('')).toBe(false);
    });

    it('should return true for control characters', () => {
      expect(hasControlCharacters('Hello\x00World')).toBe(true);
      expect(hasControlCharacters('Test\x08')).toBe(true);
      expect(hasControlCharacters('\x0B')).toBe(true);
      expect(hasControlCharacters('\x0C')).toBe(true);
      expect(hasControlCharacters('\x1F')).toBe(true);
    });

    it('should allow newlines and tabs', () => {
      expect(hasControlCharacters('Hello\nWorld')).toBe(false);
      expect(hasControlCharacters('Hello\tWorld')).toBe(false);
      expect(hasControlCharacters('Hello\rWorld')).toBe(false);
    });
  });

  describe('validateStringField', () => {
    it('should return error for non-string values', () => {
      expect(validateStringField(123, 'name', 1, 80)).toEqual({
        field: 'name',
        message: 'name must be a string.',
      });
      expect(validateStringField(null, 'name', 1, 80)).toEqual({
        field: 'name',
        message: 'name must be a string.',
      });
      expect(validateStringField(undefined, 'name', 1, 80)).toEqual({
        field: 'name',
        message: 'name must be a string.',
      });
    });

    it('should return error for too short values', () => {
      expect(validateStringField('', 'name', 1, 80)).toEqual({
        field: 'name',
        message: 'name must be at least 1 character(s).',
      });
      expect(validateStringField('   ', 'name', 1, 80)).toEqual({
        field: 'name',
        message: 'name must be at least 1 character(s).',
      });
    });

    it('should return error for too long values', () => {
      const longString = 'a'.repeat(81);
      expect(validateStringField(longString, 'name', 1, 80)).toEqual({
        field: 'name',
        message: 'name must be at most 80 characters.',
      });
    });

    it('should return error for control characters', () => {
      expect(validateStringField('Hello\x00', 'name', 1, 80)).toEqual({
        field: 'name',
        message: 'name contains invalid characters.',
      });
    });

    it('should return null for valid values', () => {
      expect(validateStringField('John Doe', 'name', 1, 80)).toBeNull();
      expect(validateStringField('  John Doe  ', 'name', 1, 80)).toBeNull();
    });
  });

  describe('validateEmailField', () => {
    it('should return error for non-string values', () => {
      expect(validateEmailField(123)).toEqual({
        field: 'email',
        message: 'Email must be a string.',
      });
    });

    it('should return error for too short emails', () => {
      expect(validateEmailField('ab')).toEqual({
        field: 'email',
        message: 'Email must be between 3 and 254 characters.',
      });
    });

    it('should return error for invalid email format', () => {
      expect(validateEmailField('invalid')).toEqual({
        field: 'email',
        message: 'Invalid email format.',
      });
      expect(validateEmailField('invalid@')).toEqual({
        field: 'email',
        message: 'Invalid email format.',
      });
      expect(validateEmailField('@example.com')).toEqual({
        field: 'email',
        message: 'Invalid email format.',
      });
      expect(validateEmailField('invalid@example')).toEqual({
        field: 'email',
        message: 'Invalid email format.',
      });
    });

    it('should return null for valid emails', () => {
      expect(validateEmailField('test@example.com')).toBeNull();
      expect(validateEmailField('user.name@domain.org')).toBeNull();
      expect(validateEmailField('user+tag@example.co.uk')).toBeNull();
    });
  });

  describe('validateContactRequest', () => {
    const validRequest = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message.',
      turnstileToken: 'valid-token-12345',
    };

    it('should return error for non-object body', () => {
      expect(validateContactRequest(null)).toEqual({
        isValid: false,
        errors: [{ field: 'body', message: 'Request body must be a JSON object.' }],
      });
      expect(validateContactRequest('string')).toEqual({
        isValid: false,
        errors: [{ field: 'body', message: 'Request body must be a JSON object.' }],
      });
      expect(validateContactRequest([1, 2, 3])).toEqual({
        isValid: false,
        errors: [{ field: 'body', message: 'Request body must be a JSON object.' }],
      });
    });

    it('should validate all required fields', () => {
      const result = validateContactRequest({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.field === 'name')).toBe(true);
      expect(result.errors.some((e) => e.field === 'email')).toBe(true);
      expect(result.errors.some((e) => e.field === 'subject')).toBe(true);
      expect(result.errors.some((e) => e.field === 'message')).toBe(true);
      expect(result.errors.some((e) => e.field === 'turnstileToken')).toBe(true);
    });

    it('should return validated data for valid request', () => {
      const result = validateContactRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
        turnstileToken: 'valid-token-12345',
      });
    });

    it('should trim whitespace from values', () => {
      const result = validateContactRequest({
        name: '  John Doe  ',
        email: '  john@example.com  ',
        subject: '  Test Subject  ',
        message: '  This is a test message.  ',
        turnstileToken: '  valid-token-12345  ',
      });
      expect(result.isValid).toBe(true);
      expect(result.data?.name).toBe('John Doe');
      expect(result.data?.email).toBe('john@example.com');
    });

    it('should reject message with control characters', () => {
      const result = validateContactRequest({
        ...validRequest,
        message: 'Hello\x00World',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'message')).toBe(true);
    });
  });
});
