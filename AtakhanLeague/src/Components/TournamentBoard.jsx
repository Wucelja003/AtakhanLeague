import { useEffect, useState } from 'react';
import { api } from '../api';

const TOTAL_SLOTS = 8; // Number of teams competing in the tournament

export default function TournamentBoard() {
  const [teams, setTeams] = useState([]);

  // Fetch on mount + poll every 15s so new team registrations show up live
  useEffect(() => {
    let alive = true;
    const fetchData = () =>
      fetch(api('/registration/teams'))
        .then((r) => r.json())
        .then((data) => alive && setTeams(Array.isArray(data) ? data : []))
        .catch(() => {});
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const filled = Math.min(teams.length, TOTAL_SLOTS);
  const remaining = TOTAL_SLOTS - filled;

  // Build display rows: filled teams first, then empty slots
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => teams[i] || null);

  return (
    <section className="relative z-[2] mt-[80px] sm:mt-[100px] px-5 pb-12">
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Registered Teams
            </span>
          </div>
          <h2 className="font-heading text-white text-[32px] sm:text-[44px] leading-none [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)]">
            Tournament Board
          </h2>
          <p className="font-body text-[14px] sm:text-[16px] text-neutral-400 mt-3">
            <span className="text-white font-bold">{filled}</span> of{' '}
            <span className="text-white font-bold">{TOTAL_SLOTS}</span> team slots filled
            {remaining > 0 && (
              <> · <span className="text-secondary">{remaining}</span> remaining</>
            )}
          </p>
        </div>

        {/* Table card */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] overflow-hidden animate-form-fade-in">
          {/* Header row */}
          <div className="grid grid-cols-[40px_1fr_1fr] gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
            <span className="font-slogan text-[10px] sm:text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C]">
              #
            </span>
            <span className="font-slogan text-[10px] sm:text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C]">
              Team
            </span>
            <span className="text-right font-slogan text-[10px] sm:text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C]">
              Captain
            </span>
          </div>

          {/* Team rows */}
          {slots.map((team, i) => (
            <div
              key={i}
              className={`grid grid-cols-[40px_1fr_1fr] gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-[rgba(102,0,0,0.15)] last:border-b-0 transition-colors ${
                team
                  ? 'hover:bg-[rgba(139,0,0,0.08)]'
                  : 'bg-black/20'
              }`}
            >
              {/* Position */}
              <span
                className={`font-heading text-[20px] sm:text-[22px] leading-none ${
                  team ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {i + 1}
              </span>

              {/* Team name (left) */}
              <div className="flex items-center min-w-0">
                {team ? (
                  <>
                    <span className="font-slogan text-[14px] sm:text-[16px] font-bold tracking-wide text-white truncate">
                      {team.name}
                    </span>
                    <span className="hidden sm:inline ml-3 font-slogan text-[10px] uppercase tracking-wider text-neutral-500">
                      {team.division}
                    </span>
                  </>
                ) : (
                  <span className="font-slogan text-[12px] sm:text-[13px] uppercase tracking-wider text-neutral-600 italic">
                    Awaiting team...
                  </span>
                )}
              </div>

              {/* Captain (right) */}
              <div className="flex items-center justify-end min-w-0">
                {team ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                    </svg>
                    <span className="font-slogan text-[13px] sm:text-[15px] font-semibold text-[#d4af37] truncate">
                      {team.captainUsername}
                    </span>
                  </div>
                ) : (
                  <span className="font-slogan text-[11px] tracking-wider text-neutral-700">
                    —
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
