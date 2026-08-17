import { useEffect, useState } from 'react';
import { api } from '../api';
import useReveal from '../utils/useReveal';
import { fullPoolTeams } from '../utils/pool';

// `teams` — pass static data (e.g. the tutorial demo) to skip the live fetch.
// `tournament` — which tournament's board this is; its slot count and name come
// from there. Without one it behaves as it always did: a single 8-slot board.
export default function TournamentBoard({ teams: teamsProp, tournament }) {
  const TOTAL_SLOTS = tournament?.slots ?? 8;
  const [fetched, setFetched] = useState([]);
  const [solo, setSolo] = useState([]);
  const { ref, shown } = useReveal({ threshold: 0 });

  // Both the first fetch and the polling wait until the board is actually on
  // screen. It sits well below the fold, so on mount it was competing with the
  // page load for a request, then polling every 15s for the rest of the session
  // whether or not anyone had scrolled to it.
  useEffect(() => {
    if (teamsProp || !shown) return; // static data, or not reached yet
    let alive = true;
    // Solo players are fetched too: once five of them fill every lane of a
    // stand-in team, that team takes a slot here alongside the registered ones.
    const fetchData = () =>
      Promise.all([
        fetch(api('/registration/teams')).then((r) => r.json()),
        fetch(api('/registration/individuals')).then((r) => r.json()),
      ])
        .then(([teamData, soloData]) => {
          if (!alive) return;
          setFetched(Array.isArray(teamData) ? teamData : []);
          setSolo(Array.isArray(soloData) ? soloData : []);
        })
        .catch(() => {});
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [teamsProp, shown]);

  // Registered teams keep their registration order, then any pool team that has
  // filled all five lanes. Static data (the tutorial demo) is used verbatim.
  //
  // Registrations don't carry a tournament yet — the backend has no field for
  // it. Until they do, a board that belongs to a tournament shows only entries
  // that name it, which is none: better an honest empty board than the same
  // teams listed under both.
  const forThis = (r) => !tournament || r.tournament === tournament.id;
  const teams =
    teamsProp ?? [...fetched.filter(forThis), ...fullPoolTeams(solo.filter(forThis))];

  const filled = Math.min(teams.length, TOTAL_SLOTS);
  const remaining = TOTAL_SLOTS - filled;

  // Build display rows: filled teams first, then empty slots
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => teams[i] || null);

  return (
    <section ref={ref} className="relative z-[2] mt-[80px] sm:mt-[100px] px-5 pb-12">
      <div className="mx-auto max-w-3xl">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              {tournament ? `${tournament.label} · Registered Teams` : 'Registered Teams'}
            </span>
          </div>
          <h2 className="font-heading text-white text-[32px] sm:text-[44px] leading-none [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)]">
            {tournament ? `${tournament.label} Board` : 'Tournament Board'}
          </h2>
          {tournament && (
            <p className="font-slogan text-[11px] uppercase tracking-[2px] text-neutral-500 mt-2">
              {tournament.divisions}
            </p>
          )}
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
                    {team.paid && (
                      <span className="ml-2.5 inline-flex items-center gap-1 shrink-0 rounded px-1.5 py-0.5 font-slogan text-[9px] font-bold uppercase tracking-[1px] text-[#4ade80] bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.35)]">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Paid
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-slogan text-[12px] sm:text-[13px] uppercase tracking-wider text-neutral-600 italic">
                    Awaiting team...
                  </span>
                )}
              </div>

              {/* Captain (right) */}
              <div className="flex items-center justify-end min-w-0">
                {/* A pool team has no captain — five solo players were put
                    together by lane — so it says where it came from instead of
                    borrowing the captain's star. */}
                {team?.fromPool ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    <span className="font-slogan text-[12px] sm:text-[14px] font-semibold text-neutral-400 truncate">
                      Players Pool
                    </span>
                  </div>
                ) : team ? (
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
