import nodemailer from 'nodemailer';

/**
 * Send Email Utility using Nodemailer & Gmail SMTP (sendEmail.js)
 * 
 * What it does:
 * - Sends 6-digit HTML verification OTP emails using Gmail SMTP.
 * - Reads EMAIL_USER and EMAIL_PASS securely from environment variables (.env).
 * - Never exposes email credentials in frontend or source code.
 * - If EMAIL_USER / EMAIL_PASS are missing in local dev, prints formatted console logs to prevent crashes.
 */
export const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // Development Fallback: If credentials not set, log formatted console OTP
  if (!emailUser || !emailPass) {
    console.log(`=================================`);
    console.log(`✉️ SIMULATED GMAIL OTP EMAIL (Configure EMAIL_USER & EMAIL_PASS in backend/.env for live delivery)`);
    console.log(`📩 Destination Email: ${options.email}`);
    console.log(`📌 Subject:           ${options.subject}`);
    console.log(`⏱️ OTP Expiry:        5 Minutes`);
    console.log(`=================================`);
    return { messageId: 'simulated-dev-id' };
  }

  // Create reusable Nodemailer transporter object using Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Blinkit Support" <${emailUser}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Real Email Sent to ${options.email}: Message ID ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Nodemailer Email Error: ${error.message}`);
    throw error;
  }
};

export default sendEmail;
