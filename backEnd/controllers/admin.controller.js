import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';
import { ensureBracket, ADVANCE } from '../utils/bracket.js';
import { parseDivision } from '../utils/rank.js';
import { refreshAllRanks, clearLeaderboardTeam } from '../utils/leaderboard.js';

// ---- GET /api/admin/registrations ----
export const getRegistrations = async (req, res, next) => {
  try {
    const [teams, individuals] = await Promise.all([
      prisma.team.findMany({
        include: { members: true, captain: { select: { email: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.individualRegistration.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Attach the online-payment attempt status per registration (paid wins,
    // otherwise the most recent attempt: pending | failed | expired | null).
    const userIds = [...teams.map((t) => t.captainId), ...individuals.map((i) => i.userId)];
    const payments = userIds.length
      ? await prisma.payment.findMany({
          where: { userId: { in: userIds } },
          orderBy: { createdAt: 'desc' },
        })
      : [];
    const statusByUser = {};
    for (const p of payments) {
      if (p.status === 'paid') statusByUser[p.userId] = 'paid';
      else if (!statusByUser[p.userId]) statusByUser[p.userId] = p.status;
    }

    res.json({
      teams: teams.map((t) => ({ ...t, paymentStatus: statusByUser[t.captainId] || null })),
      individuals: individuals.map((i) => ({ ...i, paymentStatus: statusByUser[i.userId] || null })),
    });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/admin/payment/toggle ----  body: { kind, userId, paid }
export const togglePayment = async (req, res, next) => {
  const { kind, userId, paid } = req.body || {};
  try {
    const data = { paid: !!paid, paidAt: paid ? new Date() : null };
    if (kind === 'team') {
      await prisma.team.updateMany({ where: { captainId: userId }, data });
    } else if (kind === 'individual') {
      await prisma.individualRegistration.updateMany({ where: { userId }, data });
    } else {
      return next(errorHandler(400, 'Invalid kind'));
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ---- DELETE /api/admin/registration/:type/:id ----
export const cancelRegistration = async (req, res, next) => {
  const { type, id } = req.params;
  try {
    if (type === 'team') {
      const team = await prisma.team.delete({ where: { id } });
      await clearLeaderboardTeam(team.captainUsername);
    }
    else if (type === 'individual') await prisma.individualRegistration.delete({ where: { id } });
    else return next(errorHandler(400, 'Invalid type'));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

const LANES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

// ---- PATCH /api/admin/team/member/:id ----  body: { teamId, role? }
// Moves a rostered player to another team. Captains can only manage their own
// team, so a player switching sides otherwise needs two different people to act
// in the right order — this is the organizer doing it in one step.
//
// The lane comes along unless a new one is given, which is what you need when
// the destination already has that lane filled.
export const moveMember = async (req, res, next) => {
  const memberId = req.params.id;
  const teamId = (req.body?.teamId || '').trim();
  const rawRole = (req.body?.role || '').trim().toUpperCase();

  try {
    if (!teamId) return next(errorHandler(400, 'Pick a team to move the player to'));
    if (rawRole && !LANES.includes(rawRole)) return next(errorHandler(400, 'Invalid lane'));

    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member) return next(errorHandler(404, 'Player not found'));

    const role = rawRole || member.role;
    if (member.teamId === teamId && role === member.role) {
      return next(errorHandler(400, 'That player is already on this team in this lane'));
    }

    const target = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true },
    });
    if (!target) return next(errorHandler(404, 'Target team not found'));

    // Four alongside the captain. Moving within the same team isn't an arrival,
    // so it can't push the roster over.
    const arriving = member.teamId !== target.id;
    if (arriving && target.members.length >= 4) {
      return next(errorHandler(400, `${target.name} already has a full roster`));
    }
    if (target.captainRole === role) {
      return next(errorHandler(409, `${role} is the captain's lane on ${target.name}`));
    }
    // Checked here for a message that names the player, rather than letting the
    // [teamId, role] unique constraint surface as a bare P2002.
    const clash = target.members.find((m) => m.role === role && m.id !== member.id);
    if (clash) {
      return next(errorHandler(409, `${clash.username} already plays ${role} on ${target.name}`));
    }

    // teamName is a denormalized snapshot — moving without it would leave the
    // player listed under their old team everywhere it's read.
    const moved = await prisma.teamMember.update({
      where: { id: memberId },
      data: { teamId: target.id, teamName: target.name, role },
    });
    res.json({ ok: true, member: moved });
  } catch (err) {
    if (err.code === 'P2002') return next(errorHandler(409, 'That lane is already taken on the target team'));
    next(err);
  }
};

// ---- POST /api/admin/ranking ----  body: { username, team, tier, division, points }
// Creates or updates a leaderboard entry (keyed by summoner name).
export const upsertRanking = async (req, res, next) => {
  const username = (req.body?.username || '').trim();
  const team = (req.body?.team || '').trim() || null;
  const tier = (req.body?.tier || '').trim().toUpperCase() || null;
  const division = (req.body?.division || '').trim().toUpperCase() || null;
  const points = Number(req.body?.points);
  try {
    if (!username) return next(errorHandler(400, 'Summoner name is required'));
    if (!Number.isFinite(points)) return next(errorHandler(400, 'Points must be a number'));

    const data = { team, tier, division, points: Math.trunc(points) };
    const entry = await prisma.ranking.upsert({
      where: { username },
      update: data,
      create: { username, ...data },
    });
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/admin/ranking/sync-players ----
// Backfills the leaderboard with every team captain and every solo player
// (team members are never added). Existing points are preserved.
export const syncPlayers = async (req, res, next) => {
  try {
    const [teams, solos] = await Promise.all([
      prisma.team.findMany(),
      prisma.individualRegistration.findMany(),
    ]);
    let added = 0;

    const put = async (username, data) => {
      const existing = await prisma.ranking.findUnique({ where: { username } });
      if (!existing) added += 1;
      await prisma.ranking.upsert({
        where: { username },
        update: data,
        create: { username, ...data, points: 0 },
      });
    };

    for (const team of teams) {
      const { tier, division } = parseDivision(team.division);
      await put(team.captainUsername, { team: team.name, tier, division });
    }
    for (const solo of solos) {
      const { tier, division } = parseDivision(solo.division);
      await put(solo.username, { tier, division }); // no team yet
    }

    res.json({ ok: true, captains: teams.length, solo: solos.length, added });
  } catch (err) {
    next(err);
  }
};

// ---- DELETE /api/admin/ranking/:id ----
export const deleteRanking = async (req, res, next) => {
  try {
    await prisma.ranking.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/admin/ranking/refresh-ranks ----
// Sweep every user with a linked Riot account and pull their live rank onto the
// leaderboard (tier/division only; points kept). Paced under Riot's rate limit,
// so it can take a while — the response reports how many were updated/skipped.
export const refreshRanks = async (req, res, next) => {
  try {
    const result = await refreshAllRanks();
    if (result.alreadyRunning) {
      return next(errorHandler(409, 'A rank refresh is already running. Try again shortly.'));
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/admin/bracket/seed ----  body: { teams: [8 names] }
// Resets the bracket and assigns the 8 team names into the quarterfinals.
export const seedBracket = async (req, res, next) => {
  const teams = Array.isArray(req.body?.teams) ? req.body.teams : [];
  try {
    await ensureBracket();
    // Re-seeding invalidates any prior results.
    await prisma.match.updateMany({ data: { scoreA: null, scoreB: null, winnerName: null } });
    await prisma.match.updateMany({
      where: { code: { in: ['SF1', 'SF2', 'F'] } },
      data: { teamAName: null, teamBName: null },
    });

    const pairs = {
      QF1: [teams[0], teams[1]],
      QF2: [teams[2], teams[3]],
      QF3: [teams[4], teams[5]],
      QF4: [teams[6], teams[7]],
    };
    for (const [code, [a, b]] of Object.entries(pairs)) {
      await prisma.match.update({ where: { code }, data: { teamAName: a || null, teamBName: b || null } });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ---- POST /api/admin/match/:code/result ----  body: { scoreA, scoreB }
// Sets scores, decides the winner, and propagates it to the next match slot.
export const setMatchResult = async (req, res, next) => {
  const { code } = req.params;
  try {
    const match = await prisma.match.findUnique({ where: { code } });
    if (!match) return next(errorHandler(404, 'Match not found'));

    const parse = (v) => (v === '' || v == null ? null : Number(v));
    const a = parse(req.body?.scoreA);
    const b = parse(req.body?.scoreB);

    let winnerName = null;
    if (a != null && b != null) {
      if (a > b) winnerName = match.teamAName;
      else if (b > a) winnerName = match.teamBName;
    }

    await prisma.match.update({ where: { code }, data: { scoreA: a, scoreB: b, winnerName } });

    // Push the winner (or null, to clear) into the fed slot.
    const adv = ADVANCE[code];
    if (adv) {
      const [nextCode, slot] = adv;
      await prisma.match.update({
        where: { code: nextCode },
        data: slot === 'A' ? { teamAName: winnerName } : { teamBName: winnerName },
      });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
