// Turns the free-text division a captain typed at registration ("Emerald 2")
// into a tier + roman division the leaderboard can render an emblem for.

const TIERS = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM',
  'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER',
];

const NO_DIVISION = ['MASTER', 'GRANDMASTER', 'CHALLENGER'];
const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', I: 'I', II: 'II', III: 'III', IV: 'IV' };

export function parseDivision(text) {
  if (!text) return { tier: null, division: null };
  const upper = String(text).toUpperCase();

  // Longest first so GRANDMASTER isn't swallowed by MASTER.
  const tier = [...TIERS].sort((a, b) => b.length - a.length).find((t) => upper.includes(t)) || null;
  if (!tier) return { tier: null, division: null };
  if (NO_DIVISION.includes(tier)) return { tier, division: null };

  const rest = upper.replace(tier, ' ');
  const m = rest.match(/\b(IV|III|II|I|[1-4])\b/);
  return { tier, division: m ? ROMAN[m[1]] || null : null };
}

// Turns Riot League-V4 entries into a { tier, division } for the leaderboard.
// Prefers Solo/Duo, falls back to Flex, then any queue. MASTER+ has no division.
// Unranked (no entries) → { tier: null, division: null }.
export function rankFromEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { tier: null, division: null };
  }
  const entry =
    entries.find((e) => e.queueType === 'RANKED_SOLO_5x5') ||
    entries.find((e) => e.queueType === 'RANKED_FLEX_SR') ||
    entries[0];

  const tier = entry?.tier ? String(entry.tier).toUpperCase() : null;
  if (!tier) return { tier: null, division: null };
  if (NO_DIVISION.includes(tier)) return { tier, division: null };
  return { tier, division: ROMAN[entry.rank] || null };
}
