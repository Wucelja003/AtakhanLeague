import { LANES, fullPoolTeams } from './pool';

// Who plays for a team, keyed by team name, for the two kinds of entrant the
// tournament has: a registered team (captain plus the roster they built) and a
// completed pool team (five solo players grouped by lane).
//
// Keyed by name because that's all a bracket match carries — Match rows store
// teamAName/teamBName as plain strings, not references.

const laneIndex = (role) => {
  const i = LANES.indexOf(role);
  return i === -1 ? LANES.length : i; // unknown or missing lane sorts last
};

export function buildRosters(teams = [], solo = []) {
  const byName = {};

  for (const team of teams) {
    if (!team?.name) continue;
    const players = [
      { username: team.captainUsername, role: team.captainRole, captain: true },
      ...(team.members || []).map((m) => ({ username: m.username, role: m.role, captain: false })),
    ].filter((p) => p.username);

    byName[team.name] = players.sort((a, b) => laneIndex(a.role) - laneIndex(b.role));
  }

  // A pool team's lineup is already in lane order, one entry per lane, and it
  // only appears here once every lane is filled — so no captain and no gaps.
  for (const team of fullPoolTeams(solo)) {
    byName[team.name] = team.lineup.map((p, i) => ({
      username: p.username,
      role: LANES[i],
      captain: false,
    }));
  }

  return byName;
}
