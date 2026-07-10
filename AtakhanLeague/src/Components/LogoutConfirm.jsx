import { useEffect } from 'react';

// Modern logout confirmation modal with League-flavored choices:
//   "Recall to base" (recall = teleport home in LoL → log out)
//   "One more game"   (the classic gamer excuse → stay logged in)
export default function LogoutConfirm({ open, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm logout-backdrop"
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-[rgba(12,12,12,0.92)] border border-[rgba(220,20,60,0.4)] px-8 py-9 text-center shadow-[0_0_60px_rgba(139,0,0,0.5),inset_0_0_28px_rgba(102,0,0,0.08)] logout-card">
        {/* Accent top line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)]" />

        {/* Icon */}
        <div className="mx-auto mb-5 w-16 h-16 rounded-2xl grid place-items-center bg-[rgba(220,20,60,0.12)] border border-[rgba(220,20,60,0.45)] shadow-[0_0_24px_rgba(220,20,60,0.35)]">
          <svg className="w-8 h-8 text-[#DC143C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </div>

        <h2
          id="logout-title"
          className="font-heading text-white text-[28px] sm:text-[32px] tracking-wide leading-tight [text-shadow:0_0_18px_rgba(139,0,0,0.7)]"
        >
          Are you sure you want to logout?
        </h2>
        <p className="font-body text-neutral-400 text-[15px] mt-3">
          The Rift never forgets a champion. It'll be here when you return.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {/* Stay */}
          <button
            onClick={onCancel}
            autoFocus
            className="btn-ripple relative overflow-hidden flex-1 rounded-[16px] px-6 py-3.5 font-slogan text-[11px] font-bold uppercase tracking-[2px] cursor-pointer text-neutral-300 border border-[rgba(102,0,0,0.4)] bg-[length:300%_300%] bg-[linear-gradient(270deg,#1a1a1a,#2d2d2d,#3a3a3a,#2d2d2d,#1a1a1a)] animate-wind-flow-register transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:border-[#660000]"
          >
            One more game
          </button>
          {/* Logout */}
          <button
            onClick={onConfirm}
            className="btn-ripple relative overflow-hidden flex-1 rounded-[16px] px-6 py-3.5 font-slogan text-[11px] font-bold uppercase tracking-[2px] cursor-pointer text-white border-0 bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_0_24px_rgba(220,20,60,0.6)]"
          >
            Recall to base
          </button>
        </div>
      </div>

      <style>{`
        @keyframes logoutBackdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes logoutCardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .logout-backdrop { animation: logoutBackdropIn 0.25s ease both; }
        .logout-card { animation: logoutCardIn 0.32s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
    </div>
  );
}
