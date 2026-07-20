import { prisma } from '../db.js';
import { ensureBracket, buildBracketResponse } from '../utils/bracket.js';

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
