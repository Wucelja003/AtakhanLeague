import crypto from 'crypto';
import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';
import {
  createPaypalOrder,
  capturePaypalOrder,
  verifyPaypalWebhook,
  createNowpaymentsInvoice,
  verifyNowpaymentsIpn,
} from '../utils/payments.js';

const TEAM_FEE_CENTS = 3000;       // 30€ — captain pays for the whole team
const INDIVIDUAL_FEE_CENTS = 600;  // 6€ — solo player

// Resolve the caller's registration → { kind, amount } or null.
async function resolveRegistration(userId) {
  const team = await prisma.team.findUnique({ where: { captainId: userId } });
  if (team) return { kind: 'team', amount: TEAM_FEE_CENTS, registration: team };
  const solo = await prisma.individualRegistration.findUnique({ where: { userId } });
  if (solo) return { kind: 'individual', amount: INDIVIDUAL_FEE_CENTS, registration: solo };
  return null;
}

// Mark a payment (and its registration) as paid. Idempotent.
async function markPaymentPaid(orderId, externalId) {
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment) return false;
  if (payment.status === 'paid') return true;

  await prisma.payment.update({
    where: { orderId },
    data: { status: 'paid', ...(externalId ? { externalId: String(externalId) } : {}) },
  });

  const now = new Date();
  if (payment.kind === 'team') {
    await prisma.team.updateMany({
      where: { captainId: payment.userId },
      data: { paid: true, paidAt: now },
    });
  } else {
    await prisma.individualRegistration.updateMany({
      where: { userId: payment.userId },
      data: { paid: true, paidAt: now },
    });
  }
  return true;
}

// ---- POST /api/payment/create -------------------------------------------
export const createPayment = async (req, res, next) => {
  const userId = req.user.id;
  const method = req.body?.method; // 'paypal' | 'crypto'
  if (method !== 'paypal' && method !== 'crypto') {
    return next(errorHandler(400, 'Invalid payment method'));
  }

  try {
    const reg = await resolveRegistration(userId);
    if (!reg) return next(errorHandler(404, 'You have no registration to pay for'));
    if (reg.registration.paid) return next(errorHandler(409, 'Entry fee is already paid'));

    const orderId = crypto.randomUUID();
    const provider = method === 'paypal' ? 'paypal' : 'nowpayments';

    await prisma.payment.create({
      data: { orderId, provider, amount: reg.amount, kind: reg.kind, userId, status: 'pending' },
    });

    let url;
    let externalId;
    if (method === 'paypal') {
      const r = await createPaypalOrder(reg.amount, orderId);
      url = r.approveUrl;
      externalId = r.externalId;
    } else {
      const r = await createNowpaymentsInvoice(reg.amount, orderId);
      url = r.invoiceUrl;
      externalId = r.externalId;
    }

    if (externalId) {
      await prisma.payment.update({ where: { orderId }, data: { externalId: String(externalId) } });
    }
    if (!url) return next(errorHandler(502, 'Could not start payment. Try again.'));

    res.json({ url });
  } catch (err) {
    console.error('[payment] create failed:', err.message);
    next(errorHandler(502, 'Could not start payment. Try again in a moment.'));
  }
};

// ---- POST /api/payment/paypal/capture -----------------------------------
// Called by the success page after PayPal approval (?token=<paypalOrderId>).
export const capturePaypal = async (req, res, next) => {
  const token = req.query.token || req.body?.token;
  if (!token) return next(errorHandler(400, 'Missing PayPal order token'));
  try {
    const { completed, orderId } = await capturePaypalOrder(token);
    if (completed && orderId) {
      await markPaymentPaid(orderId, token);
      return res.json({ status: 'paid' });
    }
    res.json({ status: 'pending' });
  } catch (err) {
    console.error('[payment] paypal capture failed:', err.message);
    next(errorHandler(502, 'Could not confirm PayPal payment'));
  }
};

// ---- POST /api/payment/webhook/nowpayments ------------------------------
// req.body is a raw Buffer (see express.raw mount in index.js).
export const nowpaymentsWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    if (!verifyNowpaymentsIpn(req.body, signature)) {
      return res.status(401).send('Invalid signature');
    }
    const event = JSON.parse(req.body.toString('utf8'));
    const status = event.payment_status;
    if (status === 'finished' || status === 'confirmed') {
      await markPaymentPaid(event.order_id, event.payment_id);
    }
    res.status(200).send('ok');
  } catch (err) {
    console.error('[payment] nowpayments webhook failed:', err.message);
    res.status(400).send('bad request');
  }
};

// ---- POST /api/payment/webhook/paypal -----------------------------------
export const paypalWebhook = async (req, res) => {
  try {
    const ok = await verifyPaypalWebhook(req.headers, req.body);
    if (!ok) return res.status(401).send('Invalid signature');
    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = event.resource?.custom_id;
      if (orderId) await markPaymentPaid(orderId, event.resource?.id);
    }
    res.status(200).send('ok');
  } catch (err) {
    console.error('[payment] paypal webhook failed:', err.message);
    res.status(400).send('bad request');
  }
};
