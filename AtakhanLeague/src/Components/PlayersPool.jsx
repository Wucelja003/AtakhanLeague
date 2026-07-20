import { useEffect, useState } from 'react';
import { api } from '../api';

const roles = [
  { key: 'top', label: 'Top', img: '/Icons/Top_icon.png' },
  { key: 'jungle', label: 'Jungle', img: '/Icons/Jungle_icon.png' },
  { key: 'mid', label: 'Mid', img: '/Icons/Middle_icon.png' },
  { key: 'adc', label: 'ADC', img: '/Icons/Bottom_icon.png' },
  { key: 'support', label: 'Support', img: '/Icons/Support_icon.png' },
];

const TEAM_NAMES = [
  'Team Alpha', 'Team Beta'
];
const SLOTS_PER_ROLE = TEAM_NAMES.length; // 8 teams

// `registrations` — pass static data (e.g. the tutorial demo) to skip the live fetch.
export default function PlayersPool({ registrations: regProp }) {
  const [fetched, setFetched] = useState([]);

  // Fetch on mount + poll every 15s so new registrations show up live
  useEffect(() => {
    if (regProp) return; // static data provided — don't fetch
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
  }, [regProp]);

  const registrations = regProp ?? fetched;

  // Group registrations by role → array of usernames
  const byRole = roles.reduce((acc, r) => {
    acc[r.key] = registrations
      .filter((reg) => reg.role === r.key)
      .map((reg) => reg.username);
    return acc;
  }, {});

  // For each (team index, role) find the player at that index for that role.
  // Distribution: 1st mid registrant → Team Alpha mid, 2nd → Team Beta mid, etc.
  function getPlayer(teamIndex, roleKey) {
    return byRole[roleKey]?.[teamIndex] || '';
  }

  // Remaining = SLOTS_PER_ROLE − filled in that role (capped at 0)
  const remainingByRole = roles.reduce((acc, role) => {
    const filled = Math.min(byRole[role.key].length, SLOTS_PER_ROLE);
    acc[role.key] = SLOTS_PER_ROLE - filled;
    return acc;
  }, {});

  return (
    <section className="relative z-[2] mt-[100px] px-5 pt-4 pb-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-heading text-white text-[32px] sm:text-[44px] mb-2.5 [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)]">
          Players Pool
        </h2>
        <p className="text-center font-body text-[15px] sm:text-[20px] text-neutral-300 mb-8 sm:mb-12 px-4">
          A list of individually registered players competing in this tournament.
        </p>

        {/* Teams grid */}
        <div className="flex flex-wrap justify-center gap-4">
          {TEAM_NAMES.map((teamName, teamIndex) => (
            <div
              key={teamName}
              className="flex flex-col gap-2 w-full sm:w-[260px] rounded-xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-4 py-5 backdrop-blur-md shadow-[0_0_32px_rgba(102,0,0,0.15),inset_0_0_16px_rgba(102,0,0,0.05)]"
            >
              <h3 className="text-center font-slogan text-[13px] font-bold tracking-[2px] uppercase text-white pb-3 mb-1 border-b border-[rgba(102,0,0,0.4)] [text-shadow:0_0_12px_rgba(220,20,60,0.4)]">
                {teamName}
              </h3>

              {roles.map((role) => {
                const player = getPlayer(teamIndex, role.key);
                return (
                  <div
                    key={role.key}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-black/40 border border-[rgba(102,0,0,0.2)] transition-colors duration-300 hover:border-[rgba(102,0,0,0.6)] hover:bg-[rgba(102,0,0,0.12)]"
                  >
                    <img src={role.img} alt={role.label} className="w-[22px] h-[22px] object-contain shrink-0" />
                    <span
                      className={`font-slogan text-[13px] tracking-wider truncate ${
                        player ? 'text-white font-semibold' : 'text-neutral-500'
                      }`}
                    >
                      {player || role.label}
                    </span>
                  </div>
                );
              })}
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
      </div>
    </section>
  );
}
