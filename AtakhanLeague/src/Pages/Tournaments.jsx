import SEO from '../Components/SEO';

// Mock bracket — replace with DB data later.
// Quarterfinal seedings: 1v8, 4v5, 3v6, 2v7. Winners advance up the bracket.
const bracket = {
  quarterfinals: [
    { id: 'QF1', round: 'Quarterfinal 1', teamA: 'Team Alpha', teamB: 'Team Theta', scoreA: null, scoreB: null, time: '14:00' },
    { id: 'QF2', round: 'Quarterfinal 2', teamA: 'Team Beta', teamB: 'Team Eta', scoreA: null, scoreB: null, time: '15:30' },
    { id: 'QF3', round: 'Quarterfinal 3', teamA: 'Team Gamma', teamB: 'Team Zeta', scoreA: null, scoreB: null, time: '17:00' },
    { id: 'QF4', round: 'Quarterfinal 4', teamA: 'Team Delta', teamB: 'Team Epsilon', scoreA: null, scoreB: null, time: '18:30' },
  ],
  semifinals: [
    { id: 'SF1', round: 'Semifinal 1', teamA: 'Winner QF1', teamB: 'Winner QF2', scoreA: null, scoreB: null, time: '20:00' },
    { id: 'SF2', round: 'Semifinal 2', teamA: 'Winner QF3', teamB: 'Winner QF4', scoreA: null, scoreB: null, time: '21:30' },
  ],
  final: {
    id: 'F', round: 'Grand Final', teamA: 'Winner SF1', teamB: 'Winner SF2', scoreA: null, scoreB: null, time: '23:00',
  },
};

// Flat schedule list (chronological by time)
const schedule = [
  ...bracket.quarterfinals,
  ...bracket.semifinals,
  bracket.final,
];

function MatchCard({ match }) {
  const aWon = match.scoreA != null && match.scoreB != null && match.scoreA > match.scoreB;
  const bWon = match.scoreA != null && match.scoreB != null && match.scoreB > match.scoreA;

  return (
    <div className="w-full rounded-xl bg-[rgba(10,10,10,0.7)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_24px_rgba(102,0,0,0.18)] overflow-hidden transition-all duration-300 hover:border-[#DC143C] hover:shadow-[0_0_32px_rgba(220,20,60,0.35)]">
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
  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-16">
      <SEO
        title="Tournaments"
        path="/tournaments"
        description="View the upcoming Atakhan League tournament bracket — quarterfinals, semifinals, and the grand final. 8 teams battle for the Rift."
      />
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Tournament Date
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            28.06.2026.
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
                <svg className="w-14 h-14 text-[#d4af37] [filter:drop-shadow(0_0_20px_rgba(212,175,55,0.6))]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 4V2h14v2h3v3a4 4 0 01-4 4h-.46A6.99 6.99 0 0113 14.92V17h4v2h2v2H5v-2h2v-2h4v-2.08A6.99 6.99 0 016.46 11H6a4 4 0 01-4-4V4h3zm-1 3a2 2 0 002 2V6H4v1zm14 2a2 2 0 002-2V6h-2v3z" />
                </svg>
                <span className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#d4af37]">
                  Champion
                </span>
                <span className="font-heading text-[32px] leading-none tracking-wide text-[#d4af37] [text-shadow:0_0_18px_rgba(212,175,55,0.6)]">
                  {champion ?? 'TBD'}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Bracket */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.4)] border border-[rgba(102,0,0,0.2)] p-6 lg:p-10 backdrop-blur-sm animate-form-fade-in">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 min-h-[600px]">
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
