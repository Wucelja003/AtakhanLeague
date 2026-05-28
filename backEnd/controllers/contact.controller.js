import { errorHandler } from '../utils/error.js';
import { sendContactEmail } from '../utils/mailer.js';

export const submitContact = async (req, res, next) => {
  const { username, email, topic, message } = req.body;

  if (!username || !email || !topic || !message) {
    return next(errorHandler(400, 'All fields are required'));
  }
  if (!email.includes('@')) {
    return next(errorHandler(400, 'Invalid email address'));
  }

  try {
    await sendContactEmail({ username, email, topic, message });
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    next(error);
  }
};
