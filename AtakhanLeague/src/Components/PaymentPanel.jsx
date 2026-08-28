import { useEffect, useState } from 'react';
import { api } from '../api';

const eur = (cents) => `${(cents / 100).toFixed(2).replace(/\.00$/, '')} €`;

// Entry-fee status + payment starter for a registration.
//
// The price is asked for rather than passed in: it used to be a string written
// into the profile page ("30€", "6€"), which stayed put through two changes of
// fee. The server knows what this registration's tournament charges, and what
// each method adds on top.
export default function PaymentPanel({ paid }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(null);
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    if (paid) return;
    let alive = true;
    fetch(api('/payment/quote'), { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setQuote(d))
      .catch(() => {});
    return () => { alive = false; };
  }, [paid]);

  if (paid) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.3)] px-4 py-2.5">
        <svg className="w-4 h-4 text-[#4ade80] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#4ade80]">
          Entry fee paid
        </span>
      </div>
    );
  }

  async function pay(method) {
    setLoading(method);
    setError(null);
    try {
      const res = await fetch(api('/payment/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.message || 'Could not start payment');
      window.location.href = data.url; // hosted checkout (PayPal / NOWPayments)
    } catch (e) {
      setError(e.message);
      setLoading('');
    }
  }

  return (
    <div className="mt-4 rounded-lg bg-black/30 border border-[rgba(102,0,0,0.35)] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-slogan text-[12px] tracking-wider text-neutral-300">
          Entry fee{' '}
          <span className="text-white font-bold">{quote ? eur(quote.base) : '—'}</span>
          <span className="text-[#DC143C] font-bold ml-2 uppercase text-[10px] tracking-[2px]">Pending</span>
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login hover:animate-wind-flow-fast transition-all"
        >
          Pay entry fee
        </button>
      </div>

      {open && quote?.paypalSurcharge > 0 && (
        <p className="mt-3 font-body text-[11px] leading-5 text-neutral-500">
          PayPal charges the league {eur(quote.paypalSurcharge)} per transaction, so it&apos;s added
          to that option. Crypto costs nothing extra.
        </p>
      )}

      {open && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => pay('paypal')}
            disabled={!!loading}
            className="flex-1 font-slogan text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C] transition-colors disabled:opacity-50"
          >
            {loading === 'paypal'
              ? 'Opening…'
              : `PayPal${quote ? ` · ${eur(quote.paypal)}` : ''}`}
          </button>
          <button
            onClick={() => pay('crypto')}
            disabled={!!loading}
            className="flex-1 font-slogan text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C] transition-colors disabled:opacity-50"
          >
            {loading === 'crypto' ? 'Opening…' : 'Pay with Crypto'}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 font-body text-[12px] text-[#ef4444]">{error}</p>
      )}
    </div>
  );
}
