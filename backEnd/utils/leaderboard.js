import { prisma } from '../db.js';
import { rankFromEntries } from './rank.js';
import { getRankedEntries, inferPlatform } from './riot.js';

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

// Fetch a player's rank from Riot and sync it (for callers without entries in
// hand, e.g. signup). No-op when the user has no linked Riot account.
export async function fetchAndSyncRank(user) {
  try {
    if (!user?.riotPuuid) return;
    const platform = inferPlatform(user.riotTagLine);
    const entries = await getRankedEntries(user.riotPuuid, platform);
    await syncRankFromEntries(user.username, entries);
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
      select: { username: true, riotPuuid: true, riotTagLine: true },
    });

    let updated = 0;
    let skipped = 0;
    for (const user of users) {
      try {
        const platform = inferPlatform(user.riotTagLine);
        const entries = await getRankedEntries(user.riotPuuid, platform);
        await syncRankFromEntries(user.username, entries);
        updated += 1;
      } catch (err) {
        skipped += 1;
        console.error('[ranking] sweep skipped', user.username, '-', err.message);
      }
      await sleep(SWEEP_DELAY_MS);
    }

    console.log(`[ranking] sweep done: ${updated} updated, ${skipped} skipped of ${users.length}`);
    return { scanned: users.length, updated, skipped, alreadyRunning: false };
  } finally {
    sweeping = false;
  }
}
