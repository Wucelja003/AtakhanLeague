import { prisma } from '../db.js';
import { rankFromEntries } from './rank.js';
import { getRankedEntries } from './riot.js';
import { platformForUser } from './platform.js';

// Keep the Summoner Rankings leaderboard in step with a player's live Riot rank.
// Tier/division always mirror Riot; points are the organizer's data and are
// never touched here. Best-effort: leaderboard sync must never break its caller.

// Refresh a player's leaderboard rank from ranked entries you already have
// (e.g. the profile handler fetched them). Upserts tier + division.
export async function syncRankFromEntries(username, entries) {
  try {
    const { tier, division } = rankFromEntries(entries);
    await prisma.ranking.upsert({
      where: { username },
      update: { tier, division },
      create: { username, tier, division, points: 0 },
    });
  } catch (err) {
    console.error('[ranking] sync failed for', username, '-', err.message);
  }
}

// The leaderboard is keyed by username with no foreign key to anything, so
// nothing cleans up after a team or an account that goes away. These two do.

// A team registration was cancelled: drop the team label, keep the player.
// Being on the leaderboard follows the account, not the registration — their
// rank and points stay exactly as they were.
export async function clearLeaderboardTeam(username) {
  if (!username) return;
  try {
    await prisma.ranking.updateMany({ where: { username }, data: { team: null } });
  } catch (err) {
    console.error('[ranking] could not clear team for', username, '-', err.message);
  }
}

// The account itself is gone, so the row describes nobody. Remove it.
export async function removeFromLeaderboard(username) {
  if (!username) return;
  try {
    await prisma.ranking.deleteMany({ where: { username } });
  } catch (err) {
    console.error('[ranking] could not remove', username, '-', err.message);
  }
}

// A player's ranked entries, asked of the platform they actually play on.
//
// An empty answer is ambiguous — genuinely unranked, or the right question put
// to the wrong platform — and recording someone as unranked when they're
// Diamond is the worse mistake, so re-check the platform with Riot before
// believing it. Costs one extra call per unranked player, nothing for the rest,
// and it self-heals anyone who transfers region.
async function rankedEntriesFor(user) {
  const save = user.save; // set for leaderboard rows, absent for real users
  const platform = await platformForUser(user, { save });
  const entries = await getRankedEntries(user.riotPuuid, platform);
  if (entries.length > 0) return entries;

  const rechecked = await platformForUser(user, { force: true, save });
  if (rechecked === platform) return entries;
  return getRankedEntries(user.riotPuuid, rechecked);
}

// A leaderboard row linked to a Riot account by hand, shaped like the user
// objects above so the same lookup works on it — including caching the resolved
// platform back onto the row instead of onto some user.
function asTarget(row) {
  return {
    username: row.username,
    riotPuuid: row.riotPuuid,
    riotTagLine: row.riotTagLine,
    riotPlatform: row.riotPlatform,
    save: (platform) => prisma.ranking.update({ where: { id: row.id }, data: { riotPlatform: platform } }),
  };
}

// Pull a manually linked row's rank now, so it doesn't sit on typed-in values
// until the next daily sweep. Best-effort: the link is already saved either way.
export async function syncRankingRow(row) {
  try {
    if (!row?.riotPuuid) return;
    await syncRankFromEntries(row.username, await rankedEntriesFor(asTarget(row)));
  } catch (err) {
    console.error('[ranking] could not sync linked row', row?.username, '-', err.message);
  }
}

// Fetch a player's rank from Riot and sync it (for callers without entries in
// hand, e.g. signup). No-op when the user has no linked Riot account.
export async function fetchAndSyncRank(user) {
  try {
    if (!user?.riotPuuid) return;
    await syncRankFromEntries(user.username, await rankedEntriesFor(user));
  } catch (err) {
    console.error('[ranking] fetch+sync failed for', user?.username, '-', err.message);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Riot's personal key caps at 100 req / 2 min, so pace the sweep well under it
// (one player every ~1.5s) and run it sequentially — never a burst.
const SWEEP_DELAY_MS = 1500;

// Guard so a manual refresh and the daily job can't run at the same time and
// double the request rate. A second call while one is running is a no-op.
let sweeping = false;

// Refresh the leaderboard for EVERY user with a linked Riot account. Doubles as
// the backfill for players who signed up before auto-enrol existed and as the
// catch-up for players who never open their profile. Continue-on-error: one
// player's failure (rate limit, Riot outage) is skipped, never fatal.
// Returns { scanned, updated, skipped, alreadyRunning }.
export async function refreshAllRanks() {
  if (sweeping) return { scanned: 0, updated: 0, skipped: 0, alreadyRunning: true };
  sweeping = true;
  try {
    const users = await prisma.user.findMany({
      where: { riotPuuid: { not: null } },
      // id and riotPlatform are needed so the platform can be resolved once and
      // cached back onto the user rather than re-asked every sweep.
      select: { id: true, username: true, riotPuuid: true, riotTagLine: true, riotPlatform: true },
    });

    // Rows the organizer linked by hand — players with no account here. Any
    // whose name matches a real account is left to that account: it's the
    // better source, and sweeping both would just have one overwrite the other
    // seconds later for no gain.
    const named = new Set(users.map((u) => u.username));
    const linked = await prisma.ranking.findMany({
      where: { riotPuuid: { not: null }, username: { notIn: [...named] } },
      select: { id: true, username: true, riotPuuid: true, riotTagLine: true, riotPlatform: true },
    });

    const targets = [...users, ...linked.map(asTarget)];

    let updated = 0;
    let skipped = 0;
    for (const target of targets) {
      try {
        await syncRankFromEntries(target.username, await rankedEntriesFor(target));
        updated += 1;
      } catch (err) {
        skipped += 1;
        console.error('[ranking] sweep skipped', target.username, '-', err.message);
      }
      await sleep(SWEEP_DELAY_MS);
    }

    console.log(
      `[ranking] sweep done: ${updated} updated, ${skipped} skipped of ${targets.length} (${users.length} accounts, ${linked.length} linked by hand)`
    );
    return { scanned: targets.length, updated, skipped, linked: linked.length, alreadyRunning: false };
  } finally {
    sweeping = false;
  }
}
