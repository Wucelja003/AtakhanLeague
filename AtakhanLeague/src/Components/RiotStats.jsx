import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../redux/user/userSlice';
import { api } from '../api';

// ---- helpers --------------------------------------------------------------

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

const queueLabel = (queueId, gameMode) => {
  const map = {
    420: 'Ranked Solo', 440: 'Ranked Flex',
    400: 'Normal Draft', 430: 'Normal Blind', 490: 'Quickplay', 480: 'Swiftplay',
    450: 'ARAM', 700: 'Clash', 900: 'URF', 1020: 'One for All',
    1700: 'Arena', 1900: 'URF',
  };
  return map[queueId] || (gameMode ? gameMode[0] + gameMode.slice(1).toLowerCase() : 'Custom');
};

const formatDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatPoints = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString());

const timeAgo = (ms) => {
  const sec = Math.floor((Date.now() - ms) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};

const kdaRatio = (k, d, a) => (d === 0 ? (k + a).toFixed(1) : ((k + a) / d).toFixed(2));

// Data Dragon image URL builders
const champUrl = (ver, name) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/champion/${name}.png`;
const itemUrl = (ver, id) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/item/${id}.png`;
const spellUrl = (ver, id) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/spell/${id}.png`;
const profileIconUrl = (ver, id) => `https://ddragon.leagueoflegends.com/cdn/${ver}/img/profileicon/${id}.png`;
const runeUrl = (iconPath) => `https://ddragon.leagueoflegends.com/cdn/img/${iconPath}`;
// Rank emblems: prefer self-hosted files in public/Icons/ranks/{tier}.png,
// fall back to Community Dragon CDN (see onEmblemError), then hide.
const emblemUrl = (tier) => `/Icons/ranks/${(tier || '').toLowerCase()}.png`;
const cdnEmblemUrl = (tier) =>
  `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${(tier || '').toLowerCase()}.png`;
const onEmblemError = (e, tier) => {
  if (!e.target.dataset.fallback) {
    e.target.dataset.fallback = '1';
    e.target.src = cdnEmblemUrl(tier);
  } else {
    e.target.style.visibility = 'hidden';
  }
};

const hideImg = (e) => { e.target.style.visibility = 'hidden'; };

// ---- sub-components --------------------------------------------------------

function RankCard({ label, entry }) {
  const unranked = !entry;
  const total = unranked ? 0 : entry.wins + entry.losses;
  const winRate = total > 0 ? Math.round((entry.wins / total) * 100) : 0;

  return (
    <div className="flex-1 min-w-[210px] rounded-2xl bg-gradient-to-br from-[rgba(102,0,0,0.10)] to-black/30 border border-[rgba(102,0,0,0.3)] px-5 py-4 flex items-center gap-4">
      <img
        src={unranked ? '/Icons/ranks/unranked.png' : emblemUrl(entry.tier)}
        alt={unranked ? 'Unranked' : entry.tier}
        className={`w-[84px] h-[84px] object-contain shrink-0 ${unranked ? 'opacity-50' : ''}`}
        onError={unranked ? hideImg : (e) => onEmblemError(e, entry.tier)}
      />
      <div className="min-w-0">
        <p className="font-slogan text-[10px] uppercase tracking-[2px] text-neutral-400 mb-1.5">{label}</p>
        {unranked ? (
          <p className="font-heading text-[22px] text-neutral-500 leading-none">Unranked</p>
        ) : (
          <>
            <p className={`font-heading text-[26px] leading-none ${tierColor(entry.tier)}`}>
              {entry.tier} {entry.rank}
            </p>
            <p className="font-slogan text-[13px] text-white mt-1.5">{entry.leaguePoints} LP</p>
            <div className="flex items-center gap-2 mt-1.5 font-slogan text-[11px]">
              <span className="text-neutral-300">{entry.wins}W {entry.losses}L</span>
              <span className="text-neutral-600">·</span>
              <span className={winRate >= 50 ? 'text-[#4ade80]' : 'text-[#ef4444]'}>{winRate}% WR</span>
            </div>
            {entry.hotStreak && (
              <span className="inline-block mt-2 px-2 py-0.5 rounded font-slogan text-[9px] tracking-wider uppercase bg-[rgba(220,20,60,0.15)] border border-[rgba(220,20,60,0.4)] text-[#DC143C]">
                🔥 Hot Streak
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChampRow({ c, ddVer }) {
  const wr = c.games > 0 ? Math.round((c.wins / c.games) * 100) : 0;
  const avgKda = kdaRatio(c.k / c.games, c.d / c.games, c.a / c.games);
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/40 border border-[rgba(102,0,0,0.25)]">
      <img
        src={champUrl(ddVer, c.name)}
        alt={c.display}
        className="w-9 h-9 rounded-md object-cover shrink-0"
        onError={hideImg}
      />
      <div className="flex-1 min-w-0">
        <p className="font-slogan text-[12px] font-bold text-white truncate">{c.display}</p>
        <p className="font-slogan text-[10px] text-neutral-500">{c.games} games · {avgKda} KDA</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-slogan text-[13px] font-bold ${wr >= 60 ? 'text-[#4ade80]' : wr >= 50 ? 'text-white' : 'text-neutral-400'}`}>{wr}%</p>
        <p className="font-slogan text-[10px]">
          <span className="text-[#4ade80]">{c.wins}W</span>
          <span className="text-neutral-600 mx-0.5">·</span>
          <span className="text-[#ef4444]">{c.games - c.wins}L</span>
        </p>
      </div>
    </div>
  );
}

function MatchRow({ m, ddVer, runeMap }) {
  const kda = kdaRatio(m.kills, m.deaths, m.assists);
  const csPerMin = m.gameDuration > 0 ? (m.totalMinionsKilled / (m.gameDuration / 60)).toFixed(1) : '0';
  const items = (m.items || []).slice(0, 6);
  const trinket = (m.items || [])[6];

  return (
    <div className={`relative overflow-hidden rounded-lg border ${m.win
      ? 'bg-[rgba(74,222,128,0.05)] border-[rgba(74,222,128,0.25)]'
      : 'bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.25)]'}`}>
      {/* result accent strip */}
      <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${m.win ? 'bg-[#4ade80]' : 'bg-[#ef4444]'}`} />

      <div className="flex items-center gap-3 pl-4 pr-3 py-3 flex-wrap sm:flex-nowrap">
        {/* queue + meta */}
        <div className="w-[88px] shrink-0">
          <p className={`font-slogan text-[11px] font-bold ${m.win ? 'text-[#4ade80]' : 'text-[#ef4444]'}`}>
            {m.win ? 'Victory' : 'Defeat'}
          </p>
          <p className="font-slogan text-[10px] text-neutral-400 leading-tight">{queueLabel(m.queueId, m.gameMode)}</p>
          <p className="font-slogan text-[9px] text-neutral-600 mt-0.5">{formatDuration(m.gameDuration)} · {timeAgo(m.gameEndTimestamp)}</p>
        </div>

        {/* champion + spells + runes */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <img src={champUrl(ddVer, m.championName)} alt={m.championDisplayName} className="w-12 h-12 rounded-md object-cover" onError={hideImg} />
            {m.champLevel != null && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black/85 border border-[rgba(102,0,0,0.5)] flex items-center justify-center font-slogan text-[9px] font-bold text-white">
                {m.champLevel}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {m.spells?.map((s, i) =>
              s ? <img key={i} src={spellUrl(ddVer, s)} alt="" className="w-[22px] h-[22px] rounded" onError={hideImg} />
                : <span key={i} className="w-[22px] h-[22px] rounded bg-black/40" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            {m.keystoneId && runeMap?.[m.keystoneId] && (
              <img src={runeUrl(runeMap[m.keystoneId])} alt="" className="w-[22px] h-[22px] rounded-full bg-black/60 p-px" onError={hideImg} />
            )}
            {m.subStyleId && runeMap?.[m.subStyleId] && (
              <img src={runeUrl(runeMap[m.subStyleId])} alt="" className="w-[22px] h-[22px] rounded-full p-[3px]" onError={hideImg} />
            )}
          </div>
        </div>

        {/* KDA */}
        <div className="shrink-0 text-center min-w-[78px]">
          <p className="font-slogan text-[14px] font-bold text-white">
            {m.kills} <span className="text-neutral-500">/</span> <span className="text-[#ef4444]">{m.deaths}</span> <span className="text-neutral-500">/</span> {m.assists}
          </p>
          <p className="font-slogan text-[10px] uppercase tracking-wider text-neutral-500">{kda} KDA</p>
        </div>

        {/* stats */}
        <div className="shrink-0 font-slogan text-[10px] text-neutral-400 leading-relaxed min-w-[92px]">
          <p>{positionLabel(m.teamPosition)}</p>
          <p>{m.totalMinionsKilled} CS ({csPerMin})</p>
          <p>{formatPoints(m.totalDamageDealtToChampions)} dmg</p>
        </div>

        {/* items */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 ml-auto shrink-0">
          {items.map((id, i) =>
            id ? <img key={i} src={itemUrl(ddVer, id)} alt="" className="w-6 h-6 rounded bg-black/40" onError={hideImg} />
              : <span key={i} className="w-6 h-6 rounded bg-black/30 border border-[rgba(102,0,0,0.15)]" />
          )}
          {trinket
            ? <img src={itemUrl(ddVer, trinket)} alt="" className="w-6 h-6 rounded bg-black/40" onError={hideImg} />
            : <span className="w-6 h-6 rounded bg-black/30 border border-[rgba(102,0,0,0.15)]" />}
        </div>
      </div>
    </div>
  );
}

// ---- main component --------------------------------------------------------

export default function RiotStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(api('/riot/me'), { credentials: 'include' })
      .then(async (r) => {
        // Session gone/expired — clear the stale persisted login and bounce to
        // sign-in instead of showing a broken half-logged-in profile.
        if (r.status === 401) {
          dispatch(signOut());
          navigate('/sign-in');
          throw new Error('Session expired — please sign in again.');
        }
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.message || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-8 py-10 backdrop-blur-md">
        <p className="font-slogan text-[11px] uppercase tracking-[3px] text-neutral-500 text-center">
          Loading Riot stats...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl bg-[rgba(220,20,60,0.06)] border border-[rgba(220,20,60,0.25)] px-8 py-6 text-center backdrop-blur-md">
        <p className="font-slogan text-[11px] uppercase tracking-[2px] text-[#DC143C] mb-1">
          Riot stats unavailable
        </p>
        <p className="font-body text-[12px] text-neutral-400">
          {error || 'Could not load Riot data right now.'}
        </p>
      </div>
    );
  }

  const { profile, ranked, mastery, recentMatches, runeMap, dataDragonVersion } = stats;
  const wins = recentMatches.filter((m) => m.win).length;
  const losses = recentMatches.length - wins;
  const recentWr = recentMatches.length > 0 ? Math.round((wins / recentMatches.length) * 100) : 0;

  // Aggregate recently-played champions client-side
  const champAgg = Object.values(
    recentMatches.reduce((acc, m) => {
      const e = acc[m.championId] || (acc[m.championId] = {
        championId: m.championId, name: m.championName, display: m.championDisplayName,
        games: 0, wins: 0, k: 0, d: 0, a: 0,
      });
      e.games++; if (m.win) e.wins++;
      e.k += m.kills; e.d += m.deaths; e.a += m.assists;
      return acc;
    }, {})
  ).sort((a, b) => b.games - a.games).slice(0, 5);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero header */}
      <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-6 sm:px-8 py-7 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar = Riot profile icon */}
          <div className="relative shrink-0">
            {profile.profileIconId != null ? (
              <img
                src={profileIconUrl(dataDragonVersion, profile.profileIconId)}
                alt="Summoner icon"
                className="w-24 h-24 rounded-2xl object-cover border-[3px] border-[#DC143C] shadow-[0_0_24px_rgba(220,20,60,0.4)]"
                onError={hideImg}
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-[3px] border-[#DC143C] bg-black/50" />
            )}
            {profile.summonerLevel != null && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/90 border border-[rgba(220,20,60,0.5)] font-slogan text-[11px] font-bold text-white shadow-[0_0_12px_rgba(220,20,60,0.4)]">
                {profile.summonerLevel}
              </span>
            )}
          </div>

          {/* Name + region */}
          <div className="text-center sm:text-left flex-1">
            <p className="font-slogan text-[10px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-1.5">
              Summoner
            </p>
            <h2 className="font-heading text-white text-[32px] sm:text-[40px] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
              {profile.gameName}
              <span className="text-neutral-500 text-[20px] sm:text-[24px]"> #{profile.tagLine}</span>
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 rounded-full font-slogan text-[11px] font-bold uppercase tracking-[2px] text-secondary border border-[rgba(102,0,0,0.45)] bg-black/40">
                {profile.platform}
              </span>
            </div>
          </div>
        </div>

        {/* Rank cards */}
        <div className="flex flex-wrap gap-3 mt-6">
          <RankCard label="Ranked Solo / Duo" entry={ranked.solo} />
          <RankCard label="Ranked Flex" entry={ranked.flex} />
        </div>
      </div>

      {/* Recently played + Top mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {champAgg.length > 0 && (
          <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-5 py-5 backdrop-blur-md">
            <div className="flex items-baseline justify-between mb-3">
              <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C]">Recently Played</p>
              <p className="font-slogan text-[11px] tracking-wider">
                <span className="text-[#4ade80]">{wins}W</span>
                <span className="text-neutral-600 mx-1">·</span>
                <span className="text-[#ef4444]">{losses}L</span>
                <span className="text-neutral-400 ml-1.5">{recentWr}%</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {champAgg.map((c) => <ChampRow key={c.championId} c={c} ddVer={dataDragonVersion} />)}
            </div>
          </div>
        )}

        {mastery.length > 0 && (
          <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-5 py-5 backdrop-blur-md">
            <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-3">Top Mastery</p>
            <div className="flex flex-col gap-2">
              {mastery.map((m) => (
                <div key={m.championId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/40 border border-[rgba(102,0,0,0.25)]">
                  <img src={champUrl(dataDragonVersion, m.championName)} alt={m.championDisplayName} className="w-9 h-9 rounded-md object-cover shrink-0" onError={hideImg} />
                  <div className="flex-1 min-w-0">
                    <p className="font-slogan text-[12px] font-bold text-white truncate">{m.championDisplayName}</p>
                    <p className="font-slogan text-[10px] uppercase tracking-wider text-neutral-500">Mastery {m.championLevel}</p>
                  </div>
                  <p className="font-slogan text-[12px] font-bold text-accent-gold shrink-0">{formatPoints(m.championPoints)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Match history */}
      <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-5 py-5 backdrop-blur-md">
        <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-3">
          Match History
        </p>
        {recentMatches.length === 0 ? (
          <p className="font-body text-[12px] text-neutral-500 text-center py-4">No recent matches found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentMatches.map((m) => (
              <MatchRow key={m.matchId} m={m} ddVer={dataDragonVersion} runeMap={runeMap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
