import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';

const roleMap = {
  top: 'TOP',
  jungle: 'JUNGLE',
  mid: 'MID',
  adc: 'ADC',
  support: 'SUPPORT',
};

// --- GET /api/team/roster --- captain views their team's full roster
export const getRoster = async (req, res, next) => {
  const captainId = req.user.id;
  try {
    const team = await prisma.team.findUnique({
      where: { captainId },
      include: { members: { orderBy: { createdAt: 'asc' } } },
    });
    if (!team) return next(errorHandler(404, 'You are not registered as a team captain'));

    res.json({
      ...team,
      captainRole: team.captainRole ? team.captainRole.toLowerCase() : null,
      members: team.members.map((m) => ({
        ...m,
        role: m.role.toLowerCase(),
      })),
    });
  } catch (error) {
    next(error);
  }
};

// --- POST /api/team/member --- captain adds a player to their team
export const addMember = async (req, res, next) => {
  const captainId = req.user.id;
  const { username, role, division } = req.body;

  if (!username || !role) {
    return next(errorHandler(400, 'Username and role are required'));
  }
  const dbRole = roleMap[role];
  if (!dbRole) return next(errorHandler(400, 'Invalid role'));

  try {
    const team = await prisma.team.findUnique({ where: { captainId } });
    if (!team) {
      return next(errorHandler(404, 'You are not registered as a team captain'));
    }

    // Cannot add a member to the captain's own lane
    if (team.captainRole && team.captainRole === dbRole) {
      return next(errorHandler(400, "That lane is taken by the captain"));
    }

    // Team has max 4 other members (5 total with captain)
    const memberCount = await prisma.teamMember.count({ where: { teamId: team.id } });
    if (memberCount >= 4) {
      return next(errorHandler(400, 'Team roster is already full'));
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        teamName: team.name, // snapshot for easy admin lookup
        username: username.trim(),
        role: dbRole,
        division: division ? division.trim() : null,
      },
    });
    res.status(201).json({ ...member, role: member.role.toLowerCase() });
  } catch (error) {
    // P2002 = unique [teamId, role] violation → role already taken
    if (error.code === 'P2002') {
      return next(errorHandler(409, 'That lane is already taken on your team'));
    }
    next(error);
  }
};

// --- DELETE /api/team/member/:id --- captain removes a player
export const removeMember = async (req, res, next) => {
  const captainId = req.user.id;
  const memberId = req.params.id;

  try {
    const team = await prisma.team.findUnique({ where: { captainId } });
    if (!team) return next(errorHandler(404, 'You are not a team captain'));

    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member) return next(errorHandler(404, 'Player not found'));

    // Captain can only remove members from their own team
    if (member.teamId !== team.id) {
      return next(errorHandler(403, 'You can only manage your own team'));
    }

    await prisma.teamMember.delete({ where: { id: memberId } });
    res.json({ message: 'Player removed from roster' });
  } catch (error) {
    next(error);
  }
};
