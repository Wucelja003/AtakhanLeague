import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';

const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
};

export const test = (req, res) => {
  res.json({ message: 'Api route is working' });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(403, 'You can only update your own account'));
  }
  try {
    // Build the data object — only include fields actually sent.
    // Prisma ignores `undefined`, but we explicit-skip empty strings too.
    const data = {};
    if (req.body.username) data.username = req.body.username;
    if (req.body.email) data.email = req.body.email;
    if (req.body.password) data.password = bcrypt.hashSync(req.body.password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });

    const { password, ...rest } = updatedUser;
    res.status(200).json(rest);
  } catch (error) {
    if (error.code === 'P2002') {
      return next(errorHandler(409, 'Email or summoner name already in use'));
    }
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only delete your own account!'));
  }
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.clearCookie('access_token', cookieOpts);
    res.status(200).json('User account has been deleted');
  } catch (error) {
    next(error);
  }
};
