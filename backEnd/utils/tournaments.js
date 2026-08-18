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
    feeCents: 900,
    tiers: ['EMERALD', 'DIAMOND', 'MASTER'],
    divisions: 'Emerald – Low Master',
  },
];

export const TEAM_SIZE = 5;

export const findTournament = (id) => TOURNAMENTS.find((t) => t.id === id) || null;

// Does this tier belong in that tournament? An unknown tier (Riot couldn't be
// reached, or the player is unranked) returns null — not eligible, not
// ineligible — and callers treat that as "can't tell, let them in", the same way
// the region check does. We never punish a player for our own outage.
export function tierAllowed(tournament, tier) {
  if (!tournament || !tier) return null;
  return tournament.tiers.includes(String(tier).toUpperCase());
}
