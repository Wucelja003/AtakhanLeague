import { prisma } from '../db.js';

// ---- GET /api/rankings ---- (public)
// Leaderboard ordered by points. Used by the Rankings page and the admin panel.
export const getRankings = async (req, res, next) => {
  try {
    // Explicit, because this is public: riotPuuid is a stable account
    // identifier and has no business being broadcast. The game name and tag are
    // the player's public Riot ID and are safe — the admin panel reads this
    // same endpoint and needs them to show what a row is linked to.
    const rankings = await prisma.ranking.findMany({
      select: {
        id: true,
        username: true,
        team: true,
        tier: true,
        division: true,
        points: true,
        riotGameName: true,
        riotTagLine: true,
      },
      orderBy: [{ points: 'desc' }, { username: 'asc' }],
    });
    res.json(rankings);
  } catch (err) {
    next(err);
  }
};
