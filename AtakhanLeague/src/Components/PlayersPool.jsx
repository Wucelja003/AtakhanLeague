import { useEffect, useState } from 'react';
import { api } from '../api';
import useReveal from '../utils/useReveal';
import { LANES, LANE_META, POOL_TEAM_NAMES, buildPoolTeams } from '../utils/pool';

// Built from LANES rather than written out, so the display order can't drift
// from the order the grouping indexes by.
const roles = LANES.map((key) => ({ key, ...LANE_META[key] }));

// One slot per lane per stand-in team.
const SLOTS_PER_ROLE = POOL_TEAM_NAMES.length;

// Same arrangement as the board: its own section standalone, a plain block
// when it sits in a column of the Registrations section.
function Shell({ embedded, innerRef, children }) {
  if (embedded) return <div ref={innerRef} className="w-full">{children}</div>;
  return (
    <section ref={innerRef} className="relative z-[2] mt-[100px] px-5 pt-4 pb-20">
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

// `registrations` — pass static data (e.g. the tutorial demo) to skip the live fetch.
// `tournament` — which tournament's pool this is; solo entries that don't name
// it are left out. Without one it pools everything, as it always did.
export default function PlayersPool({ registrations: regProp, tournament }) {
  const [fetched, setFetched] = useState([]);
  const { ref, shown, animate } = useReveal({ threshold: 0 });

  // Both the first fetch and the polling wait until the board is actually on
  // screen. It sits well below the fold, so on mount it was competing with the
  // page load for a request, then polling every 15s for the rest of the session
  // whether or not anyone had scrolled to it.
  useEffect(() => {
    if (regProp || !shown) return; // static data, or not reached yet
    let alive = true;
    const fetchData = () =>
      fetch(api('/registration/individuals'))
        .then((r) => r.json())
        .then((data) => alive && setFetched(Array.isArray(data) ? data : []))
        .catch(() => {});
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [regProp, shown]);

  // Solo registrations don't carry a tournament yet — the backend has no field
  // for it. A pool that belongs to one therefore shows only entries naming it,
  // which is none for now: an empty pool per tournament is honest, the same
  // five players shown under both would not be.
  const registrations = regProp ?? (tournament ? fetched.filter((r) => r.tournament === tournament.id) : fetched);

  // Same grouping the Tournament Board reads, so a team shown as complete here
  // is exactly the one that earns a slot there.
  const poolTeams = buildPoolTeams(registrations);

  // Remaining = SLOTS_PER_ROLE − filled in that role (capped at 0)
  const remainingByRole = roles.reduce((acc, role) => {
    const taken = registrations.filter((reg) => reg.role === role.key).length;
    acc[role.key] = SLOTS_PER_ROLE - Math.min(taken, SLOTS_PER_ROLE);
    return acc;
  }, {});

  return (
    <Shell embedded={Boolean(tournament)} innerRef={ref}>
        {tournament && (
          <p className="text-center font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-2">
            {tournament.label} · {tournament.divisions}
          </p>
        )}
        <h2 className="text-center font-heading text-white text-[32px] sm:text-[44px] mb-2.5 [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)]">
          {tournament ? `${tournament.label} Players Pool` : 'Players Pool'}
        </h2>
        <p className="text-center font-body text-[15px] sm:text-[20px] text-neutral-300 mb-8 sm:mb-12 px-4">
          A list of individually registered players competing in this tournament.
        </p>

        {/* Teams grid */}
        <div className="flex flex-wrap justify-center gap-4">
          {poolTeams.map(({ name: teamName, lineup, isFull: isTeamFull }) => (
              <div
                key={teamName}
                className={`relative overflow-hidden flex flex-col gap-2 w-full sm:w-[260px] rounded-xl border px-4 py-5 backdrop-blur-md transition-colors duration-500 ${
                  isTeamFull
                    ? `bg-[rgba(8,8,8,0.72)] border-[rgba(70,70,70,0.45)] shadow-[0_0_26px_rgba(0,0,0,0.5),inset_0_0_18px_rgba(70,70,70,0.12)] ${
                        animate ? 'animate-roster-seal' : ''
                      }`
                    : 'bg-[rgba(10,10,10,0.65)] border-[rgba(102,0,0,0.35)] shadow-[0_0_32px_rgba(102,0,0,0.15),inset_0_0_16px_rgba(102,0,0,0.05)]'
                }`}
              >
                {isTeamFull && (
                  <span
                    className={`absolute top-2.5 right-2.5 z-[2] rounded bg-[rgba(60,60,60,0.8)] border border-[rgba(80,80,80,0.5)] px-[7px] py-[3px] font-slogan text-[9px] font-bold tracking-[2px] text-neutral-400 ${
                      animate ? 'animate-roster-badge' : ''
                    }`}
                  >
                    FULL
                  </span>
                )}

                <h3
                  className={`text-center font-slogan text-[13px] font-bold tracking-[2px] uppercase pb-3 mb-1 border-b transition-colors duration-500 ${
                    isTeamFull
                      ? 'text-neutral-300 border-[rgba(80,80,80,0.4)]'
                      : 'text-white border-[rgba(102,0,0,0.4)] [text-shadow:0_0_12px_rgba(220,20,60,0.4)]'
                  }`}
                >
                  {teamName}
                </h3>

                {roles.map((role, i) => {
                  const player = lineup[i];
                  return (
                    <div
                      key={role.key}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-black/40 border transition-colors duration-300 ${
                        isTeamFull
                          ? 'border-[rgba(80,80,80,0.28)]'
                          : 'border-[rgba(102,0,0,0.2)] hover:border-[rgba(102,0,0,0.6)] hover:bg-[rgba(102,0,0,0.12)]'
                      }`}
                    >
                      <img
                        src={role.img}
                        alt={role.label}
                        className={`w-[22px] h-[22px] object-contain shrink-0 transition-[filter] duration-500 ${
                          isTeamFull ? 'grayscale' : ''
                        }`}
                      />
                      {/* Names keep their full contrast on a sealed card — the
                          point of the roster is who's on it. Only the chrome
                          around them goes grey. */}
                      <span
                        className={`font-slogan text-[13px] tracking-wider truncate ${
                          player ? 'text-white font-semibold' : 'text-neutral-500'
                        }`}
                      >
                        {player?.username || role.label}
                      </span>
                    </div>
                  );
                })}

                {/* Last in the card and barely there, so it passes over the
                    names without ever dimming one. */}
                {isTeamFull && animate && (
                  <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)] animate-roster-sheen" />
                )}
              </div>
          ))}
        </div>

        {/* Available slots tracker */}
        <div className="mt-12">
          <h3 className="text-center font-slogan text-[13px] font-bold tracking-[3px] uppercase text-neutral-400 mb-5">
            Available Slots
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map((role) => {
              const remaining = remainingByRole[role.key];
              const isFull = remaining === 0;
              return (
                <div
                  key={role.key}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl border px-4 pt-6 pb-5 backdrop-blur-md transition-all duration-300 ${
                    isFull
                      ? 'border-[rgba(60,60,60,0.4)] opacity-50 pointer-events-none shadow-none'
                      : 'bg-[rgba(10,10,10,0.65)] border-[rgba(102,0,0,0.35)] shadow-[0_0_32px_rgba(102,0,0,0.15),inset_0_0_16px_rgba(102,0,0,0.05)] hover:border-[rgba(220,20,60,0.5)] hover:shadow-[0_0_40px_rgba(102,0,0,0.3),inset_0_0_16px_rgba(102,0,0,0.08)]'
                  }`}
                >
                  {isFull && (
                    <span className="absolute top-2.5 right-2.5 rounded bg-[rgba(60,60,60,0.8)] border border-[rgba(80,80,80,0.5)] px-[7px] py-[3px] font-slogan text-[9px] font-bold tracking-[2px] text-neutral-500">
                      FULL
                    </span>
                  )}
                  <img
                    src={role.img}
                    alt={role.label}
                    className={`w-9 h-9 object-contain ${isFull ? 'grayscale' : ''}`}
                  />
                  <span className="font-slogan text-[11px] font-bold tracking-[2px] uppercase text-neutral-300">
                    {role.label}
                  </span>
                  <span
                    className={`font-heading text-[52px] leading-none ${
                      isFull
                        ? 'text-[#444]'
                        : 'text-[#DC143C] [text-shadow:0_0_20px_rgba(220,20,60,0.6),0_0_40px_rgba(139,0,0,0.4)]'
                    }`}
                  >
                    {remaining}
                  </span>
                  <span className="font-slogan text-[10px] tracking-[2px] uppercase text-[#666]">
                    remaining
                  </span>
                </div>
              );
            })}
          </div>
        </div>
    </Shell>
  );
}
