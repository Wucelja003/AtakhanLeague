import { useState, useMemo } from 'react';

// Mock data — replace with DB fetch later
const mockPlayers = [
  { username: 'Faker', rank: 'Challenger', points: 2148 },
  { username: 'Caps', rank: 'Challenger', points: 2095 },
  { username: 'Canyon', rank: 'Challenger', points: 2032 },
  { username: 'Keria', rank: 'Grandmaster', points: 1987 },
  { username: 'Chovy', rank: 'Grandmaster', points: 1944 },
  { username: 'Gumayusi', rank: 'Grandmaster', points: 1902 },
  { username: 'Ruler', rank: 'Master', points: 1865 },
  { username: 'Knight', rank: 'Master', points: 1820 },
  { username: 'Doinb', rank: 'Master', points: 1788 },
  { username: 'Showmaker', rank: 'Diamond I', points: 1742 },
  { username: 'Rookie', rank: 'Diamond I', points: 1701 },
  { username: 'JackeyLove', rank: 'Diamond II', points: 1654 },
  { username: 'TheShy', rank: 'Diamond II', points: 1622 },
  { username: 'Bjergsen', rank: 'Diamond III', points: 1588 },
  { username: 'Doublelift', rank: 'Diamond IV', points: 1543 },
];

// Map rank to a color
const rankColor = (rank) => {
  if (rank.startsWith('Challenger')) return 'text-[#DC143C]';
  if (rank.startsWith('Grandmaster')) return 'text-[#ff6b6b]';
  if (rank.startsWith('Master')) return 'text-[#c084fc]';
  if (rank.startsWith('Diamond')) return 'text-[#60a5fa]';
  if (rank.startsWith('Emerald')) return 'text-[#4ade80]';
  if (rank.startsWith('Platinum')) return 'text-[#22d3ee]';
  return 'text-neutral-300';
};

// Top 3 medal colors
const positionStyles = {
  1: 'bg-[linear-gradient(135deg,#d4af37,#a07e1f)] text-black shadow-[0_0_16px_rgba(212,175,55,0.5)]',
  2: 'bg-[linear-gradient(135deg,#c0c0c0,#8a8a8a)] text-black shadow-[0_0_12px_rgba(192,192,192,0.4)]',
  3: 'bg-[linear-gradient(135deg,#cd7f32,#8b5a1f)] text-white shadow-[0_0_12px_rgba(205,127,50,0.4)]',
};

export default function Rankings() {
  const [search, setSearch] = useState('');

  // Sort by points desc, then filter
  const players = useMemo(() => {
    const sorted = [...mockPlayers].sort((a, b) => b.points - a.points);
    if (!search.trim()) return sorted;
    return sorted.filter((p) =>
      p.username.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search]);

  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Summoner Rankings
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            Leaderboard
          </h1>
          <p className="font-body text-base text-neutral-400 mt-4 max-w-md mx-auto">
            Top summoners ranked by performance points across the Rift.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-sm mx-auto animate-fade-in-up">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search summoner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
            />
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] overflow-hidden animate-form-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
                  <th className="text-left font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4 w-20">
                    #
                  </th>
                  <th className="text-left font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4">
                    Summoner Name
                  </th>
                  <th className="text-left font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4 hidden sm:table-cell">
                    Rank
                  </th>
                  <th className="text-right font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center font-body text-neutral-500">
                      No summoner found.
                    </td>
                  </tr>
                )}
                {players.map((p, i) => {
                  const position = i + 1;
                  const medal = positionStyles[position];
                  return (
                    <tr
                      key={p.username}
                      className="border-b border-[rgba(102,0,0,0.15)] last:border-b-0 transition-colors hover:bg-[rgba(139,0,0,0.08)]"
                    >
                      <td className="px-6 py-4">
                        {medal ? (
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-heading text-[18px] leading-none ${medal}`}
                          >
                            {position}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-9 h-9 font-heading text-[18px] text-neutral-400">
                            {position}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-slogan text-[15px] font-bold text-white tracking-wide">
                        {p.username}
                      </td>
                      <td className={`px-6 py-4 font-slogan text-[13px] font-bold uppercase tracking-wider hidden sm:table-cell ${rankColor(p.rank)}`}>
                        {p.rank}
                      </td>
                      <td className="px-6 py-4 text-right font-heading text-[22px] leading-none text-white">
                        {p.points.toLocaleString('en-US')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center font-slogan text-[10px] tracking-[2px] uppercase text-neutral-500 mt-6">
          Showing {players.length} {players.length === 1 ? 'summoner' : 'summoners'}
        </p>
      </div>
    </section>
  );
}
