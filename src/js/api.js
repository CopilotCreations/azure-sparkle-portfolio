/**
 * API utility functions
 * Handles HTTP requests with timeout and error handling
 */

const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Make a POST request with JSON body
 * @param {string} url - Request URL
 * @param {Object} body - Request body
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Response data
 */
export async function postJson(url, body, options = {}) {
  const { timeout = DEFAULT_TIMEOUT } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (_e) {
      throw new ApiError('Invalid JSON response', response.status, 'INVALID_RESPONSE');
    }

    // Handle non-2xx responses
    if (!response.ok) {
      throw new ApiError(
        data.message || 'Request failed',
        response.status,
        data.code || 'REQUEST_FAILED',
        data.details
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, 'TIMEOUT');
    }

    throw new ApiError('Network error', 0, 'NETWORK_ERROR');
  }
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  /**
   * Create an API error
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {string} code - Error code
   * @param {Array} details - Additional error details
   */
  constructor(message, status, code, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
