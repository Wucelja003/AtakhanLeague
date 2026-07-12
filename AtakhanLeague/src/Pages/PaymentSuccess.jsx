import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import SEO from '../Components/SEO';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const provider = params.get('provider');
  const token = params.get('token'); // PayPal order id
  const [state, setState] = useState('working'); // working | paid | pending | error

  useEffect(() => {
    if (provider === 'paypal' && token) {
      // Capture the approved PayPal order; the webhook is a backstop.
      fetch(api('/payment/paypal/capture') + `?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        credentials: 'include',
      })
        .then(async (r) => {
          const d = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(d.message || 'Capture failed');
          setState(d.status === 'paid' ? 'paid' : 'pending');
        })
        .catch(() => setState('error'));
    } else {
      // Crypto (NOWPayments) is confirmed asynchronously by the IPN webhook.
      setState('pending');
    }
  }, [provider, token]);

  const title =
    state === 'paid' ? 'Entry fee paid' :
    state === 'error' ? 'We couldn’t confirm your payment' :
    'Payment received';

  const message =
    state === 'paid'
      ? 'Your spot is locked in, summoner. See you on the Rift.'
      : state === 'error'
        ? 'If you were charged, your status will update shortly. Check your profile in a few minutes.'
        : 'We’re confirming your payment. Your profile will update to “Paid” as soon as it clears — usually within a few minutes.';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <SEO title="Payment" path="/payment/success" noindex />
      <div className="w-full max-w-md rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-8 py-10 text-center backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22)] animate-form-fade-in">
        <div className={`mx-auto mb-6 w-16 h-16 rounded-2xl grid place-items-center border ${
          state === 'error'
            ? 'bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.45)]'
            : 'bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.45)]'
        }`}>
          {state === 'working' ? (
            <svg className="w-8 h-8 text-[#4ade80] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : state === 'error' ? (
            <svg className="w-8 h-8 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h1 className="font-heading text-white text-[30px] tracking-wide leading-none [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
          {title}
        </h1>
        <p className="font-body text-[14px] text-neutral-400 mt-4">
          {message}
        </p>

        <Link
          to="/profile"
          className="inline-block mt-8 font-slogan text-[11px] font-bold uppercase tracking-[2px] px-6 py-3 rounded-xl text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login hover:animate-wind-flow-fast transition-all"
        >
          Back to profile
        </Link>
      </div>
    </div>
  );
}
