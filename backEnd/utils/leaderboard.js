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
