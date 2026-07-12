import express from 'express';
import {
  createPayment,
  capturePaypal,
  nowpaymentsWebhook,
  paypalWebhook,
} from '../controllers/payment.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// User-initiated
router.post('/create', verifyToken, createPayment);
// Capture is keyed by the unguessable PayPal order token and is idempotent, so
// it must NOT depend on the login session (which can drop during the redirect).
router.post('/paypal/capture', capturePaypal);

// Provider webhooks (no auth; verified by signature). Bodies arrive raw —
// see the express.raw mount for /api/payment/webhook in index.js.
router.post('/webhook/nowpayments', nowpaymentsWebhook);
router.post('/webhook/paypal', paypalWebhook);

export default router;
