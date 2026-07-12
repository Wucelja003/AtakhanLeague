import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './db.js';
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import contactRouter from './routes/contact.routes.js'
import registrationRouter from './routes/registration.routes.js'
import teamRouter from './routes/team.routes.js'
import riotRouter from './routes/riot.routes.js'
import paymentRouter from './routes/payment.routes.js'

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // e.g. https://atakhan-league.vercel.app or your custom domain
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without origin (curl, server-to-server, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Payment webhooks need the RAW body for signature verification, so parse them
// as a Buffer BEFORE the global JSON parser consumes the stream.
app.use('/api/payment/webhook', express.raw({ type: '*/*' }));

app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/contact', contactRouter);
app.use('/api/registration', registrationRouter);
app.use('/api/team', teamRouter);
app.use('/api/riot', riotRouter);
app.use('/api/payment', paymentRouter);

app.get('/', (req, res) => {
  res.json({
    status: 'Atakhan League API is running',
    site: 'https://atakhanleague.com',
  });
});

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
