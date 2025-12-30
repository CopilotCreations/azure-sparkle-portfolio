/**
 * Cloudflare Turnstile verification
 * Verifies Turnstile tokens with Cloudflare's API
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Verify Turnstile token with Cloudflare
 * @param token - Turnstile token from client
 * @param remoteIp - Client IP address
 * @returns Verification result
 */
export async function verifyTurnstile(token: string, remoteIp: string): Promise<TurnstileResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY not configured');
    return { success: false, errorCodes: ['missing-secret-key'] };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    formData.append('remoteip', remoteIp);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return { success: false, errorCodes: ['verification-request-failed'] };
    }

    const result = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    return {
      success: result.success === true,
      errorCodes: result['error-codes'],
    };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, errorCodes: ['verification-exception'] };
  }
}
