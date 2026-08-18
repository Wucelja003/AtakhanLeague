import { useEffect, useState } from 'react';
import { api } from '../api';
import { TOURNAMENTS } from '../utils/tournaments';

// The group stage, one table per group.
//
// Shown at its full shape before anything is drawn — four rows per group, marked
// as waiting — for the same reason the board shows its empty slots: a page that
// renders nothing until the draw looks broken rather than pending.
//
// The columns are the tiebreakers, in the order they apply: wins, then kills for
// and against, then the difference between them. Anyone level on wins can see
// exactly what is separating them.

const COLS = [
  { key: 'played', label: 'P', title: 'Played' },
  { key: 'wins', label: 'W', title: 'Wins' },
  { key: 'losses', label: 'L', title: 'Losses' },
  { key: 'killsFor', label: 'K+', title: 'Kills scored' },
  { key: 'killsAgainst', label: 'K−', title: 'Kills conceded' },
  { key: 'killDiff', label: '+/−', title: 'Kill difference — the tiebreaker' },
];

function Group({ group, advance, bestThirds }) {
  // Rows the format hasn't filled yet, so the table keeps its shape.
  const blanks = Math.max(0, group.size - group.rows.length);

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)] backdrop-blur-md shadow-[0_0_36px_rgba(102,0,0,0.2)]">
      <div className="flex items-center justify-between gap-3 border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)] px-4 py-3">
        <span className="font-heading text-[20px] leading-none tracking-wide text-white">
          Group {group.name}
        </span>
        <span className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
          Top {advance} advance
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[340px]">
          <thead>
            <tr className="border-b border-[rgba(102,0,0,0.3)]">
              <th className="w-8 px-3 py-2 text-left font-slogan text-[10px] font-bold uppercase tracking-[1px] text-neutral-600">
                #
              </th>
              <th className="px-2 py-2 text-left font-slogan text-[10px] font-bold uppercase tracking-[1px] text-neutral-600">
                Team
              </th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  title={c.title}
                  className="w-9 px-1 py-2 text-center font-slogan text-[10px] font-bold uppercase tracking-[1px] text-neutral-600"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {group.rows.map((r) => {
              const through = r.position <= advance;
              const asThird = bestThirds.includes(r.team);
              return (
                <tr
                  key={r.team}
                  className={`border-b border-[rgba(102,0,0,0.15)] last:border-b-0 transition-colors hover:bg-[rgba(139,0,0,0.08)] ${
                    through ? 'bg-[rgba(220,20,60,0.07)]' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <span
                      className={`font-heading text-[15px] leading-none ${
                        through ? 'text-[#DC143C]' : asThird ? 'text-[#f59e0b]' : 'text-neutral-600'
                      }`}
                    >
                      {r.position}
                    </span>
                  </td>
                  <td className="max-w-0 px-2 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-slogan text-[13px] font-bold tracking-wide text-white">
                        {r.team}
                      </span>
                      {asThird && (
                        <span
                          title="Best third place — through to the quarterfinals"
                          className="shrink-0 rounded border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)] px-1.5 py-0.5 font-slogan text-[8px] font-bold uppercase tracking-[1px] text-[#f59e0b]"
                        >
                          3rd
                        </span>
                      )}
                    </span>
                  </td>
                  {COLS.map((c) => (
                    <td
                      key={c.key}
                      className={`px-1 py-2.5 text-center font-slogan text-[12px] tabular-nums ${
                        c.key === 'killDiff'
                          ? r.killDiff > 0
                            ? 'font-bold text-[#4ade80]'
                            : r.killDiff < 0
                              ? 'font-bold text-[#ef4444]'
                              : 'text-neutral-400'
                          : 'text-neutral-300'
                      }`}
                    >
                      {c.key === 'killDiff' && r.killDiff > 0 ? `+${r.killDiff}` : r[c.key]}
                    </td>
                  ))}
                </tr>
              );
            })}

            {Array.from({ length: blanks }, (_, i) => (
              <tr key={`blank-${i}`} className="border-b border-[rgba(102,0,0,0.15)] bg-black/20 last:border-b-0">
                <td className="px-3 py-2.5">
                  <span className="font-heading text-[15px] leading-none text-neutral-700">
                    {group.rows.length + i + 1}
                  </span>
                </td>
                <td className="px-2 py-2.5" colSpan={COLS.length + 1}>
                  <span className="font-slogan text-[11px] uppercase tracking-wider text-neutral-600 italic">
                    Awaiting draw
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GroupTables() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(api('/tournament/groups'))
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => alive && Array.isArray(d) && setData(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 20000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Until the request lands, the shape is known from the format itself, so the
  // tables are drawn from that rather than left blank.
  const shown =
    data ??
    TOURNAMENTS.map((t) => ({
      tournament: t.id,
      label: t.label,
      advance: t.groups.advance,
      extraThirds: t.groups.extraThirds,
      bestThirds: [],
      groups: Array.from({ length: t.groups.count }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        size: t.groups.size,
        rows: [],
        matches: [],
      })),
    }));

  return (
    <div className="mt-16">
      <div className="mb-8 text-center">
        <p className="mb-2 font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C]">
          Group Stage
        </p>
        <h2 className="font-heading text-[clamp(2rem,4vw,3rem)] leading-none tracking-wide text-white [text-shadow:0_0_14px_rgba(139,0,0,0.6)]">
          Round Robin
        </h2>
        <p className="mt-3 font-body text-sm text-neutral-400">
          Everyone plays everyone in their group. Level on wins is settled by kill difference.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {shown.map((t) => (
          <div key={t.tournament}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="font-heading text-[26px] leading-none tracking-wide text-white">
                {t.label}
              </span>
              <span className="font-slogan text-[11px] uppercase tracking-[2px] text-neutral-500">
                {t.groups.length} groups of {t.groups[0]?.size} · top {t.advance} through
                {t.extraThirds ? ` · plus the best ${t.extraThirds} third places` : ''}
              </span>
            </div>

            <div
              className={`grid gap-5 ${
                t.groups.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
              }`}
            >
              {t.groups.map((g) => (
                <Group key={g.name} group={g} advance={t.advance} bestThirds={t.bestThirds} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
