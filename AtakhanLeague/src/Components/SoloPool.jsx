import { useEffect, useState } from 'react';
import { api } from '../api';
import useReveal from '../utils/useReveal';
import { LANES, LANE_META } from '../utils/pool';

// Solo entrants, by lane.
//
// The old pool dealt them into invented teams called Team Alpha and Team Beta,
// which read as though those were real squads and left an eight-team bracket
// showing two. What anyone actually wants from this is the question a captain
// asks — which lanes are still going spare — so that's what it answers: one row
// per lane, everyone waiting in it, and the gaps shown as gaps.

// `registrations` — static data to skip the live fetch.
// `tournament` — whose pool this is; entries that don't name it are left out.
export default function SoloPool({ registrations: regProp, tournament }) {
  const [fetched, setFetched] = useState([]);
  const { ref, shown, animate, at } = useReveal({ threshold: 0 });

  useEffect(() => {
    if (regProp || !shown) return;
    let alive = true;
    const load = () =>
      fetch(api('/registration/individuals'))
        .then((r) => r.json())
        .then((d) => alive && setFetched(Array.isArray(d) ? d : []))
        .catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [regProp, shown]);

  // Solo registrations carry no tournament yet, so a pool that belongs to one
  // shows only entries naming it — none for now. An empty pool is honest; the
  // same players under both tournaments would not be.
  const all = regProp ?? (tournament ? fetched.filter((r) => r.tournament === tournament.id) : fetched);

  const byLane = LANES.map((lane) => ({
    lane,
    meta: LANE_META[lane],
    players: all.filter((r) => r.role === lane),
  }));
  const covered = byLane.filter((l) => l.players.length > 0).length;

  return (
    <div ref={ref} className="w-full">
      <div className="overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)]">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)] px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="font-slogan text-[10px] font-bold uppercase tracking-[3px] text-[#DC143C]">
              {tournament ? tournament.label : 'Solo'} · Players Pool
            </p>
            <p className="mt-1 font-slogan text-[13px] text-neutral-400">
              {all.length === 0
                ? 'No solo players yet'
                : `${all.length} ${all.length === 1 ? 'player' : 'players'} looking for a team`}
            </p>
          </div>

          {/* Lanes covered, as five segments — the shape of the gap at a glance */}
          <div className="flex items-center gap-2">
            <span className="font-heading text-[22px] leading-none text-white">
              {covered}
              <span className="text-neutral-600">/5</span>
            </span>
            <span className="flex gap-1">
              {byLane.map((l) => (
                <span
                  key={l.lane}
                  title={`${l.meta.label}: ${l.players.length || 'nobody'}`}
                  className={`h-5 w-1.5 rounded-full transition-colors duration-500 ${
                    l.players.length
                      ? 'bg-[#DC143C] shadow-[0_0_8px_rgba(220,20,60,0.6)]'
                      : 'bg-[rgba(102,0,0,0.45)]'
                  }`}
                />
              ))}
            </span>
          </div>
        </div>

        {/* One row per lane */}
        <div className="flex flex-col">
          {byLane.map(({ lane, meta, players }, i) => (
            <div
              key={lane}
              style={at(0.05 + i * 0.06)}
              /* The animation is added when the section is reached, never
                 subtracted: fade() rests at opacity-0, so an observer that
                 doesn't fire would leave the pool as a header and a footer with
                 nothing between them. These rows are the content. */
              className={`flex items-start gap-3 border-b border-[rgba(102,0,0,0.15)] px-5 py-3.5 transition-colors last:border-b-0 hover:bg-[rgba(139,0,0,0.08)] ${
                shown && animate ? 'animate-reveal-up' : ''
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-black/40 ${
                  players.length ? 'border-[rgba(220,20,60,0.45)]' : 'border-[rgba(102,0,0,0.25)]'
                }`}
              >
                <img
                  src={meta.img}
                  alt=""
                  className={`h-5 w-5 object-contain transition-[filter] duration-500 ${
                    players.length ? '' : 'grayscale opacity-50'
                  }`}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-slogan text-[10px] font-bold uppercase tracking-[2px] text-neutral-500">
                  {meta.label}
                </span>

                {players.length ? (
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    {players.map((p) => (
                      <span
                        key={p.id || p.username}
                        title={p.division || undefined}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[rgba(220,20,60,0.35)] bg-[rgba(220,20,60,0.08)] px-2.5 py-1 font-slogan text-[12px] font-semibold text-white transition-colors hover:border-[#DC143C]"
                      >
                        <span className="truncate">{p.username}</span>
                        {p.paid && (
                          <span className="shrink-0 text-[#4ade80]" title="Entry fee paid" aria-label="Entry fee paid">
                            ✓
                          </span>
                        )}
                      </span>
                    ))}
                  </span>
                ) : (
                  /* A dashed gap rather than blank space: an empty lane is the
                     interesting part of this table, not missing content. */
                  <span className="mt-1.5 block rounded-lg border border-dashed border-[rgba(102,0,0,0.4)] px-3 py-1.5 font-slogan text-[11px] uppercase tracking-wider text-neutral-600">
                    Open — nobody yet
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Footer nudge, only while it's empty */}
        {all.length === 0 && (
          <div className="border-t border-[rgba(102,0,0,0.3)] bg-black/30 px-5 py-3.5 text-center">
            <p className="font-body text-[13px] text-neutral-500">
              Register as a solo player and you&apos;ll be the first in this pool.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
