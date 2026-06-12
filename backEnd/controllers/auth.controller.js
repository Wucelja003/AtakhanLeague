import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';
import { sendResetPasswordEmail, sendWelcomeEmail } from '../utils/mailer.js';
import { getAccountByRiotId } from '../utils/riot.js';

// Cookie options — always secure + sameSite:'none' so cookie travels from
// the Vercel frontend (atakhanleague.com) to the Railway backend (api.atakhanleague.com).
// In local dev with HTTPS proxy via Vite this still works; if you ever run pure
// http://localhost the browser will block it — that's the expected tradeoff.
const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

export const signup = async (req, res, next) => {
  const { username, email, password, tagLine } = req.body;

  if (!tagLine) {
    return next(errorHandler(400, 'Riot tag is required (e.g. EUW, KR1, EUNE)'));
  }

  try {
    // 1) Verify the Riot account exists BEFORE creating the user
    let riotAccount;
    try {
      riotAccount = await getAccountByRiotId(username, tagLine);
    } catch (err) {
      console.error('[riot] verify failed:', err.message);
      return next(errorHandler(503, 'Could not verify Riot account. Please try again in a moment.'));
    }
    if (!riotAccount) {
      return next(errorHandler(404, `Riot account ${username}#${tagLine} not found. Check spelling.`));
    }

    // 2) Create the user with verified Riot data attached
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        riotPuuid:    riotAccount.puuid,
        riotGameName: riotAccount.gameName,
        riotTagLine:  riotAccount.tagLine,
      },
    });

    // Send welcome email — don't block signup on email failure
    sendWelcomeEmail(newUser.email, newUser.username).catch((err) => {
      console.error('[mail] Failed to send welcome email:', err.message);
    });

    // Auto-login: set cookie + return user so frontend can route to /profile
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...rest } = newUser;
    res.cookie('access_token', token, cookieOpts).status(201).json(rest);
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint: email, username, or riotPuuid
      const field = error.meta?.target?.[0] || 'account';
      return next(errorHandler(409, `That ${field} is already in use`));
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const validUser = await prisma.user.findUnique({ where: { email } });
    if (!validUser) return next(errorHandler(404, 'User not found'));

    // Summoner Name mora da matchuje istom nalogu kao email
    if (validUser.username !== username) {
      return next(errorHandler(401, 'Wrong credentials'));
    }

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

    const token = jwt.sign({ id: validUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...rest } = validUser;
    res.cookie('access_token', token, cookieOpts).status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  // We respond with success regardless of whether the email exists,
  // to prevent attackers from probing which emails are registered.
  const successResponse = () =>
    res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return successResponse();

    // Generate random token (1h expiry)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    await sendResetPasswordEmail(user.email, token);
    return successResponse();
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(errorHandler(400, 'Password must be at least 6 characters'));
  }

  try {
    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return next(errorHandler(400, 'Reset link is invalid or has expired'));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token', cookieOpts);
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};
