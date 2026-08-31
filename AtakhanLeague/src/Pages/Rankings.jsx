import { useState, useMemo, useEffect } from 'react';
import SEO from '../Components/SEO';
import { api } from '../api';
import { emblemUrl, onEmblemError, tierColor, rankLabel } from '../utils/ranks';

// Top 3 medal colors
const positionStyles = {
  1: 'bg-[linear-gradient(135deg,#d4af37,#a07e1f)] text-black shadow-[0_0_16px_rgba(212,175,55,0.5)]',
  2: 'bg-[linear-gradient(135deg,#c0c0c0,#8a8a8a)] text-black shadow-[0_0_12px_rgba(192,192,192,0.4)]',
  3: 'bg-[linear-gradient(135deg,#cd7f32,#8b5a1f)] text-white shadow-[0_0_12px_rgba(205,127,50,0.4)]',
};

export default function Rankings() {
  const [search, setSearch] = useState('');
  const [entries, setEntries] = useState([]);

  // Leaderboard is maintained by the organizer from the admin panel
  useEffect(() => {
    fetch(api('/rankings'))
      .then((r) => r.json())
      .then((d) => setEntries(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Sort by points desc, then filter
  const players = useMemo(() => {
    const sorted = [...entries].sort((a, b) => b.points - a.points);
    if (!search.trim()) return sorted;
    const q = search.trim().toLowerCase();
    return sorted.filter((p) => p.username.toLowerCase().includes(q));
  }, [search, entries]);

  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-16">
      <SEO
        title="Summoner Rankings"
        path="/rankings"
        description="Top Atakhan League summoners ranked by performance points. See who tops the leaderboard across the Rift."
      />
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
                  <th className="text-left font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C] px-6 py-4">
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
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-12 h-12 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                        </svg>
                        <p className="font-heading text-white text-[22px] tracking-wide">
                          No rankings yet
                        </p>
                        <p className="font-body text-sm text-neutral-500 max-w-xs">
                          The leaderboard will fill up once tournament matches begin.
                          Be the first to make your mark on the Rift.
                        </p>
                      </div>
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
                      {/* Rank shows on every width now that the team column is
                          gone — there's room for it on a phone. */}
                      <td className="px-6 py-4">
                        {p.tier ? (
                          <span className="flex items-center gap-2">
                            <img
                              src={emblemUrl(p.tier)}
                              alt={p.tier}
                              onError={(e) => onEmblemError(e, p.tier)}
                              className="w-8 h-8 object-contain shrink-0"
                            />
                            <span className={`font-slogan text-[13px] font-bold uppercase tracking-wider ${tierColor(p.tier)}`}>
                              {rankLabel(p.tier, p.division)}
                            </span>
                          </span>
                        ) : (
                          <span className="font-slogan text-[13px] text-neutral-600">Unranked</span>
                        )}
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
