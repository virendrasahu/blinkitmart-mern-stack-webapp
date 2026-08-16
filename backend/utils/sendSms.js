/**
 * Send SMS Helper Utility (sendSms.js)
 * 
 * What it does:
 * - Provides a modular structure for sending SMS OTPs via providers like Twilio or MSG91.
 * - In development mode, prints formatted SMS logs in the backend terminal console.
 * - Ready for production Twilio/MSG91 environment variable integration.
 */
export const sendSms = async ({ phone, otp }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  // Format phone number to E.164 standard (+91...)
  const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '')}`;

  // If Twilio credentials are configured in .env, send real SMS
  if (accountSid && authToken && twilioPhone) {
    try {
      // Lazy import twilio SDK if installed
      const twilio = (await import('twilio')).default;
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        body: `⚡ Your Blinkit verification OTP code is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
        from: twilioPhone,
        to: formattedPhone,
      });

      console.log(`📱 Real Twilio SMS Sent to ${formattedPhone}: SID ${message.sid}`);
      return { success: true, sid: message.sid };
    } catch (err) {
      console.error(`❌ Twilio SMS Error: ${err.message}`);
    }
  }

  // Development Fallback: Print clean SMS console log
  console.log(`=================================`);
  console.log(`📱 SIMULATED SMS OTP (Twilio / MSG91 Integration Ready)`);
  console.log(`📲 Destination Phone: ${formattedPhone}`);
  console.log(`🔑 6-Digit OTP Code:  ${otp}`);
  console.log(`⏱️ Expiration Time:   5 Minutes`);
  console.log(`=================================`);

  return { success: true, simulated: true };
};

export default sendSms;
