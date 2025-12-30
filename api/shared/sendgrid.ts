/**
 * SendGrid email sending
 * Sends contact form submissions via SendGrid API
 */

import sgMail from '@sendgrid/mail';

export interface EmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send contact form email via SendGrid
 * @param data - Email data from contact form
 * @returns Send result
 */
export async function sendEmail(data: EmailData): Promise<EmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error('SendGrid configuration missing');
    return { success: false, error: 'Email service not configured' };
  }

  sgMail.setApiKey(apiKey);

  const emailSubject = `[Portfolio Contact] ${data.subject}`;
  const emailBody = formatEmailBody(data);

  try {
    await sgMail.send({
      to: toEmail,
      from: fromEmail,
      subject: emailSubject,
      text: emailBody,
      html: formatEmailHtml(data),
    });

    return { success: true };
  } catch (error) {
    console.error('SendGrid send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format email body as plain text
 */
function formatEmailBody(data: EmailData): string {
  return `
New contact form submission

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}
Timestamp: ${data.timestamp}

Message:
${data.message}
`.trim();
}

/**
 * Format email body as HTML
 */
function formatEmailHtml(data: EmailData): string {
  const escapeHtml = (str: string) =>
    str.replace(/[&<>"']/g, (char) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return map[char];
    });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #d946ef); padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 16px; }
    .field-label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .field-value { color: #111827; }
    .message { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
    .footer { margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">From</div>
        <div class="field-value">${escapeHtml(data.name)}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
      </div>
      <div class="field">
        <div class="field-label">Subject</div>
        <div class="field-value">${escapeHtml(data.subject)}</div>
      </div>
      <div class="field">
        <div class="field-label">Message</div>
        <div class="message">${escapeHtml(data.message)}</div>
      </div>
      <div class="footer">
        Received at ${escapeHtml(data.timestamp)}
      </div>
    </div>
  </div>
</body>
</html>
`.trim();
}
