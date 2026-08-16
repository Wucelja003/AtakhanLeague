import { prisma } from '../db.js';

// Close a season: move every team and solo registration into the archive
// tables and clear the live ones, so the next tournament starts from empty.
//
// Player accounts are never touched — only the registrations are. Someone who
// entered last season keeps their account, their Riot link and their place on
// the leaderboard, and simply isn't registered for anything any more.
//
// One transaction: copying and clearing must not be able to half-happen, or a
// failure between them would either lose the season or double it.
export async function archiveSeason(season) {
  const label = String(season || '').trim();
  if (!label) throw new Error('A season name is required');

  const [teams, solos] = await Promise.all([
    prisma.team.findMany({ include: { members: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'asc' } }),
    prisma.individualRegistration.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  if (teams.length === 0 && solos.length === 0) {
    return { season: label, teams: 0, members: 0, individuals: 0, empty: true };
  }

  const memberCount = teams.reduce((n, t) => n + t.members.length, 0);

  await prisma.$transaction(async (tx) => {
    for (const team of teams) {
      await tx.archivedTeam.create({
        data: {
          season: label,
          name: team.name,
          division: team.division,
          captainId: team.captainId,
          captainUsername: team.captainUsername,
          captainRole: team.captainRole,
          paid: team.paid,
          paidAt: team.paidAt,
          registeredAt: team.createdAt,
          members: {
            create: team.members.map((m) => ({
              teamName: m.teamName,
              username: m.username,
              role: m.role,
              division: m.division,
              registeredAt: m.createdAt,
            })),
          },
        },
      });
    }

    if (solos.length) {
      await tx.archivedIndividual.createMany({
        data: solos.map((s) => ({
          season: label,
          userId: s.userId,
          username: s.username,
          division: s.division,
          role: s.role,
          paid: s.paid,
          paidAt: s.paidAt,
          registeredAt: s.createdAt,
        })),
      });
    }

    // TeamMember rows go with their team — the relation cascades.
    await tx.team.deleteMany({});
    await tx.individualRegistration.deleteMany({});
  });

  console.log(`[archive] ${label}: ${teams.length} teams, ${memberCount} members, ${solos.length} solo`);
  return { season: label, teams: teams.length, members: memberCount, individuals: solos.length, empty: false };
}

// What's been archived so far, newest season first.
export async function listArchivedSeasons() {
  const [teams, solos] = await Promise.all([
    prisma.archivedTeam.groupBy({ by: ['season'], _count: { _all: true }, _max: { archivedAt: true } }),
    prisma.archivedIndividual.groupBy({ by: ['season'], _count: { _all: true } }),
  ]);
  const soloBySeason = Object.fromEntries(solos.map((s) => [s.season, s._count._all]));
  return teams
    .map((t) => ({
      season: t.season,
      teams: t._count._all,
      individuals: soloBySeason[t.season] || 0,
      archivedAt: t._max.archivedAt,
    }))
    .sort((a, b) => (b.archivedAt?.getTime() || 0) - (a.archivedAt?.getTime() || 0));
}
