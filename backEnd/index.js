import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './db.js';
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import contactRouter from './routes/contact.routes.js'
import registrationRouter from './routes/registration.routes.js'

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/contact', contactRouter);
app.use('/api/registration', registrationRouter);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});


app.get('/api/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    next(err);
  }
});


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[${statusCode}] ${req.method} ${req.path} →`, message);
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
