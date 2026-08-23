// Thin wrapper around Resend for transactional email. Kept isolated here
// so the rest of the codebase never touches the provider SDK directly —
// swapping providers later means editing only this file.

const { Resend } = require('resend');
const env = require('../config/env');

let client = null;
function getClient() {
  if (!env.email.resendApiKey) {
    return null;
  }
  if (!client) {
    client = new Resend(env.email.resendApiKey);
  }
  return client;
}

async function sendPasswordResetEmail(to, resetUrl) {
  const resend = getClient();

  if (!resend) {
    // Fail loudly in logs (so ops notice email isn't configured) but
    // don't throw — a misconfigured mail provider shouldn't 500 the
    // forgot-password endpoint or reveal anything to the requester.
    console.error(
      '[email] RESEND_API_KEY is not set — password reset email was not sent. Reset URL:',
      resetUrl
    );
    return;
  }

  await resend.emails.send({
    from: env.email.from,
    to,
    subject: 'Reset your PowerBase.Gh password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #14213A;">
        <h2 style="color: #14213A;">Reset your password</h2>
        <p>We received a request to reset the password for your PowerBase.Gh account.</p>
        <p>
          <a href="${resetUrl}"
             style="display:inline-block; padding: 12px 24px; background:#C98A2C; color:#14213A;
                    text-decoration:none; border-radius:8px; font-weight:bold;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 30 minutes. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
        <p style="font-size: 12px; color: #78756C;">If the button above doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail };
