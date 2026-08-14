import { useEffect, useState } from 'react';
import { api } from '../api';
import SEO from '../Components/SEO';

// Shown until the live bracket loads (and if the API is unavailable).
const FALLBACK_BRACKET = {
  quarterfinals: [
    { id: 'QF1', round: 'Quarterfinal 1', teamA: 'TBD', teamB: 'TBD', scoreA: null, scoreB: null, time: '18:00' },
    { id: 'QF2', round: 'Quarterfinal 2', teamA: 'TBD', teamB: 'TBD', scoreA: null, scoreB: null, time: '18:00' },
    { id: 'QF3', round: 'Quarterfinal 3', teamA: 'TBD', teamB: 'TBD', scoreA: null, scoreB: null, time: '18:10' },
    { id: 'QF4', round: 'Quarterfinal 4', teamA: 'TBD', teamB: 'TBD', scoreA: null, scoreB: null, time: '18:20' },
  ],
  semifinals: [
    { id: 'SF1', round: 'Semifinal 1', teamA: 'Winner QF1', teamB: 'Winner QF2', scoreA: null, scoreB: null, time: '19:30' },
    { id: 'SF2', round: 'Semifinal 2', teamA: 'Winner QF3', teamB: 'Winner QF4', scoreA: null, scoreB: null, time: '19:30' },
  ],
  thirdPlace: {
    id: 'TP', round: 'Third Place', teamA: 'Loser SF1', teamB: 'Loser SF2', scoreA: null, scoreB: null, time: '21:00',
  },
  final: {
    id: 'F', round: 'Grand Final', teamA: 'Winner SF1', teamB: 'Winner SF2', scoreA: null, scoreB: null, time: '21:00',
  },
};

function MatchCard({ match }) {
  const aWon = match.scoreA != null && match.scoreB != null && match.scoreA > match.scoreB;
  const bWon = match.scoreA != null && match.scoreB != null && match.scoreB > match.scoreA;

  return (
    <div className="w-full rounded-xl bg-[rgba(10,10,10,0.7)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_24px_rgba(102,0,0,0.18)] overflow-hidden transition-all duration-300 hover:border-[#DC143C] hover:shadow-[0_0_32px_rgba(220,20,60,0.35)]">
      {/* Time */}
      <div className="flex items-center justify-end px-4 py-1 bg-[rgba(102,0,0,0.12)] border-b border-[rgba(102,0,0,0.25)]">
        <span className="font-slogan text-[10px] font-bold tracking-wider text-[#DC143C]">{match.time} CET</span>
      </div>
      {/* Team A */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b border-[rgba(102,0,0,0.25)] ${aWon ? 'bg-[rgba(220,20,60,0.12)]' : ''}`}>
        <span className={`font-slogan text-[13px] font-bold tracking-wider truncate ${aWon ? 'text-white' : 'text-neutral-300'}`}>
          {match.teamA}
        </span>
        <span className={`font-heading text-[18px] leading-none ${aWon ? 'text-[#DC143C]' : 'text-neutral-500'}`}>
          {match.scoreA ?? '–'}
        </span>
      </div>
      {/* Team B */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${bWon ? 'bg-[rgba(220,20,60,0.12)]' : ''}`}>
        <span className={`font-slogan text-[13px] font-bold tracking-wider truncate ${bWon ? 'text-white' : 'text-neutral-300'}`}>
          {match.teamB}
        </span>
        <span className={`font-heading text-[18px] leading-none ${bWon ? 'text-[#DC143C]' : 'text-neutral-500'}`}>
          {match.scoreB ?? '–'}
        </span>
      </div>
    </div>
  );
}

function RoundColumn({ label, children }) {
  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-center font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-6 [text-shadow:0_0_10px_rgba(220,20,60,0.4)]">
        {label}
      </h3>
      <div className="flex-1 flex flex-col justify-around gap-4">
        {children}
      </div>
    </div>
  );
}

export default function Tournaments() {
  const [bracket, setBracket] = useState(FALLBACK_BRACKET);

  useEffect(() => {
    fetch(api('/tournament/bracket'))
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.quarterfinals && d.final) setBracket(d); })
      .catch(() => {});
  }, []);

  // Third place is optional: a database seeded before it existed returns null
  // until ensureBracket next runs, and the page must still render.
  const schedule = [
    ...bracket.quarterfinals,
    ...bracket.semifinals,
    ...(bracket.thirdPlace ? [bracket.thirdPlace] : []),
    bracket.final,
  ];

  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-16">
      <SEO
        title="Tournaments"
        path="/tournaments"
        description="View the upcoming Atakhan League tournament bracket — quarterfinals, semifinals and grand final. 8 teams battle for the Rift."
      />
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Tournament Date
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            August 15 
          </h1>
          <p className="font-body text-base text-neutral-400 mt-4 max-w-md mx-auto">
            Single-elimination bracket. 8 teams enter — only one will be crowned.
          </p>
        </div>

        {/* Trophy / Champion */}
        {(() => {
          const f = bracket.final;
          const hasScore = f.scoreA != null && f.scoreB != null;
          const champion = hasScore
            ? (f.scoreA > f.scoreB ? f.teamA : f.teamB)
            : null;

          return (
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex flex-col items-center gap-3">
              </div>
            </div>
          );
        })()}

        {/* Bracket */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.4)] border border-[rgba(102,0,0,0.2)] p-6 lg:p-10 backdrop-blur-sm animate-form-fade-in">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 min-h-[450px]">
            <RoundColumn label="Quarterfinals">
              {bracket.quarterfinals.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </RoundColumn>

            <RoundColumn label="Semifinals">
              {bracket.semifinals.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </RoundColumn>

            <RoundColumn label="Final">
              <MatchCard match={bracket.final} />
              {bracket.thirdPlace && (
                <div>
                  <p className="mb-2 text-center font-slogan text-[10px] font-bold uppercase tracking-[2px] text-neutral-500">
                    Third Place
                  </p>
                  <MatchCard match={bracket.thirdPlace} />
                </div>
              )}
            </RoundColumn>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 font-slogan text-[11px] tracking-wider text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[rgba(220,20,60,0.4)] border border-[#DC143C]" />
            Winner advances
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-black/40 border border-[rgba(102,0,0,0.35)]" />
            Pending match
          </div>
        </div>

        {/* Schedule table */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-2">
              Match Schedule
            </p>
            <h2 className="font-heading text-white text-[clamp(2rem,4vw,3rem)] leading-none tracking-wide [text-shadow:0_0_14px_rgba(139,0,0,0.6)]">
              Full Fixture List
            </h2>
            <p className="font-body text-sm text-neutral-400 mt-3">
              All times CET — be on Discord 30 minutes before your match.
            </p>
          </div>

          <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
                    <th className="text-left font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4 hidden sm:table-cell">
                      Round
                    </th>
                    <th className="text-center font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4">
                      Match
                    </th>
                    <th className="text-right font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4 w-32">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-[rgba(102,0,0,0.15)] last:border-b-0 transition-colors hover:bg-[rgba(139,0,0,0.08)]"
                    >
                      <td className="px-6 py-4 font-slogan text-[12px] font-bold uppercase tracking-wider text-neutral-400 hidden sm:table-cell">
                        {m.round}
                      </td>
                      <td className="px-6 py-4">
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 font-slogan text-[14px] font-bold tracking-wide text-white">
                          <span className="text-right truncate">{m.teamA}</span>
                          <span className="font-heading text-[#DC143C] text-[16px] leading-none">
                            VS
                          </span>
                          <span className="text-left truncate">{m.teamB}</span>
                        </div>
                        <div className="sm:hidden mt-1 text-center font-slogan text-[10px] uppercase tracking-wider text-neutral-500">
                          {m.round}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-heading text-[22px] leading-none text-white">
                          {m.time}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
