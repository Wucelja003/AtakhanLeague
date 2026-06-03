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

// Domain atakhanleague.com is verified in Resend — can send to anyone.
const FROM_ADDRESS = 'Atakhan League <noreply@atakhanleague.com>';
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

// ---- Welcome email (sent on signup) -------------------------------------

const DISCORD_INVITE = 'https://discord.gg/WuNn2G8PxY';

export async function sendWelcomeEmail(to, username) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 32px; background: #0a0a0a; color: #fff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #DC143C; font-size: 32px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px; text-shadow: 0 0 18px rgba(220,20,60,0.4);">
          Atakhan League
        </h1>
        <p style="color: #999; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
          Welcome, Summoner
        </p>
      </div>

      <h2 style="color: #fff; font-size: 24px; margin: 0 0 16px;">Hey ${username}, welcome to the Rift.</h2>

      <p style="color: #ccc; font-size: 15px; line-height: 24px; margin: 0 0 20px;">
        Atakhan League was built for players who live and breathe League of Legends —
        regardless of rank, regardless of division. In honor of Atakhan, the ancient
        demon of bloodshed, we've built a platform worthy of his legacy.
      </p>

      <p style="color: #ccc; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
        Whether you want to register a full squad or sign up solo and get matched —
        every summoner gets a real shot at competing, climbing, and walking away
        with prizes that match their hunger for victory.
      </p>

      <div style="background: rgba(220,20,60,0.08); border-left: 3px solid #DC143C; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #fff; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">
          Next Tournament
        </p>
        <p style="color: #DC143C; font-size: 24px; font-weight: bold; margin: 0;">
          28. June 2026.
        </p>
        <p style="color: #999; font-size: 13px; margin: 8px 0 0;">
          Single-elimination · 4 teams · All divisions · Free entry
        </p>
      </div>

      <h3 style="color: #fff; font-size: 16px; margin: 28px 0 12px;">What's next?</h3>
      <ul style="color: #ccc; font-size: 14px; line-height: 24px; padding-left: 20px; margin: 0 0 24px;">
        <li>Register your team or sign up as a solo player on the site</li>
        <li>Join our Discord — that's where all tournament coordination happens</li>
        <li>Be on Discord 30 minutes before your match starts</li>
      </ul>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${DISCORD_INVITE}"
           style="display: inline-block; padding: 14px 32px; background: #5865F2; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; font-size: 13px;">
          Join Our Discord
        </a>
      </div>

      <p style="color: #888; font-size: 13px; line-height: 20px; text-align: center; margin: 24px 0 0;">
        Or visit <a href="${FRONTEND_URL}" style="color: #DC143C; text-decoration: none;">atakhanleague.com</a>
      </p>

      <p style="color: #666; font-size: 12px; line-height: 18px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
        Good luck, summoner. The Rift remembers the name of every champion who dared to compete.<br/>
        — Atakhan League
      </p>
    </div>
  `;

  // Plain text fallback — improves deliverability (helps avoid Promotions tab)
  const text = `Hey ${username}, welcome to Atakhan League.

Atakhan League was built for players who live and breathe League of Legends — regardless of rank, regardless of division. In honor of Atakhan, the ancient demon of bloodshed, we've built a platform worthy of his legacy.

Whether you want to register a full squad or sign up solo and get matched — every summoner gets a real shot at competing, climbing, and walking away with prizes that match their hunger for victory.

NEXT TOURNAMENT: 28. June 2026.
Single-elimination · 4 teams · All divisions · Free entry

What's next?
- Register your team or sign up as a solo player on the site
- Join our Discord: ${DISCORD_INVITE}
- Be on Discord 30 minutes before your match

Site: ${FRONTEND_URL}

Good luck, summoner. The Rift remembers the name of every champion who dared to compete.
— Atakhan League`;

  return getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: process.env.ADMIN_EMAIL || 'vucelja.web@gmail.com',
    subject: `Welcome to Atakhan League, ${username}`,
    html,
    text,
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.ADMIN_EMAIL || 'vucelja.web@gmail.com'}?subject=Unsubscribe>`,
    },
  });
}

// ---- Tournament registration confirmation -------------------------------

export async function sendTournamentConfirmation(to, { username, type, teamName, role, division }) {
  const isTeam = type === 'team';
  const detailRows = isTeam
    ? `
      <tr><td style="padding: 6px 0; color: #999;">Team Name</td><td style="color: #fff; font-weight: bold;">${teamName}</td></tr>
      <tr><td style="padding: 6px 0; color: #999;">Captain</td><td style="color: #d4af37; font-weight: bold;">${username}</td></tr>
      <tr><td style="padding: 6px 0; color: #999;">Division</td><td style="color: #fff;">${division || '—'}</td></tr>
    `
    : `
      <tr><td style="padding: 6px 0; color: #999;">Summoner</td><td style="color: #fff; font-weight: bold;">${username}</td></tr>
      <tr><td style="padding: 6px 0; color: #999;">Role</td><td style="color: #DC143C; font-weight: bold; text-transform: uppercase;">${role || '—'}</td></tr>
      <tr><td style="padding: 6px 0; color: #999;">Division</td><td style="color: #fff;">${division || '—'}</td></tr>
    `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 32px; background: #0a0a0a; color: #fff;">
      <div style="text-align: center; margin-bottom: 28px;">
        <h1 style="color: #DC143C; font-size: 30px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px;">
          Atakhan League
        </h1>
        <p style="color: #4ade80; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0;">
          ✓ Registration Confirmed
        </p>
      </div>

      <h2 style="color: #fff; font-size: 24px; margin: 0 0 16px;">
        ${isTeam ? `Team locked in, captain.` : `You're in the pool, summoner.`}
      </h2>

      <p style="color: #ccc; font-size: 15px; line-height: 24px; margin: 0 0 24px;">
        ${isTeam
          ? `Your team is officially registered for the next Atakhan League tournament. Get your squad ready — the Rift awaits.`
          : `You've been registered as a solo player. Our organizers will place you on a team before the tournament kicks off.`}
      </p>

      <div style="background: #1a1a1a; padding: 20px 24px; border-radius: 8px; margin: 24px 0;">
        <p style="color: #DC143C; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 12px;">
          Registration Details
        </p>
        <table style="width: 100%; color: #ccc; font-size: 14px; line-height: 22px; border-collapse: collapse;">
          ${detailRows}
        </table>
      </div>

      <div style="background: rgba(220,20,60,0.08); border-left: 3px solid #DC143C; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
        <p style="color: #fff; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">
          Tournament Date
        </p>
        <p style="color: #DC143C; font-size: 22px; font-weight: bold; margin: 0;">
          28. June 2026.
        </p>
      </div>

      <h3 style="color: #fff; font-size: 16px; margin: 28px 0 12px;">What's next?</h3>
      <ul style="color: #ccc; font-size: 14px; line-height: 24px; padding-left: 20px; margin: 0 0 24px;">
        ${isTeam
          ? `<li>Add your 4 remaining players from your <a href="${FRONTEND_URL}/profile" style="color: #DC143C;">Profile page</a></li>`
          : `<li>Watch the Players Pool on the site — you'll see your assigned team there</li>`}
        <li>Join our Discord and stay tuned for the bracket draw</li>
        <li>Be on Discord 30 minutes before your scheduled match</li>
      </ul>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${DISCORD_INVITE}"
           style="display: inline-block; padding: 14px 32px; background: #5865F2; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; font-size: 13px;">
          Join Our Discord
        </a>
      </div>

      <p style="color: #666; font-size: 12px; line-height: 18px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
        Good luck out there. Give everything you've got.<br/>
        — Atakhan League
      </p>
    </div>
  `;

  // Plain text fallback for deliverability
  const text = isTeam
    ? `Team locked in, captain.

Your team is officially registered for the next Atakhan League tournament.

REGISTRATION DETAILS:
Team Name: ${teamName}
Captain: ${username}
Division: ${division || '—'}

TOURNAMENT DATE: 28. June 2026.

What's next?
- Add your 4 remaining players from your Profile page: ${FRONTEND_URL}/profile
- Join our Discord: ${DISCORD_INVITE}
- Be on Discord 30 minutes before your scheduled match

— Atakhan League`
    : `You're in the pool, summoner.

You've been registered as a solo player. Our organizers will place you on a team before the tournament kicks off.

REGISTRATION DETAILS:
Summoner: ${username}
Role: ${(role || '').toUpperCase()}
Division: ${division || '—'}

TOURNAMENT DATE: 28. June 2026.

What's next?
- Watch the Players Pool on the site — you'll see your assigned team
- Join our Discord: ${DISCORD_INVITE}
- Be on Discord 30 minutes before your scheduled match

— Atakhan League`;

  return getResend().emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: process.env.ADMIN_EMAIL || 'vucelja.web@gmail.com',
    subject: isTeam
      ? `Team "${teamName}" is in, ${username}`
      : `${username}, you're in the next tournament`,
    html,
    text,
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.ADMIN_EMAIL || 'vucelja.web@gmail.com'}?subject=Unsubscribe>`,
    },
  });
}
