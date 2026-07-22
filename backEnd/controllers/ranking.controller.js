import { prisma } from '../db.js';

// ---- GET /api/rankings ---- (public)
// Leaderboard ordered by points. Used by the Rankings page and the admin panel.
export const getRankings = async (req, res, next) => {
  try {
    const rankings = await prisma.ranking.findMany({
      orderBy: [{ points: 'desc' }, { username: 'asc' }],
    });
    res.json(rankings);
  } catch (err) {
    next(err);
  }
};
