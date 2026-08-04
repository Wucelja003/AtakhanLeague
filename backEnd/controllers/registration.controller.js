import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';
import { sendTournamentConfirmation } from '../utils/mailer.js';
import { parseDivision } from '../utils/rank.js';
import { getPlatformForPuuid } from '../utils/riot.js';

// This tournament is EUNE only. The form sends the server the player picked;
// reject anything else here too so the check can't be skipped client-side.
const ALLOWED_SERVER = 'EUNE';
const wrongServer = (server) =>
  String(server || '').trim().toUpperCase() !== ALLOWED_SERVER;

// Second line of defence: ask Riot whether the account really lives on EUNE,
// so picking "EUNE" in the form isn't enough on its own. Riot names the
// platform outright — better than reading it off a 404 from somewhere else.
//   true  → confirmed on EUNE
//   false → Riot named a different platform — block
//   null  → couldn't check (no linked Riot account, Riot doesn't know the
//           account, or the API is down) — allow, we never punish players for
//           our own outage
async function isOnEune(puuid) {
  if (!puuid) return null;
  try {
    const platform = await getPlatformForPuuid(puuid);
    return platform ? platform === 'eun1' : null;
  } catch (err) {
    console.error('[riot] EUNE check unavailable (allowing):', err.message);
    return null;
  }
}

const NOT_EUNE_MSG =
  'Your Riot account is not on EUNE — this tournament is for EUNE players only.';

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
  const { teamName, division, role, server } = req.body;
  const captainId = req.user.id; // from verifyToken middleware

  if (!teamName || !division) {
    return next(errorHandler(400, 'Team name and division are required'));
  }
  if (wrongServer(server)) {
    return next(errorHandler(400, 'This tournament is for EUNE only.'));
  }

  // Captain's role is optional but if provided must be a valid LaneRole
  const captainRole = role ? roleMap[role] : null;
  if (role && !captainRole) {
    return next(errorHandler(400, 'Invalid role'));
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

    if ((await isOnEune(captain.riotPuuid)) === false) {
      return next(errorHandler(400, NOT_EUNE_MSG));
    }

    const team = await prisma.team.create({
      data: {
        name: teamName,
        division,
        captainId,
        captainUsername: captain.username,
        captainRole,
      },
    });

    // Put the captain on the leaderboard right away (team members are not added).
    // Existing points are never reset — only the team/rank snapshot is refreshed.
    const { tier, division: div } = parseDivision(team.division);
    await prisma.ranking
      .upsert({
        where: { username: captain.username },
        update: { team: team.name, tier, division: div },
        create: { username: captain.username, team: team.name, tier, division: div, points: 0 },
      })
      .catch((err) => console.error('[ranking] captain upsert failed:', err.message));

    // Send confirmation email — don't block on failure
    sendTournamentConfirmation(captain.email, {
      username: captain.username,
      type: 'team',
      teamName: team.name,
      division: team.division,
    }).catch((err) => {
      console.error('[mail] Failed to send team confirmation:', err.message);
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
  const { division, role, server } = req.body;
  const userId = req.user.id;

  if (!division || !role) {
    return next(errorHandler(400, 'Division and role are required'));
  }
  if (wrongServer(server)) {
    return next(errorHandler(400, 'This tournament is for EUNE only.'));
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

    if ((await isOnEune(user.riotPuuid)) === false) {
      return next(errorHandler(400, NOT_EUNE_MSG));
    }

    const reg = await prisma.individualRegistration.create({
      data: { userId, username: user.username, division, role: dbRole },
    });

    // Solo players land on the leaderboard too (no team yet — the organizer
    // fills that in once they're placed). Existing points are never reset.
    const { tier: soloTier, division: soloDiv } = parseDivision(reg.division);
    await prisma.ranking
      .upsert({
        where: { username: user.username },
        update: { tier: soloTier, division: soloDiv },
        create: { username: user.username, tier: soloTier, division: soloDiv, points: 0 },
      })
      .catch((err) => console.error('[ranking] solo upsert failed:', err.message));

    // Send confirmation email — don't block on failure
    sendTournamentConfirmation(user.email, {
      username: user.username,
      type: 'individual',
      role: role,
      division: reg.division,
    }).catch((err) => {
      console.error('[mail] Failed to send individual confirmation:', err.message);
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
        paid: r.paid,
      }))
    );
  } catch (error) {
    next(error);
  }
};

// --- GET /api/registration/teams --- (for TournamentBoard)
export const listTeams = async (req, res, next) => {
  try {
    const list = await prisma.team.findMany({
      orderBy: { createdAt: 'asc' },
    });
    res.json(
      list.map((t) => ({
        id: t.id,
        name: t.name,
        captainUsername: t.captainUsername,
        division: t.division,
        paid: t.paid,
      }))
    );
  } catch (error) {
    next(error);
  }
};
