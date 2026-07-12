import { Link } from 'react-router-dom';
import SEO from '../Components/SEO';

export default function PaymentCancel() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <SEO title="Payment cancelled" path="/payment/cancel" noindex />
      <div className="w-full max-w-md rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-8 py-10 text-center backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22)] animate-form-fade-in">
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl grid place-items-center bg-[rgba(220,20,60,0.12)] border border-[rgba(220,20,60,0.45)]">
          <svg className="w-8 h-8 text-[#DC143C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-heading text-white text-[30px] tracking-wide leading-none [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
          Payment cancelled
        </h1>
        <p className="font-body text-[14px] text-neutral-400 mt-4">
          No worries — nothing was charged. Your spot isn't final until the entry fee is paid. You can try again anytime from your profile.
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
