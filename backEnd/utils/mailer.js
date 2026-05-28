import { Resend } from 'resend';

// Lazy-init so the module loads even if env not yet ready at import time.
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is missing — add it to backEnd/.env and restart the server');
  }
  _resend = new Resend(key);
  return _resend;
}

// Without a verified custom domain, Resend allows sending only from `onboarding@resend.dev`
// and only TO the email you signed up with. Verify a domain in Resend dashboard to send anywhere.
const FROM_ADDRESS = 'Atakhan League <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';


export async function sendResetPasswordEmail(to, token) {
  const link = `${FRONTEND_URL}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #fff;">
      <h1 style="color: #DC143C; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px;">
        Atakhan League
      </h1>
      <h2 style="color: #fff; font-size: 22px; margin: 24px 0 12px;">Reset your password</h2>
      <p style="color: #ccc; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
        Someone requested a password reset for your Atakhan League account.
        If this wasn't you, you can safely ignore this email.
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${link}"
           style="display: inline-block; padding: 14px 28px; background: #8B0000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; font-size: 13px;">
          Reset Password
        </a>
      </p>
      <p style="color: #888; font-size: 13px; line-height: 20px;">
        Or paste this link in your browser:<br/>
        <span style="color: #DC143C; word-break: break-all;">${link}</span>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #333;">
        This link expires in 1 hour. — Atakhan League
      </p>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Reset your Atakhan League password',
    html,
  });
}



export async function sendContactEmail({ username, email, topic, message }) {
  // Where contact form submissions go — your own admin email
  const adminEmail = process.env.ADMIN_EMAIL || 'atakhanleague@gmail.com';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #fff;">
      <h1 style="color: #DC143C; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px;">
        New Contact Message
      </h1>
      <table style="width: 100%; color: #ccc; font-size: 14px; line-height: 22px; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #999; width: 140px;">Summoner</td><td style="color: #fff;">${username}</td></tr>
        <tr><td style="padding: 8px 0; color: #999;">Email</td><td style="color: #fff;">${email}</td></tr>
        <tr><td style="padding: 8px 0; color: #999;">Topic</td><td style="color: #DC143C; font-weight: bold;">${topic}</td></tr>
      </table>
      <h3 style="color: #fff; margin: 24px 0 8px;">Message:</h3>
      <div style="background: #1a1a1a; padding: 16px; border-left: 3px solid #DC143C; color: #ddd; font-size: 14px; line-height: 22px; white-space: pre-wrap;">${message}</div>
    </div>
  `;

  return getResend().emails.send({
    from: FROM_ADDRESS,
    to: adminEmail,
    replyTo: email,
    subject: `[${topic}] Contact from ${username}`,
    html,
  });
}
