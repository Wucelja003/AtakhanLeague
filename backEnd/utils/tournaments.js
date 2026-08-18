// The tournaments a player can enter, as the server understands them.
//
// The frontend has its own copy for what it draws — banners, prizes, taglines.
// This holds only what has to be enforced, so a hand-made request can't enter a
// tournament that doesn't exist, claim a division it doesn't allow, or pay the
// wrong fee. The ids are the contract between the two.
export const TOURNAMENTS = [
  {
    id: 'low-elo',
    label: 'Low Elo',
    slots: 8,
    // Group stage: two groups of four, top two from each into the semifinals.
    groups: { count: 2, size: 4, advance: 2, extraThirds: 0 },
    // Per-player fee in cents. A captain pays for five.
    feeCents: 800,
    // Membership rather than a numeric range: it's how the divisions were
    // written down ("Silver – Platinum"), and there's nothing to get wrong.
    tiers: ['SILVER', 'GOLD', 'PLATINUM'],
    divisions: 'Silver – Platinum',
  },
  {
    id: 'high-elo',
    label: 'High Elo',
    slots: 12,
    // Three groups of four. Top two from each is six, so the two best
    // third-placed teams come along to make a clean eight for the quarterfinals.
    groups: { count: 3, size: 4, advance: 2, extraThirds: 2 },
    feeCents: 900,
    tiers: ['EMERALD', 'DIAMOND', 'MASTER'],
    // "Low Master" with the limit actually enforced. Grandmaster starts at 400
    // LP on EUNE, so 200 keeps the bracket to the bottom half of Master rather
    // than to anyone who happens not to have been promoted yet.
    maxLp: { MASTER: 200 },
    divisions: 'Emerald – Low Master',
  },
];

export const TEAM_SIZE = 5;

export const findTournament = (id) => TOURNAMENTS.find((t) => t.id === id) || null;

// May this rank enter that tournament?
//
//   true  → yes
//   false → no, and `reason` says which way it failed
//   null  → can't tell (no tier: Riot unreachable, or unranked). Callers let
//           those through — we never punish a player for our own outage.
//
// LP matters only where a tier carries a cap. An unknown LP inside a capped tier
// is the same can't-tell as an unknown tier, for the same reason.
export function rankAllowed(tournament, { tier, lp } = {}) {
  if (!tournament || !tier) return { ok: null };

  const upper = String(tier).toUpperCase();
  if (!tournament.tiers.includes(upper)) return { ok: false, reason: 'tier' };

  const cap = tournament.maxLp?.[upper];
  if (cap == null) return { ok: true };
  if (!Number.isFinite(lp)) return { ok: null };
  return lp <= cap ? { ok: true } : { ok: false, reason: 'lp', cap };
}
