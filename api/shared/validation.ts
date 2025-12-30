/**
 * Request validation for contact form
 * Validates and sanitizes incoming request payloads
 */

export interface ContactRequestData {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: ContactRequestData;
}

// Control characters to reject (ASCII 0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F)
const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;

// Email validation regex (RFC-like pattern)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Check if value contains control characters
 */
export function hasControlCharacters(value: string): boolean {
  return CONTROL_CHAR_REGEX.test(value);
}

/**
 * Validate string field
 */
export function validateStringField(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number
): ValidationError | null {
  if (typeof value !== 'string') {
    return { field, message: `${field} must be a string.` };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { field, message: `${field} must be at least ${minLength} character(s).` };
  }

  if (trimmed.length > maxLength) {
    return { field, message: `${field} must be at most ${maxLength} characters.` };
  }

  if (hasControlCharacters(trimmed)) {
    return { field, message: `${field} contains invalid characters.` };
  }

  return null;
}

/**
 * Validate email field
 */
export function validateEmailField(value: unknown): ValidationError | null {
  if (typeof value !== 'string') {
    return { field: 'email', message: 'Email must be a string.' };
  }

  const trimmed = value.trim();

  if (trimmed.length < 3 || trimmed.length > 254) {
    return { field: 'email', message: 'Email must be between 3 and 254 characters.' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { field: 'email', message: 'Invalid email format.' };
  }

  if (hasControlCharacters(trimmed)) {
    return { field: 'email', message: 'Email contains invalid characters.' };
  }

  return null;
}

/**
 * Validate contact request payload
 */
export function validateContactRequest(body: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if body is an object
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request body must be a JSON object.' }],
    };
  }

  const data = body as Record<string, unknown>;

  // Validate name
  const nameError = validateStringField(data.name, 'name', 1, 80);
  if (nameError) errors.push(nameError);

  // Validate email
  const emailError = validateEmailField(data.email);
  if (emailError) errors.push(emailError);

  // Validate subject
  const subjectError = validateStringField(data.subject, 'subject', 1, 120);
  if (subjectError) errors.push(subjectError);

  // Validate message
  const messageError = validateStringField(data.message, 'message', 1, 2000);
  if (messageError) errors.push(messageError);

  // Validate turnstileToken
  const tokenError = validateStringField(data.turnstileToken, 'turnstileToken', 10, 5000);
  if (tokenError) errors.push(tokenError);

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Return validated and trimmed data
  return {
    isValid: true,
    errors: [],
    data: {
      name: (data.name as string).trim(),
      email: (data.email as string).trim(),
      subject: (data.subject as string).trim(),
      message: (data.message as string).trim(),
      turnstileToken: (data.turnstileToken as string).trim(),
    },
  };
}
