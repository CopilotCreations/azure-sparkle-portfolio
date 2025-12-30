/**
 * Contact form handling
 * Manages validation, Turnstile integration, and form submission
 */

import { postJson, ApiError } from './api.js';

// Validation rules
const VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 80,
    message: 'Name must be between 1 and 80 characters.',
  },
  email: {
    minLength: 3,
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address.',
  },
  subject: {
    minLength: 1,
    maxLength: 120,
    message: 'Subject must be between 1 and 120 characters.',
  },
  message: {
    minLength: 1,
    maxLength: 2000,
    message: 'Message must be between 1 and 2000 characters.',
  },
};

let form = null;
let submitBtn = null;
let successBanner = null;
let errorBanner = null;
let turnstileWidgetId = null;
let isSubmitting = false;

/**
 * Validate a single field
 * @param {string} field - Field name
 * @param {string} value - Field value
 * @returns {string|null} Error message or null if valid
 */
export function validateField(field, value) {
  const rules = VALIDATION[field];
  if (!rules) return null;

  const trimmed = value.trim();

  // Check length
  if (trimmed.length < rules.minLength || trimmed.length > rules.maxLength) {
    return rules.message;
  }

  // Check pattern (for email)
  if (rules.pattern && !rules.pattern.test(trimmed)) {
    return rules.message;
  }

  return null;
}

/**
 * Validate all form fields
 * @returns {Object} Validation result with isValid and errors
 */
export function validateForm() {
  const errors = {};
  let isValid = true;

  const fields = ['name', 'email', 'subject', 'message'];

  for (const field of fields) {
    const input = form?.querySelector(`#${field}`);
    if (!input) continue;

    const error = validateField(field, input.value);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Show field error
 * @param {string} field - Field name
 * @param {string} message - Error message
 */
function showFieldError(field, message) {
  const errorEl = document.getElementById(`${field}-error`);
  const inputEl = document.getElementById(field);

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  if (inputEl) {
    inputEl.classList.add('border-red-500');
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.setAttribute('aria-describedby', `${field}-error`);
  }
}

/**
 * Clear field error
 * @param {string} field - Field name
 */
function clearFieldError(field) {
  const errorEl = document.getElementById(`${field}-error`);
  const inputEl = document.getElementById(field);

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }

  if (inputEl) {
    inputEl.classList.remove('border-red-500');
    inputEl.removeAttribute('aria-invalid');
    inputEl.removeAttribute('aria-describedby');
  }
}

/**
 * Clear all field errors
 */
function clearAllErrors() {
  ['name', 'email', 'subject', 'message', 'turnstile'].forEach(clearFieldError);
}

/**
 * Show status banner
 * @param {'success'|'error'} type - Banner type
 */
function showBanner(type) {
  if (type === 'success') {
    successBanner?.classList.remove('hidden');
    errorBanner?.classList.add('hidden');
  } else {
    errorBanner?.classList.remove('hidden');
    successBanner?.classList.add('hidden');
  }
}

/**
 * Hide all banners
 */
function hideBanners() {
  successBanner?.classList.add('hidden');
  errorBanner?.classList.add('hidden');
}

/**
 * Set submit button state
 * @param {boolean} submitting - Whether form is submitting
 */
function setSubmitting(submitting) {
  isSubmitting = submitting;

  if (submitBtn) {
    submitBtn.disabled = submitting;
    submitBtn.textContent = submitting ? 'Sending...' : 'Send Message';
  }
}

/**
 * Get Turnstile token
 * @returns {string|null} Turnstile token or null
 */
function getTurnstileToken() {
  if (typeof window.turnstile === 'undefined' || turnstileWidgetId === null) {
    return null;
  }

  try {
    return window.turnstile.getResponse(turnstileWidgetId);
  } catch (_e) {
    return null;
  }
}

/**
 * Reset Turnstile widget
 */
function resetTurnstile() {
  if (typeof window.turnstile !== 'undefined' && turnstileWidgetId !== null) {
    try {
      window.turnstile.reset(turnstileWidgetId);
    } catch (_e) {
      // Ignore reset errors
    }
  }
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
async function handleSubmit(event) {
  event.preventDefault();

  if (isSubmitting) return;

  // Clear previous state
  hideBanners();
  clearAllErrors();

  // Validate form
  const { isValid, errors } = validateForm();

  if (!isValid) {
    // Show all validation errors
    for (const [field, message] of Object.entries(errors)) {
      showFieldError(field, message);
    }
    return;
  }

  // Check Turnstile token
  const turnstileToken = getTurnstileToken();
  if (!turnstileToken) {
    showFieldError('turnstile', 'Please complete the security check.');
    return;
  }

  // Gather form data
  const formData = {
    name: form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    subject: form.querySelector('#subject').value.trim(),
    message: form.querySelector('#message').value.trim(),
    turnstileToken,
  };

  // Submit form
  setSubmitting(true);

  try {
    await postJson('/api/contact', formData);

    // Success
    showBanner('success');
    form.reset();
    resetTurnstile();
  } catch (error) {
    // Handle specific error types
    if (error instanceof ApiError && error.code === 'VALIDATION_ERROR' && error.details) {
      for (const detail of error.details) {
        showFieldError(detail.field, detail.message);
      }
    } else {
      showBanner('error');
    }
  } finally {
    setSubmitting(false);
  }
}

/**
 * Handle field input for real-time validation
 * @param {Event} event - Input event
 */
function handleInput(event) {
  const field = event.target.id;
  if (!field) return;

  const error = validateField(field, event.target.value);

  if (error) {
    showFieldError(field, error);
  } else {
    clearFieldError(field);
  }
}

/**
 * Initialize Turnstile widget
 */
function initTurnstile() {
  const container = document.getElementById('turnstile-container');
  if (!container) return;

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.warn('Turnstile site key not configured');
    return;
  }

  // Wait for Turnstile script to load
  const checkTurnstile = () => {
    if (typeof window.turnstile !== 'undefined') {
      try {
        turnstileWidgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          theme: 'dark',
        });
      } catch (_e) {
        console.warn('Failed to render Turnstile widget');
      }
    } else {
      setTimeout(checkTurnstile, 100);
    }
  };

  checkTurnstile();
}

/**
 * Initialize contact form
 */
export function initForm() {
  form = document.getElementById('contact-form');
  submitBtn = document.getElementById('submit-btn');
  successBanner = document.getElementById('form-success');
  errorBanner = document.getElementById('form-error');

  if (!form) return;

  // Form submit handler
  form.addEventListener('submit', handleSubmit);

  // Real-time validation on blur
  form.querySelectorAll('input, textarea').forEach((input) => {
    input.addEventListener('blur', handleInput);
  });

  // Initialize Turnstile
  initTurnstile();
}

/**
 * Clean up form resources
 */
export function destroyForm() {
  if (form) {
    form.removeEventListener('submit', handleSubmit);
  }

  form = null;
  submitBtn = null;
  successBanner = null;
  errorBanner = null;
  turnstileWidgetId = null;
  isSubmitting = false;
}
