// Payment provider helpers — PayPal (Orders v2 REST) and NOWPayments (crypto).
// The payer completes payment on the provider's hosted page; we only create the
// checkout and verify the completion webhook. No card/crypto data touches us.
import crypto from 'crypto';

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://atakhanleague.com';
// Public URL of THIS backend (for provider callbacks), e.g. https://api.atakhanleague.com
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'https://api.atakhanleague.com';

// ---- PayPal --------------------------------------------------------------

const PAYPAL_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

async function paypalToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error('PayPal credentials are not set');
  const auth = Buffer.from(`${id}:${secret}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

// Create an order and return { externalId, approveUrl }.
export async function createPaypalOrder(amountCents, orderId) {
  const token = await paypalToken();
  const value = (amountCents / 100).toFixed(2);
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: orderId,
          description: 'Atakhan League tournament entry fee',
          amount: { currency_code: 'EUR', value },
        },
      ],
      application_context: {
        brand_name: 'Atakhan League',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: `${FRONTEND_URL}/payment/success?provider=paypal`,
        cancel_url: `${FRONTEND_URL}/payment/cancel`,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal order failed: ${res.status} ${JSON.stringify(data)}`);
  const approve = (data.links || []).find((l) => l.rel === 'approve');
  return { externalId: data.id, approveUrl: approve?.href };
}

// Capture an approved order. Returns { completed, orderId } where orderId is our
// custom_id so the caller can reconcile.
export async function capturePaypalOrder(paypalOrderId) {
  const token = await paypalToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal capture failed: ${res.status} ${JSON.stringify(data)}`);
  const pu = data.purchase_units?.[0];
  const capture = pu?.payments?.captures?.[0];
  return {
    completed: data.status === 'COMPLETED' || capture?.status === 'COMPLETED',
    orderId: pu?.custom_id || capture?.custom_id || null,
  };
}

// Verify a PayPal webhook against PayPal's verification API. Returns boolean.
export async function verifyPaypalWebhook(headers, rawBody) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) throw new Error('PAYPAL_WEBHOOK_ID is not set');
  const token = await paypalToken();
  const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody.toString('utf8')),
    }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.verification_status === 'SUCCESS';
}

// ---- NOWPayments (crypto) ------------------------------------------------

const NOWPAYMENTS_BASE = process.env.NOWPAYMENTS_API_BASE || 'https://api.nowpayments.io';

// Create a hosted invoice and return { externalId, invoiceUrl }.
export async function createNowpaymentsInvoice(amountCents, orderId) {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error('NOWPAYMENTS_API_KEY is not set');
  const res = await fetch(`${NOWPAYMENTS_BASE}/v1/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: amountCents / 100,
      price_currency: 'eur',
      order_id: orderId,
      order_description: 'Atakhan League tournament entry fee',
      ipn_callback_url: `${PUBLIC_API_URL}/api/payment/webhook/nowpayments`,
      success_url: `${FRONTEND_URL}/payment/success?provider=crypto`,
      cancel_url: `${FRONTEND_URL}/payment/cancel`,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`NOWPayments invoice failed: ${res.status} ${JSON.stringify(data)}`);
  return { externalId: String(data.id), invoiceUrl: data.invoice_url };
}

// Recursively sort object keys (NOWPayments signs the sorted JSON).
function sortObject(obj) {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortObject(obj[k]);
        return acc;
      }, {});
  }
  return obj;
}

// Verify a NOWPayments IPN: HMAC-SHA512 of the sorted JSON with the IPN secret.
export function verifyNowpaymentsIpn(rawBody, signatureHeader) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) throw new Error('NOWPAYMENTS_IPN_SECRET is not set');
  if (!signatureHeader) return false;
  const parsed = JSON.parse(rawBody.toString('utf8'));
  const sorted = JSON.stringify(sortObject(parsed));
  const hmac = crypto.createHmac('sha512', secret).update(sorted).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}
