import { useState } from 'react';
import { api } from '../api';

// Entry-fee status + payment starter for a registration.
// `paid` — whether the fee is already paid; `fee` — display label (e.g. "30€").
export default function PaymentPanel({ paid, fee }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(null);

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
          Entry fee <span className="text-white font-bold">{fee}</span>
          <span className="text-[#DC143C] font-bold ml-2 uppercase text-[10px] tracking-[2px]">Pending</span>
        </p>
        <button
          onClick={() => setOpen((o) => !o)}
          className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login hover:animate-wind-flow-fast transition-all"
        >
          Pay entry fee
        </button>
      </div>

      {open && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => pay('paypal')}
            disabled={!!loading}
            className="flex-1 font-slogan text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C] transition-colors disabled:opacity-50"
          >
            {loading === 'paypal' ? 'Opening…' : 'Pay with PayPal'}
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
