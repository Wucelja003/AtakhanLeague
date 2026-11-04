import { useState } from 'react';
import { LANE_META } from '../utils/pool';

/*
 * One match in a bracket: two names, two scores, and — where we know who plays
 * for a team — its roster folded away underneath.
 *
 * Lifted out of the Tournaments page so the live bracket and every showcase
 * format draw the same card. They were the same card by copy before, which
 * meant a change to one quietly left the others behind.
 */

// One side of a match.
function TeamRow({ name, score, won, roster, open, onToggle, last }) {
  const border = last ? '' : 'border-b border-[rgba(102,0,0,0.25)]';
  const head = (
    <>
      <span
        className={`flex items-center gap-1.5 font-slogan text-[13px] font-bold tracking-wider truncate ${
          won ? 'text-white' : 'text-neutral-300'
        }`}
      >
        <span className="truncate">{name}</span>
        {roster && (
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`w-3 h-3 shrink-0 text-[#DC143C] transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        )}
      </span>
      <span className={`font-heading text-[18px] leading-none ${won ? 'text-[#DC143C]' : 'text-neutral-500'}`}>
        {score ?? '–'}
      </span>
    </>
  );

  return (
    <div className={won ? 'bg-[rgba(220,20,60,0.12)]' : ''}>
      {roster ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors hover:bg-[rgba(139,0,0,0.18)] ${border}`}
        >
          {head}
        </button>
      ) : (
        <div className={`flex items-center justify-between gap-2 px-4 py-2.5 ${border}`}>{head}</div>
      )}

      {roster && open && (
        <ul className="px-4 py-2 bg-black/40 border-b border-[rgba(102,0,0,0.25)]">
          {roster.map((p) => (
            <li key={p.username} className="flex items-center gap-2 py-1">
              {LANE_META[p.role] ? (
                <img
                  src={LANE_META[p.role].img}
                  alt={LANE_META[p.role].label}
                  className="w-4 h-4 object-contain shrink-0"
                />
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <span className="font-slogan text-[12px] tracking-wider text-neutral-300 truncate">
                {p.username}
              </span>
              {p.captain && (
                <span className="ml-auto shrink-0 font-slogan text-[9px] font-bold uppercase tracking-[1px] text-[#d4af37]">
                  Captain
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MatchCard({ match, rosters = {} }) {
  const aWon = match.scoreA != null && match.scoreB != null && match.scoreA > match.scoreB;
  const bWon = match.scoreA != null && match.scoreB != null && match.scoreB > match.scoreA;
  // Which side is expanded, if any — one at a time keeps the column compact.
  const [open, setOpen] = useState(null);
  const toggle = (side) => setOpen((cur) => (cur === side ? null : side));

  return (
    <div className="w-full rounded-xl bg-[rgba(10,10,10,0.7)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_24px_rgba(102,0,0,0.18)] overflow-hidden transition-all duration-300 hover:border-[#DC143C] hover:shadow-[0_0_32px_rgba(220,20,60,0.35)]">
      {/* The strip above the names: a kick-off time where there is one, and
          otherwise what the match is — a bracket with no dates still has to
          say which round you are looking at on a phone. */}
      <div className="flex items-center justify-between gap-2 px-4 py-1 bg-[rgba(102,0,0,0.12)] border-b border-[rgba(102,0,0,0.25)]">
        <span className="font-slogan text-[10px] font-bold uppercase tracking-wider text-neutral-500 truncate">
          {match.round}
        </span>
        {match.time && (
          <span className="shrink-0 font-slogan text-[10px] font-bold tracking-wider text-[#DC143C]">
            {match.time} CET
          </span>
        )}
      </div>
      <TeamRow
        name={match.teamA}
        score={match.scoreA}
        won={aWon}
        roster={rosters[match.teamA]}
        open={open === 'A'}
        onToggle={() => toggle('A')}
      />
      <TeamRow
        name={match.teamB}
        score={match.scoreB}
        won={bWon}
        roster={rosters[match.teamB]}
        open={open === 'B'}
        onToggle={() => toggle('B')}
        last
      />
    </div>
  );
}

export function RoundColumn({ label, children }) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <h3 className="text-center font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-6 [text-shadow:0_0_10px_rgba(220,20,60,0.4)]">
        {label}
      </h3>
      <div className="flex-1 flex flex-col justify-around gap-4">{children}</div>
    </div>
  );
}
