// Solo registrants are grouped into stand-in teams: the first player to sign up
// for a lane joins the first team, the second joins the second, and so on.
//
// Players Pool draws that grid; the Tournament Board lists one of these teams
// once all five lanes are taken. Both read the grouping from here — worked out
// separately, they could disagree about who is on which team.

export const POOL_TEAM_NAMES = ['Team Alpha', 'Team Beta'];

// Canonical lane order. Everything indexed by position relies on it.
export const LANES = ['top', 'jungle', 'mid', 'adc', 'support'];

export function buildPoolTeams(registrations) {
  const list = Array.isArray(registrations) ? registrations : [];
  const byLane = LANES.reduce((acc, lane) => {
    acc[lane] = list.filter((r) => r.role === lane);
    return acc;
  }, {});

  return POOL_TEAM_NAMES.map((name, teamIndex) => {
    // One entry per lane, in LANES order; null where the lane is still open.
    const lineup = LANES.map((lane) => byLane[lane][teamIndex] || null);
    const isFull = lineup.every(Boolean);
    return {
      name,
      lineup,
      isFull,
      // Only a full team can be paid up — a partial one has nobody in the
      // remaining lanes to have paid.
      paid: isFull && lineup.every((p) => p.paid),
      fromPool: true,
    };
  });
}

// The teams that have earned a slot on the board.
export function fullPoolTeams(registrations) {
  return buildPoolTeams(registrations).filter((t) => t.isFull);
}
