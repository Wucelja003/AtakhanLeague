// Shared rank helpers — emblem images live in public/Icons/ranks/{tier}.png
// with a Community Dragon CDN fallback.

export const TIERS = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM',
  'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER',
];

// Master and above have no division.
export const DIVISIONS = ['I', 'II', 'III', 'IV'];
export const hasDivision = (tier) =>
  !['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes((tier || '').toUpperCase());

export const emblemUrl = (tier) =>
  `/Icons/ranks/${(tier || 'unranked').toLowerCase()}.png`;

const cdnEmblemUrl = (tier) =>
  `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${(tier || '').toLowerCase()}.png`;

// Fall back to the CDN once, then hide the broken image.
export const onEmblemError = (e, tier) => {
  if (!e.target.dataset.fallback) {
    e.target.dataset.fallback = '1';
    e.target.src = cdnEmblemUrl(tier);
  } else {
    e.target.style.display = 'none';
  }
};

export const tierColor = (tier) => {
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

// "GOLD" + "II" → "Gold II"
export const rankLabel = (tier, division) => {
  if (!tier) return 'Unranked';
  const t = tier.charAt(0) + tier.slice(1).toLowerCase();
  return hasDivision(tier) && division ? `${t} ${division}` : t;
};
