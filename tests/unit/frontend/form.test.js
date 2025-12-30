/**
 * Tests for form validation
 */

import { describe, it, expect } from 'vitest';
import { validateField } from '../../../src/js/form.js';

describe('form validation', () => {
  describe('name validation', () => {
    it('should return error for empty name', () => {
      expect(validateField('name', '')).toBe('Name must be between 1 and 80 characters.');
      expect(validateField('name', '   ')).toBe('Name must be between 1 and 80 characters.');
    });

    it('should return error for name too long', () => {
      const longName = 'a'.repeat(81);
      expect(validateField('name', longName)).toBe('Name must be between 1 and 80 characters.');
    });

    it('should return null for valid name', () => {
      expect(validateField('name', 'John')).toBeNull();
      expect(validateField('name', 'John Doe')).toBeNull();
      expect(validateField('name', 'a'.repeat(80))).toBeNull();
    });

    it('should handle single character name', () => {
      expect(validateField('name', 'J')).toBeNull();
    });

    it('should handle name with special characters', () => {
      expect(validateField('name', "O'Brien")).toBeNull();
      expect(validateField('name', 'José García')).toBeNull();
    });
  });

  describe('email validation', () => {
    it('should return error for empty email', () => {
      expect(validateField('email', '')).toBe('Please enter a valid email address.');
    });

    it('should return error for invalid email format', () => {
      expect(validateField('email', 'invalid')).toBe('Please enter a valid email address.');
      expect(validateField('email', 'invalid@')).toBe('Please enter a valid email address.');
      expect(validateField('email', '@example.com')).toBe('Please enter a valid email address.');
    });

    it('should return null for valid email', () => {
      expect(validateField('email', 'test@example.com')).toBeNull();
      expect(validateField('email', 'user.name@domain.org')).toBeNull();
    });

    it('should handle email with plus sign', () => {
      expect(validateField('email', 'user+tag@example.com')).toBeNull();
    });

    it('should handle email with subdomain', () => {
      expect(validateField('email', 'user@mail.example.co.uk')).toBeNull();
    });

    it('should return error for email without domain extension', () => {
      expect(validateField('email', 'user@example')).toBe('Please enter a valid email address.');
    });
  });

  describe('subject validation', () => {
    it('should return error for empty subject', () => {
      expect(validateField('subject', '')).toBe('Subject must be between 1 and 120 characters.');
    });

    it('should return error for subject too long', () => {
      const longSubject = 'a'.repeat(121);
      expect(validateField('subject', longSubject)).toBe(
        'Subject must be between 1 and 120 characters.'
      );
    });

    it('should return null for valid subject', () => {
      expect(validateField('subject', 'Hello')).toBeNull();
      expect(validateField('subject', 'a'.repeat(120))).toBeNull();
    });

    it('should handle subject at boundary', () => {
      expect(validateField('subject', 'a'.repeat(119))).toBeNull();
      expect(validateField('subject', 'a'.repeat(120))).toBeNull();
    });
  });

  describe('message validation', () => {
    it('should return error for empty message', () => {
      expect(validateField('message', '')).toBe('Message must be between 1 and 2000 characters.');
    });

    it('should return error for message too long', () => {
      const longMessage = 'a'.repeat(2001);
      expect(validateField('message', longMessage)).toBe(
        'Message must be between 1 and 2000 characters.'
      );
    });

    it('should return null for valid message', () => {
      expect(validateField('message', 'Hello')).toBeNull();
      expect(validateField('message', 'a'.repeat(2000))).toBeNull();
    });

    it('should handle multiline message', () => {
      expect(validateField('message', 'Line 1\nLine 2\nLine 3')).toBeNull();
    });

    it('should handle message with special characters', () => {
      expect(validateField('message', 'Hello! How are you? <test> & more')).toBeNull();
    });
  });

  describe('unknown field', () => {
    it('should return null for unknown field', () => {
      expect(validateField('unknown', 'value')).toBeNull();
    });

    it('should return null for any unknown field name', () => {
      expect(validateField('foo', 'bar')).toBeNull();
      expect(validateField('random', '')).toBeNull();
    });
  });

  describe('whitespace handling', () => {
    it('should trim whitespace for name validation', () => {
      expect(validateField('name', '  John  ')).toBeNull();
    });

    it('should trim whitespace for email validation', () => {
      expect(validateField('email', '  test@example.com  ')).toBeNull();
    });

    it('should reject only whitespace', () => {
      expect(validateField('name', '     ')).toBe('Name must be between 1 and 80 characters.');
      expect(validateField('subject', '\t\n')).toBe(
        'Subject must be between 1 and 120 characters.'
      );
    });
  });
});
