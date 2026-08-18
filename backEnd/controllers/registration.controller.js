import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';
import { sendTournamentConfirmation } from '../utils/mailer.js';
import { parseDivision } from '../utils/rank.js';
import { clearLeaderboardTeam } from '../utils/leaderboard.js';
import { getPlatformForPuuid, getRankedEntries } from '../utils/riot.js';
import { platformForUser } from '../utils/platform.js';
import { rankFromEntries, formatRank } from '../utils/rank.js';
import { findTournament, tierAllowed } from '../utils/tournaments.js';

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

// Which tournament is being entered, and may this player enter it?
//
// The division is checked against Riot rather than the text the form sent —
// typing your own rank is how "Emerald 2 ( racunaj Dia... )" got in. An
// unreachable Riot means we can't tell, and can't-tell lets them through: the
// same rule as the region check, for the same reason.
async function tournamentGate(user, tournamentId) {
  const tournament = findTournament(tournamentId);
  if (!tournament) {
    return { error: errorHandler(400, 'Pick which tournament you are entering') };
  }

  let tier = null;
  let riotDivision = null;
  if (user?.riotPuuid) {
    try {
      const entries = await getRankedEntries(user.riotPuuid, await platformForUser(user));
      const rank = rankFromEntries(entries);
      tier = rank.tier;
      riotDivision = formatRank(rank.tier, rank.division);
    } catch (err) {
      console.error('[riot] rank check unavailable (allowing):', err.message);
    }
  }

  if (tierAllowed(tournament, tier) === false) {
    const pretty = tier.charAt(0) + tier.slice(1).toLowerCase();
    return {
      error: errorHandler(
        400,
        `${tournament.label} is for ${tournament.divisions}. Riot has you at ${pretty}.`
      ),
    };
  }
  // The division Riot names, so what gets stored is not whatever the form
  // typed. Null when Riot couldn't say — then the submitted text is all there
  // is, and an unranked player still has to give one.
  return { tournament, riotDivision };
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
  const { teamName, division, role, server, tournament: tournamentId } = req.body;
  const captainId = req.user.id; // from verifyToken middleware

  if (!teamName) {
    return next(errorHandler(400, 'Team name is required'));
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

    const gate = await tournamentGate(captain, tournamentId);
    if (gate.error) return next(gate.error);

    // Riot's answer wins over the submitted text — typing your own rank is how
    // "Emerald 2 ( racunaj Dia posto nisam igrao toliko solo q )" got stored.
    const finalDivision = gate.riotDivision || division;
    if (!finalDivision) {
      return next(errorHandler(400, 'Riot has no rank for you — enter your division'));
    }

    const team = await prisma.team.create({
      data: {
        name: teamName,
        tournament: gate.tournament.id,
        division: finalDivision,
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
  const { division, role, server, tournament: tournamentId } = req.body;
  const userId = req.user.id;

  if (!role) {
    return next(errorHandler(400, 'Your lane is required'));
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

    const gate = await tournamentGate(user, tournamentId);
    if (gate.error) return next(gate.error);

    const finalDivision = gate.riotDivision || division;
    if (!finalDivision) {
      return next(errorHandler(400, 'Riot has no rank for you — enter your division'));
    }

    const reg = await prisma.individualRegistration.create({
      data: {
        userId,
        tournament: gate.tournament.id,
        username: user.username,
        division: finalDivision,
        role: dbRole,
      },
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
    // delete() returns the row, so the captain's name comes back with it —
    // no extra lookup needed to clear their leaderboard team label.
    const team = await prisma.team.delete({ where: { captainId } });
    await clearLeaderboardTeam(team.captainUsername);
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
        tournament: r.tournament,
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
      include: { members: { orderBy: { createdAt: 'asc' } } },
    });
    // Rosters ride along so the bracket can show who plays for a team.
    // Summoner names and lanes only — nothing here that isn't already on the
    // Players Pool board.
    res.json(
      list.map((t) => ({
        id: t.id,
        tournament: t.tournament,
        name: t.name,
        captainUsername: t.captainUsername,
        captainRole: t.captainRole ? t.captainRole.toLowerCase() : null,
        division: t.division,
        paid: t.paid,
        members: t.members.map((m) => ({
          username: m.username,
          role: m.role.toLowerCase(),
        })),
      }))
    );
  } catch (error) {
    next(error);
  }
};
