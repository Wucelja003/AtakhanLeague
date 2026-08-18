import { prisma } from '../db.js';
import { ensureBracket, buildBracketResponse } from '../utils/bracket.js';
import { standings, rankThirds } from '../utils/groups.js';
import { TOURNAMENTS, findTournament } from '../utils/tournaments.js';

// ---- GET /api/tournament/groups (public) ----
// Every tournament's group stage: the shape it will have, plus whatever has
// actually been drawn and played. Shapes are returned even when nothing has been
// drawn yet, so the page can show the tables it's going to have instead of
// nothing at all — the same reason the board shows its empty slots.
export const getGroups = async (req, res, next) => {
  try {
    const rows = await prisma.group.findMany({
      include: { teams: { orderBy: { seed: 'asc' } }, matches: { orderBy: { order: 'asc' } } },
      orderBy: [{ tournament: 'asc' }, { order: 'asc' }],
    });

    const payload = TOURNAMENTS.map((t) => {
      const shape = t.groups;
      const drawn = rows.filter((g) => g.tournament === t.id);

      // One entry per group the format calls for, whether or not it exists yet.
      const groups = Array.from({ length: shape.count }, (_, i) => {
        const name = String.fromCharCode(65 + i); // A, B, C…
        const group = drawn.find((g) => g.name === name);
        const teamNames = group ? group.teams.map((x) => x.teamName) : [];

        return {
          name,
          size: shape.size,
          rows: standings(teamNames, group?.matches || []),
          matches: (group?.matches || []).map((m) => ({
            id: m.id,
            teamA: m.teamAName,
            teamB: m.teamBName,
            winner: m.winnerName,
            killsA: m.killsA,
            killsB: m.killsB,
          })),
        };
      });

      return {
        tournament: t.id,
        label: t.label,
        advance: shape.advance,
        extraThirds: shape.extraThirds,
        groups,
        // Who the two extra places would go to as things stand. Empty until
        // there are third-placed teams to compare.
        bestThirds: shape.extraThirds
          ? rankThirds(groups).slice(0, shape.extraThirds).map((r) => r.team)
          : [],
      };
    });

    res.json(payload);
  } catch (err) {
    next(err);
  }
};

// ---- GET /api/tournament/bracket (public) ----
export const getBracket = async (req, res, next) => {
  try {
    await ensureBracket();
    const matches = await prisma.match.findMany();
    res.json(buildBracketResponse(matches));
  } catch (err) {
    next(err);
  }
};
