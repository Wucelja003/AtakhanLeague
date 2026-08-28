import { useState, useEffect } from 'react';
import { api } from '../api';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import TeamRoster from '../Components/TeamRoster';
import RiotStats from '../Components/RiotStats';
import PaymentPanel from '../Components/PaymentPanel';

const roleIcons = {
  top: '/Icons/Top_icon.png',
  jungle: '/Icons/Jungle_icon.png',
  mid: '/Icons/Middle_icon.png',
  adc: '/Icons/Bottom_icon.png',
  support: '/Icons/Support_icon.png',
};

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const [registration, setRegistration] = useState({ team: null, individual: null });
  const [regLoading, setRegLoading] = useState(false);

  // Fetch current user's registration on mount
  useEffect(() => {
    if (!currentUser) return;
    fetch(api('/registration/me'), { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) return { team: null, individual: null };
        const d = await r.json();
        return { team: d?.team || null, individual: d?.individual || null };
      })
      .then((data) => setRegistration(data))
      .catch(() => setRegistration({ team: null, individual: null }));
  }, [currentUser]);

  const handleCancelRegistration = async (type) => {
    if (!confirm(`Cancel your ${type} registration?`)) return;
    setRegLoading(true);
    try {
      const res = await fetch(api(`/registration/${type}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data.success === false) return;
      setRegistration((prev) => ({ ...prev, [type]: null }));
    } finally {
      setRegLoading(false);
    }
  };

  if (!currentUser) return null;

  const unpaidTeam = registration.team && !registration.team.paid;
  const unpaidIndividual = registration.individual && !registration.individual.paid;
  // Whether a fee is outstanding, not how much — the amount comes from the
  // server inside PaymentPanel, since it depends on which tournament they
  // entered. It was written here as '30€'/'6€' and survived two price changes.
  const unpaidFee = unpaidTeam || unpaidIndividual;

  return (
    <div className="relative min-h-screen px-5 py-12">
      <div className="mx-auto max-w-3xl flex flex-col gap-5">
        {/* Unpaid entry-fee alert — the first thing they see */}
        {unpaidFee && (
          <div className="rounded-2xl bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.45)] px-6 py-5 shadow-[0_0_32px_rgba(220,20,60,0.2)] animate-form-fade-in">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full grid place-items-center bg-[rgba(220,20,60,0.15)] border border-[rgba(220,20,60,0.5)] animate-pulse">
                <svg className="w-4 h-4 text-[#DC143C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="font-slogan text-[13px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  Entry fee pending
                </p>
                <p className="font-body text-[13px] text-neutral-300 mt-1">
                  Your spot isn't final until the entry fee is paid. Complete it below to lock it in.
                </p>
                <PaymentPanel paid={false} />
              </div>
            </div>
          </div>
        )}

        {/* Riot profile (op.gg-style) — or fallback if no linked Riot account */}
        {currentUser.riotPuuid ? (
          <RiotStats />
        ) : (
          <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-8 py-8 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] text-center">
            <h2 className="font-heading text-white text-[32px] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
              {currentUser.username}
            </h2>
            <p className="font-body text-[13px] text-neutral-400 mt-3">
              Your Riot account isn't linked yet, so live stats can't be shown.
            </p>
          </div>
        )}

        {/* Tournament Registration */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-6 sm:px-8 py-7 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)]">
          <div className="mb-5">
            <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-1">
              Tournament
            </p>
            <h3 className="font-heading text-white text-[22px] leading-none tracking-wide">
              Your Registration
            </h3>
          </div>

          {/* Individual registration */}
          {registration.individual && (
            <div className="rounded-xl bg-[rgba(220,20,60,0.06)] border border-[rgba(220,20,60,0.3)] px-5 py-5 mb-3">
              <div className="flex items-center gap-4">
                <img
                  src={roleIcons[registration.individual.role]}
                  alt={registration.individual.role}
                  className="w-12 h-12 object-contain shrink-0 [filter:drop-shadow(0_0_8px_rgba(220,20,60,0.5))]"
                />
                <div className="flex-1">
                  <p className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] mb-1">
                    Individual — Solo Player
                  </p>
                  <p className="font-heading text-white text-[20px] leading-tight tracking-wide capitalize">
                    {registration.individual.role}
                    <span className="text-neutral-400 text-[14px] ml-2">
                      • {registration.individual.division}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleCancelRegistration('individual')}
                  disabled={regLoading}
                  className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              <PaymentPanel paid={registration.individual.paid} />
            </div>
          )}

          {/* Team registration */}
          {registration.team && (
            <div className="rounded-xl bg-[rgba(220,20,60,0.06)] border border-[rgba(220,20,60,0.3)] px-5 py-5 mb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgba(220,20,60,0.15)] border border-[rgba(220,20,60,0.4)] shrink-0">
                  <svg className="w-6 h-6 text-[#DC143C]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] mb-1">
                    Team Captain
                  </p>
                  <p className="font-heading text-white text-[20px] leading-tight tracking-wide">
                    {registration.team.name}
                    <span className="text-neutral-400 text-[14px] ml-2">
                      • {registration.team.division}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleCancelRegistration('team')}
                  disabled={regLoading}
                  className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
              <PaymentPanel paid={registration.team.paid} />
            </div>
          )}

          {/* Empty state */}
          {!registration.individual && !registration.team && (
            <div className="rounded-xl bg-black/30 border border-dashed border-[rgba(102,0,0,0.4)] px-5 py-7 text-center">
              <p className="font-body text-[14px] text-neutral-400 mb-4">
                You are not registered for any tournament yet.
              </p>
              <Link
                to="/"
                className="inline-block font-slogan text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-lg text-secondary border border-[rgba(102,0,0,0.4)] bg-black/40 hover:text-white hover:border-[#DC143C] transition-colors"
              >
                Sign up for next tournament →
              </Link>
            </div>
          )}

          {/* Team roster — only for captains */}
          {registration.team && (
            <div className="mt-6 pt-6 border-t border-[rgba(102,0,0,0.3)]">
              <TeamRoster />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
