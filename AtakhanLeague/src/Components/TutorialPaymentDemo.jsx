import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, MapPin, ChevronRight, User, Wallet, Bitcoin } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

// Visual-only: shows WHERE the entry-fee field lives on the Profile and what it
// looks like (choose PayPal or Crypto). No charge, no redirect, no confirmation.
export default function TutorialPaymentDemo({ onClose }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const methodBtn =
    'flex-1 inline-flex items-center justify-center gap-2 font-slogan text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C] transition-colors';

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center px-4 py-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative my-auto w-full max-w-lg rounded-2xl bg-[rgba(10,10,10,0.92)] border border-[rgba(102,0,0,0.35)] px-7 py-7 backdrop-blur-md shadow-[0_0_60px_rgba(102,0,0,0.35),inset_0_0_24px_rgba(102,0,0,0.06)]"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)] font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C] animate-pulse" />
            Demo preview
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Where to find it on the site */}
        <div className="flex items-center gap-2 mb-4 rounded-lg border border-[rgba(102,0,0,0.3)] bg-black/30 px-3 py-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#DC143C]" />
          <span className="flex items-center font-slogan text-[11px] tracking-wider">
            <span className="text-neutral-400">Profile</span>
            <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-neutral-600" />
            <span className="text-[#DC143C]">Entry fee</span>
          </span>
          <span className="ml-auto font-slogan text-[9px] font-bold uppercase tracking-[1.5px] text-neutral-600">
            top-right menu
          </span>
        </div>

        {/* Mock "blank" profile so it's clear where the field lives */}
        <div className="rounded-xl border border-[rgba(102,0,0,0.3)] bg-black/30 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-full grid place-items-center bg-[linear-gradient(135deg,#2a0a0a,#7B1A1A)] border border-[rgba(220,20,60,0.4)] shadow-[0_0_18px_rgba(139,0,0,0.4)]">
              <User className="w-6 h-6 text-[#DC143C]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-white text-[20px] leading-none tracking-wide">AtakhanKing</p>
              <div className="mt-2.5 flex gap-2">
                <span className="h-2.5 w-24 rounded bg-white/[0.06] animate-pulse" />
                <span className="h-2.5 w-16 rounded bg-white/[0.06] animate-pulse" />
              </div>
            </div>
          </div>

          <div>
            <p className="font-slogan text-[9px] font-bold uppercase tracking-[2px] text-neutral-600 mb-2">
              Your Registration
            </p>
            <div className="h-10 rounded-lg bg-white/[0.03] border border-[rgba(102,0,0,0.2)] animate-pulse" />
          </div>

          {/* The entry-fee field — highlighted so the eye lands on it */}
          <div className="relative mt-1 rounded-xl border-2 border-dashed border-[rgba(220,20,60,0.55)] bg-[rgba(220,20,60,0.04)] p-3.5 pt-4 shadow-[0_0_24px_rgba(220,20,60,0.12)]">
            <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded bg-[#150404] border border-[rgba(220,20,60,0.5)] font-slogan text-[9px] font-bold uppercase tracking-[1.5px] text-[#DC143C]">
              ← Choose how you pay
            </span>

            <div className="flex items-center justify-between gap-3">
              <p className="font-slogan text-[13px] tracking-wider text-neutral-300">
                Entry fee <span className="text-white font-bold">30,00 €</span>
              </p>
              <span className="font-slogan text-[10px] font-bold uppercase tracking-[2px] px-2 py-0.5 rounded border text-[#f59e0b] border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)]">
                Pending
              </span>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
              <span className={methodBtn}>
                <Wallet className="w-4 h-4" />
                Pay with PayPal
              </span>
              <span className={methodBtn}>
                <Bitcoin className="w-4 h-4" />
                Pay with Crypto
              </span>
            </div>
          </div>
        </div>

        <p className="font-body text-[12px] text-neutral-500 mt-4">
          30 € per team, 6 € solo. Pick a method and you finish payment on the provider's page.
        </p>
      </motion.div>
    </motion.div>
  );
}
