import { useEffect, useState } from 'react';
import MatchCard, { RoundColumn } from './MatchCard';
import { FORMAT_DATA, demoRosters, formatsFor, swissFor } from '../utils/showcase';

/*
 * Every format the platform can run, drawn rather than described.
 *
 * A visitor deciding whether this thing could run their tournament wants to see
 * the bracket, not read that brackets are supported — so each format renders
 * with a full set of results that agree across rounds.
 *
 * Which formats are offered comes from the game: a double-elimination bracket
 * is meaningless for a game played eight players to a lobby, and a lobby points
 * table is meaningless for one played five against five.
 */

function Champion({ name }) {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.1)] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#d4af37]" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4M6 4h12v5a6 6 0 0 1-12 0V4Zm12 1h2.5a2.5 2.5 0 0 1 0 5H18M6 5H3.5a2.5 2.5 0 0 0 0 5H6" />
        </svg>
      </span>
      <div className="text-center">
        <span className="block font-slogan text-[10px] font-bold uppercase tracking-[4px] text-[#d4af37]">
          Champion
        </span>
        <span className="mt-1 block font-heading text-[26px] leading-none tracking-wide text-white [text-shadow:0_0_20px_rgba(212,175,55,0.45)]">
          {name}
        </span>
      </div>
    </div>
  );
}

/* The frame every format sits in, so switching between them doesn't jump. */
function Board({ children }) {
  return (
    <div className="rounded-2xl border border-[rgba(102,0,0,0.2)] bg-[rgba(10,10,10,0.4)] p-5 backdrop-blur-sm sm:p-6 lg:p-8">
      {children}
    </div>
  );
}

function Columns({ columns, rosters }) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
      {columns.map((col) => (
        <RoundColumn key={col.label} label={col.label}>
          {col.matches.map((match) => (
            <MatchCard key={match.id} match={match} rosters={rosters} />
          ))}
          {col.extra && (
            <div>
              <p className="mb-2 text-center font-slogan text-[10px] font-bold uppercase tracking-[2px] text-neutral-500">
                {col.extra.label}
              </p>
              <MatchCard match={col.extra.match} rosters={rosters} />
            </div>
          )}
        </RoundColumn>
      ))}
    </div>
  );
}

/* ---------- group tables ---------- */

const GROUP_COLS = [
  { key: 'played', label: 'P', title: 'Played' },
  { key: 'wins', label: 'W', title: 'Wins' },
  { key: 'losses', label: 'L', title: 'Losses' },
  { key: 'killsFor', label: 'K+', title: 'Kills scored' },
  { key: 'killsAgainst', label: 'K−', title: 'Kills conceded' },
  { key: 'killDiff', label: '+/−', title: 'Kill difference — the tiebreaker' },
];

function GroupTable({ group, advance }) {
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
              {GROUP_COLS.map((c) => (
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
            {group.rows.map((row, i) => {
              const through = i < advance;
              return (
                <tr
                  key={row.name}
                  className={`border-b border-[rgba(102,0,0,0.15)] last:border-b-0 ${
                    through ? 'bg-[rgba(220,20,60,0.08)]' : ''
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <span
                      className={`font-heading text-[15px] leading-none ${
                        through ? 'text-[#DC143C]' : 'text-neutral-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`font-slogan text-[12px] font-bold tracking-wider ${
                        through ? 'text-white' : 'text-neutral-400'
                      }`}
                    >
                      {row.name}
                    </span>
                  </td>
                  {GROUP_COLS.map((c) => (
                    <td
                      key={c.key}
                      className={`px-1 py-2.5 text-center font-slogan text-[12px] tabular-nums ${
                        c.key !== 'killDiff'
                          ? 'text-neutral-400'
                          : row.killDiff > 0
                            ? 'font-bold text-[#4ade80]'
                            : row.killDiff < 0
                              ? 'font-bold text-[#f87171]'
                              : /* level — neither, and red read as a loss */
                                'font-bold text-neutral-400'
                      }`}
                    >
                      {c.key === 'killDiff' && row.killDiff > 0 ? `+${row.killDiff}` : row[c.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- the five formats ---------- */

function SingleElim({ data, rosters }) {
  return (
    <Board>
      <Columns columns={data.columns} rosters={rosters} />
      <Champion name={data.champion} />
    </Board>
  );
}

function DoubleElim({ data, rosters }) {
  return (
    <Board>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C]">
          Upper Bracket
        </span>
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(220,20,60,0.5),transparent)]" />
      </div>
      <Columns columns={data.upper} rosters={rosters} />

      <div className="mb-3 mt-10 flex items-center gap-3">
        <span className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-neutral-500">
          Lower Bracket
        </span>
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(102,0,0,0.6),transparent)]" />
        <span className="font-slogan text-[10px] uppercase tracking-[1px] text-neutral-600">
          A loss here ends it
        </span>
      </div>
      <Columns columns={data.lower} rosters={rosters} />

      <div className="mt-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
            Grand Final
          </span>
          <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(212,175,55,0.5),transparent)]" />
        </div>
        <div className="mx-auto max-w-sm">
          <MatchCard match={data.grandFinal} rosters={rosters} />
        </div>
      </div>

      <Champion name={data.champion} />
    </Board>
  );
}

function Groups({ data, rosters }) {
  return (
    <Board>
      <div className="grid gap-5 md:grid-cols-2">
        {data.groups.map((g) => (
          <GroupTable key={g.name} group={g} advance={data.advance} />
        ))}
      </div>

      <div className="mb-3 mt-10 flex items-center gap-3">
        <span className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C]">
          Knockout
        </span>
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(220,20,60,0.5),transparent)]" />
      </div>
      <Columns columns={data.knockout} rosters={rosters} />

      <Champion name={data.champion} />
    </Board>
  );
}

function Swiss({ data, game }) {
  const who = game.teamSize > 1 ? 'Team' : 'Player';
  return (
    <Board>
      <div className="overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
                <th className="w-14 px-4 py-3 text-left font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  #
                </th>
                <th className="px-4 py-3 text-left font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  {who}
                </th>
                <th className="w-24 px-4 py-3 text-center font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  Record
                </th>
                <th className="px-4 py-3 text-left font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  Played
                </th>
                <th className="w-28 px-4 py-3 text-right font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => {
                const through = row.wins >= data.qualifyAt;
                return (
                  <tr
                    key={row.name}
                    className={`border-b border-[rgba(102,0,0,0.15)] last:border-b-0 ${
                      through ? 'bg-[rgba(220,20,60,0.08)]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-heading text-[16px] leading-none text-neutral-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-slogan text-[13px] font-bold tracking-wider text-white">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-center font-heading text-[18px] leading-none tabular-nums text-white">
                      {row.wins}–{row.losses}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-slogan text-[11px] tracking-wide text-neutral-500">
                        {row.opponents.join(' · ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`rounded-full border px-2.5 py-1 font-slogan text-[9px] font-bold uppercase tracking-[1.5px] ${
                          through
                            ? 'border-[rgba(220,20,60,0.5)] bg-[rgba(220,20,60,0.12)] text-[#DC143C]'
                            : 'border-white/10 bg-white/[0.04] text-neutral-500'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-center font-body text-[13px] text-neutral-500">
        {data.rounds} rounds · {data.qualifyAt} wins qualifies · {data.qualifyAt} losses is out ·
        pairings are between equal records, never redrawn at random
      </p>
    </Board>
  );
}

function Lobbies({ data }) {
  return (
    <Board>
      <div className="overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
                <th className="w-14 px-4 py-3 text-left font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  #
                </th>
                <th className="px-4 py-3 text-left font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  Player
                </th>
                {Array.from({ length: data.lobbies }, (_, i) => (
                  <th
                    key={i}
                    className="w-16 px-2 py-3 text-center font-slogan text-[10px] font-bold uppercase tracking-[1px] text-neutral-500"
                  >
                    Lobby {i + 1}
                  </th>
                ))}
                <th className="w-20 px-4 py-3 text-right font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => {
                const through = i < data.advance;
                return (
                  <tr
                    key={row.name}
                    className={`border-b border-[rgba(102,0,0,0.15)] last:border-b-0 ${
                      through ? 'bg-[rgba(220,20,60,0.08)]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-heading text-[16px] leading-none text-neutral-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-slogan text-[13px] font-bold tracking-wider text-white">
                      {row.name}
                    </td>
                    {row.placings.map((p, k) => (
                      <td key={k} className="px-2 py-3 text-center">
                        {/* A first place is the thing worth spotting across a
                            row of numbers, so only that one is picked out. */}
                        <span
                          className={`inline-grid h-7 w-7 place-items-center rounded-md font-heading text-[14px] leading-none tabular-nums ${
                            p === 1
                              ? 'bg-[rgba(212,175,55,0.18)] text-[#d4af37]'
                              : 'text-neutral-400'
                          }`}
                        >
                          {p}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-heading text-[20px] leading-none text-white">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-center font-body text-[13px] text-neutral-500">
        {data.lobbies} lobbies · placement scores {data.scoring.join(' / ')} · top {data.advance} to
        the final lobby
      </p>
    </Board>
  );
}

const RENDERERS = {
  single: SingleElim,
  double: DoubleElim,
  groups: Groups,
  swiss: Swiss,
  lobbies: Lobbies,
};

export default function BracketShowcase({ game }) {
  const available = formatsFor(game);
  const [formatId, setFormatId] = useState(available[0].id);

  // Switching game can leave a format selected that the new game cannot run —
  // Valorant has no lobby table, TFT has no double-elimination bracket.
  useEffect(() => {
    if (!game.formats.includes(formatId)) setFormatId(game.formats[0]);
  }, [game, formatId]);

  const active = available.find((f) => f.id === formatId) ?? available[0];
  const Renderer = RENDERERS[active.id];
  const rosters = demoRosters(game);
  // Swiss is the one table whose contestants depend on the game.
  const data = active.id === 'swiss' ? swissFor(game) : FORMAT_DATA[active.id];

  return (
    <div>
      {/* Which format */}
      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {available.map((f) => {
          const on = f.id === active.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFormatId(f.id)}
              aria-pressed={on}
              className={`rounded-full border px-4 py-2 font-slogan text-[11px] font-bold uppercase tracking-[2px] transition-all duration-300 ${
                on
                  ? 'border-[#DC143C] bg-[rgba(220,20,60,0.16)] text-white shadow-[0_0_20px_rgba(220,20,60,0.3)]'
                  : 'border-[rgba(102,0,0,0.4)] bg-black/40 text-neutral-400 hover:border-[rgba(220,20,60,0.6)] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="mx-auto mb-7 max-w-2xl text-center font-body text-[15px] leading-relaxed text-neutral-400">
        {active.blurb}
      </p>

      {/* Keyed so a format change replays the entrance instead of swapping the
          contents of a board that never moved. */}
      <div key={`${game.id}-${active.id}`} className="animate-form-fade-in">
        <Renderer data={data} rosters={rosters} game={game} />
      </div>
    </div>
  );
}
