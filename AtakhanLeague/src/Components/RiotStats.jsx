import { useEffect, useState } from 'react';
import { api } from '../api';

// Rank tier colors
const tierColor = (tier) => {
  switch ((tier || '').toUpperCase()) {
    case 'IRON': return 'text-[#5e5b5a]';
    case 'BRONZE': return 'text-[#b08d57]';
    case 'SILVER': return 'text-[#c0c0c0]';
    case 'GOLD': return 'text-[#d4af37]';
    case 'PLATINUM': return 'text-[#22d3ee]';
    case 'EMERALD': return 'text-[#4ade80]';
    case 'DIAMOND': return 'text-[#60a5fa]';
    case 'MASTER': return 'text-[#c084fc]';
    case 'GRANDMASTER': return 'text-[#ff6b6b]';
    case 'CHALLENGER': return 'text-[#DC143C]';
    default: return 'text-neutral-400';
  }
};

const positionLabel = (p) => {
  if (!p) return '—';
  const map = { TOP: 'Top', JUNGLE: 'Jungle', MIDDLE: 'Mid', BOTTOM: 'ADC', UTILITY: 'Support' };
  return map[p] || p;
};

const formatDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatPoints = (n) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
};

const timeAgo = (ms) => {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};

function RankCard({ label, entry }) {
  if (!entry) {
    return (
      <div className="flex-1 min-w-[180px] rounded-xl bg-black/40 border border-dashed border-[rgba(102,0,0,0.35)] px-4 py-4 text-center">
        <p className="font-slogan text-[10px] uppercase tracking-[2px] text-neutral-500 mb-2">{label}</p>
        <p className="font-heading text-[18px] text-neutral-600">Unranked</p>
      </div>
    );
  }
  const winRate = entry.wins + entry.losses > 0
    ? Math.round((entry.wins / (entry.wins + entry.losses)) * 100)
    : 0;

  return (
    <div className="flex-1 min-w-[180px] rounded-xl bg-black/40 border border-[rgba(102,0,0,0.35)] px-4 py-4">
      <p className="font-slogan text-[10px] uppercase tracking-[2px] text-neutral-400 mb-2">{label}</p>
      <p className={`font-heading text-[22px] leading-none ${tierColor(entry.tier)}`}>
        {entry.tier} {entry.rank}
      </p>
      <p className="font-slogan text-[13px] text-white mt-1">{entry.leaguePoints} LP</p>
      <div className="flex items-baseline gap-2 mt-2 font-slogan text-[11px]">
        <span className="text-[#4ade80]">{entry.wins}W</span>
        <span className="text-[#ef4444]">{entry.losses}L</span>
        <span className="text-neutral-400">{winRate}% WR</span>
      </div>
      {entry.hotStreak && (
        <span className="inline-block mt-2 px-2 py-0.5 rounded font-slogan text-[9px] tracking-wider uppercase bg-[rgba(220,20,60,0.15)] border border-[rgba(220,20,60,0.4)] text-[#DC143C]">
          🔥 Hot Streak
        </span>
      )}
    </div>
  );
}

function MasteryCard({ m, ddVer }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-black/40 border border-[rgba(102,0,0,0.25)]">
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/champion/${m.championName}.png`}
        alt={m.championDisplayName}
        className="w-10 h-10 rounded-md object-cover"
        onError={(e) => { e.target.style.visibility = 'hidden'; }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-slogan text-[13px] font-bold text-white truncate">{m.championDisplayName}</p>
        <p className="font-slogan text-[10px] uppercase tracking-wider text-neutral-500">
          M{m.championLevel} · {formatPoints(m.championPoints)} pts
        </p>
      </div>
    </div>
  );
}

function MatchRow({ m, ddVer }) {
  const kda = m.deaths === 0
    ? `${(m.kills + m.assists).toFixed(1)}`
    : ((m.kills + m.assists) / m.deaths).toFixed(2);

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${m.win
      ? 'bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)]'
      : 'bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.2)]'}`}>
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/${ddVer}/img/champion/${m.championName}.png`}
        alt={m.championDisplayName}
        className="w-10 h-10 rounded-md object-cover shrink-0"
        onError={(e) => { e.target.style.visibility = 'hidden'; }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 font-slogan text-[13px] font-bold">
          <span className={m.win ? 'text-[#4ade80]' : 'text-[#ef4444]'}>{m.win ? 'WIN' : 'LOSS'}</span>
          <span className="text-white truncate">{m.championDisplayName}</span>
        </div>
        <div className="flex items-center gap-2 font-slogan text-[11px] text-neutral-400 mt-0.5">
          <span>{positionLabel(m.teamPosition)}</span>
          <span>·</span>
          <span>{formatDuration(m.gameDuration)}</span>
          <span>·</span>
          <span>{timeAgo(m.gameEndTimestamp)}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-slogan text-[13px] font-bold text-white">
          {m.kills}/{m.deaths}/{m.assists}
        </p>
        <p className="font-slogan text-[10px] uppercase tracking-wider text-neutral-500">
          {kda} KDA
        </p>
      </div>
    </div>
  );
}

export default function RiotStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(api('/riot/me'), { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-[rgba(102,0,0,0.3)]">
        <p className="font-slogan text-[11px] uppercase tracking-[3px] text-neutral-500 text-center py-6">
          Loading Riot stats...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mt-8 pt-8 border-t border-[rgba(102,0,0,0.3)]">
        <div className="rounded-xl bg-[rgba(220,20,60,0.06)] border border-[rgba(220,20,60,0.25)] px-5 py-4 text-center">
          <p className="font-slogan text-[11px] uppercase tracking-[2px] text-[#DC143C] mb-1">
            Riot stats unavailable
          </p>
          <p className="font-body text-[12px] text-neutral-400">
            {error || 'Could not load Riot data right now.'}
          </p>
        </div>
      </div>
    );
  }

  const { profile, ranked, mastery, recentMatches, dataDragonVersion } = stats;
  const wins = recentMatches.filter((m) => m.win).length;
  const losses = recentMatches.length - wins;

  return (
    <div className="mt-8 pt-8 border-t border-[rgba(102,0,0,0.3)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-1">
            Riot Stats
          </p>
          <h3 className="font-heading text-white text-[22px] leading-none tracking-wide">
            {profile.gameName}
            <span className="text-neutral-500 text-[16px]">#{profile.tagLine}</span>
          </h3>
        </div>
      </div>

      {/* Profile bar */}
      <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-black/40 border border-[rgba(102,0,0,0.3)] mb-5">
        {profile.profileIconId != null && (
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/profileicon/${profile.profileIconId}.png`}
            alt="icon"
            className="w-14 h-14 rounded-lg border-2 border-[#DC143C]"
            onError={(e) => { e.target.style.visibility = 'hidden'; }}
          />
        )}
        <div className="flex-1">
          <p className="font-slogan text-[10px] uppercase tracking-[2px] text-neutral-500">Level</p>
          <p className="font-heading text-white text-[26px] leading-none">{profile.summonerLevel ?? '—'}</p>
        </div>
        <div className="text-right">
          <p className="font-slogan text-[10px] uppercase tracking-[2px] text-neutral-500">Region</p>
          <p className="font-heading text-secondary text-[22px] leading-none uppercase">{profile.platform}</p>
        </div>
      </div>

      {/* Ranked */}
      <div className="flex flex-wrap gap-3 mb-5">
        <RankCard label="Solo / Duo" entry={ranked.solo} />
        <RankCard label="Flex" entry={ranked.flex} />
      </div>

      {/* Top mastery */}
      {mastery.length > 0 && (
        <div className="mb-5">
          <p className="font-slogan text-[10px] font-bold uppercase tracking-[3px] text-neutral-400 mb-2">
            Top Champions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {mastery.map((m) => (
              <MasteryCard key={m.championId} m={m} ddVer={dataDragonVersion} />
            ))}
          </div>
        </div>
      )}

      {/* Recent matches */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <p className="font-slogan text-[10px] font-bold uppercase tracking-[3px] text-neutral-400">
            Last {recentMatches.length} Matches
          </p>
          <p className="font-slogan text-[11px] tracking-wider">
            <span className="text-[#4ade80]">{wins}W</span>
            <span className="text-neutral-600 mx-1">·</span>
            <span className="text-[#ef4444]">{losses}L</span>
          </p>
        </div>
        {recentMatches.length === 0 ? (
          <p className="font-body text-[12px] text-neutral-500 text-center py-4">
            No recent matches found.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentMatches.map((m) => (
              <MatchRow key={m.matchId} m={m} ddVer={dataDragonVersion} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
