import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';

// Map frontend role values (lowercase) → Prisma enum (uppercase)
const roleMap = {
  top: 'TOP',
  jungle: 'JUNGLE',
  mid: 'MID',
  adc: 'ADC',
  support: 'SUPPORT',
};

// --- POST /api/registration/team ---
export const registerTeam = async (req, res, next) => {
  const { teamName, division } = req.body;
  const captainId = req.user.id; // from verifyToken middleware

  if (!teamName || !division) {
    return next(errorHandler(400, 'Team name and division are required'));
  }

  try {
    // Block double-registration
    const existing = await prisma.team.findUnique({ where: { captainId } });
    if (existing) {
      return next(errorHandler(409, 'You are already registered as a team captain'));
    }
    const alreadyIndividual = await prisma.individualRegistration.findUnique({
      where: { userId: captainId },
    });
    if (alreadyIndividual) {
      return next(errorHandler(409, 'You are already registered individually'));
    }

    // Look up captain's username to snapshot
    const captain = await prisma.user.findUnique({ where: { id: captainId } });
    if (!captain) return next(errorHandler(404, 'User not found'));

    const team = await prisma.team.create({
      data: { name: teamName, division, captainId, captainUsername: captain.username },
    });
    res.status(201).json(team);
  } catch (error) {
    if (error.code === 'P2002') {
      return next(errorHandler(409, 'A team with that name already exists'));
    }
    next(error);
  }
};

// --- POST /api/registration/individual ---
export const registerIndividual = async (req, res, next) => {
  const { division, role } = req.body;
  const userId = req.user.id;

  if (!division || !role) {
    return next(errorHandler(400, 'Division and role are required'));
  }
  const dbRole = roleMap[role];
  if (!dbRole) return next(errorHandler(400, 'Invalid role'));

  try {
    const existing = await prisma.individualRegistration.findUnique({ where: { userId } });
    if (existing) {
      return next(errorHandler(409, 'You are already registered individually'));
    }
    const alreadyTeam = await prisma.team.findUnique({ where: { captainId: userId } });
    if (alreadyTeam) {
      return next(errorHandler(409, 'You are already registered as a team captain'));
    }

    // Look up username to snapshot
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return next(errorHandler(404, 'User not found'));

    const reg = await prisma.individualRegistration.create({
      data: { userId, username: user.username, division, role: dbRole },
    });
    res.status(201).json(reg);
  } catch (error) {
    next(error);
  }
};

// --- GET /api/registration/me --- current user's registration (team or individual)
export const getMyRegistration = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const [team, individual] = await Promise.all([
      prisma.team.findUnique({ where: { captainId: userId } }),
      prisma.individualRegistration.findUnique({ where: { userId } }),
    ]);
    res.json({
      team: team || null,
      individual: individual
        ? { ...individual, role: individual.role.toLowerCase() }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// --- DELETE /api/registration/team --- cancel current user's team
export const cancelTeam = async (req, res, next) => {
  const captainId = req.user.id;
  try {
    await prisma.team.delete({ where: { captainId } });
    res.json({ message: 'Team registration cancelled' });
  } catch (error) {
    if (error.code === 'P2025') return next(errorHandler(404, 'No team registration found'));
    next(error);
  }
};

// --- DELETE /api/registration/individual --- cancel current user's individual reg
export const cancelIndividual = async (req, res, next) => {
  const userId = req.user.id;
  try {
    await prisma.individualRegistration.delete({ where: { userId } });
    res.json({ message: 'Individual registration cancelled' });
  } catch (error) {
    if (error.code === 'P2025') return next(errorHandler(404, 'No individual registration found'));
    next(error);
  }
};

// --- GET /api/registration/individuals --- (for PlayersPool)
export const listIndividuals = async (req, res, next) => {
  try {
    const list = await prisma.individualRegistration.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json(
      list.map((r) => ({
        id: r.id,
        username: r.username,
        role: r.role.toLowerCase(),
        division: r.division,
      }))
    );
  } catch (error) {
    next(error);
  }
};
