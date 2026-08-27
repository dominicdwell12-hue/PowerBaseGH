// Centralized environment variable access with startup validation.
// Fail fast at boot if a required variable is missing, instead of
// discovering it mid-request in production.

require('dotenv').config();

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Check your .env file against .env.example.`
    );
  }
}

validateEnv();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiBasePath: process.env.API_BASE_PATH || '/api/v1',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'Arcvan Ghana Limited <onboarding@resend.dev>',
  },

  // Where the storefront's reset-password page lives. The backend never
  // hardcodes a domain — this makes it trivial to point at a staging or
  // production frontend just by changing the env var.
  resetPasswordUrl: process.env.RESET_PASSWORD_URL || 'http://localhost:5173/reset-password',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  payments: {
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY,
    // Separate secret set in the Flutterwave dashboard specifically for
    // verifying webhook calls — not the same as the API secret key.
    flutterwaveWebhookHash: process.env.FLUTTERWAVE_WEBHOOK_HASH,
    // Where the gateway redirects the browser back to after payment;
    // the frontend route there calls GET /payments/verify/:reference.
    callbackUrl: process.env.PAYMENT_CALLBACK_URL || 'http://localhost:5173/payment/callback',
  },

  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
};
