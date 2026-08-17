import https from 'https';

/**
 * Send Email Utility using Brevo Transactional Email HTTP API (sendEmail.js)
 * 
 * What it does:
 * - Sends 6-digit HTML verification OTP emails using Brevo REST HTTP API (https://api.brevo.com/v3/smtp/email).
 * - Reads BREVO_API_KEY, BREVO_SENDER_EMAIL, and BREVO_SENDER_NAME securely from environment variables.
 * - Uses Node.js native https module with family: 4 to prevent dual-stack IPv6 DNS resolution timeouts.
 * - Never exposes API credentials in frontend or source code.
 * - Returns success ONLY after Brevo HTTP API confirms acceptance of email request.
 * - Throws an error if Brevo API request fails so caller can return appropriate HTTP error response.
 */
export const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'Virendra2609.vs@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'BlinkitClone';

  const recipientEmail = options.email || options.sendTo;
  const subject = options.subject || 'BlinkitMart - Password Reset OTP';
  const htmlContent = options.html || options.htmlContent;

  if (!recipientEmail) {
    console.error('❌ Brevo password reset email error: Recipient email address is missing!');
    throw new Error('Recipient email address is required');
  }

  if (!apiKey) {
    console.error('❌ Brevo password reset email error: BREVO_API_KEY is missing in backend environment variables!');
    throw new Error('Email service configuration missing');
  }

  const payload = JSON.stringify({
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: recipientEmail,
      },
    ],
    subject: subject,
    htmlContent: htmlContent,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
          'Content-Length': Buffer.byteLength(payload),
        },
        family: 4, // Force IPv4 to prevent IPv6 DNS resolution timeouts on Node/Render
        timeout: 12000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const messageId = parsed.messageId || 'accepted';
              console.log(`✅ Password reset OTP email accepted by Brevo`);
              resolve({ messageId, success: true });
            } else {
              const errorMsg = parsed.message || parsed.code || `HTTP ${res.statusCode}`;
              console.error(`❌ Brevo password reset email error: ${errorMsg}`);
              reject(new Error(`Brevo API Error: ${errorMsg}`));
            }
          } catch (e) {
            console.error(`❌ Brevo password reset email error: ${body}`);
            reject(new Error('Invalid response from Brevo email API'));
          }
        });
      }
    );

    req.on('error', (err) => {
      console.error(`❌ Brevo password reset email error: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('❌ Brevo password reset email error: Request timed out');
      reject(new Error('Brevo API request timed out'));
    });

    req.write(payload);
    req.end();
  });
};

export default sendEmail;
