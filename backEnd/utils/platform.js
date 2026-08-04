import { prisma } from '../db.js';
import { getPlatformForPuuid, inferPlatform } from './riot.js';

// Which platform to send a player's Riot lookups to.
//
// This used to be guessed from the tagLine, which is wrong: a tagLine is free
// text the player picked ("1529", "help", "NPC"), not a region code. Every
// player whose tag wasn't literally their region was routed to the fallback
// platform, where Riot correctly answered "no such summoner" — so they came
// back with no rank, no level and no mastery, and landed on the leaderboard as
// unranked no matter what they actually were.
//
// So: ask Riot once, remember the answer on the user, and fall back to the old
// guess only if Riot can't be reached — never leave a lookup unmade.
export async function platformForUser(user, { force = false } = {}) {
  if (!force && user?.riotPlatform) return user.riotPlatform;

  const fallback = inferPlatform(user?.riotTagLine);
  if (!user?.riotPuuid) return fallback;

  try {
    const platform = await getPlatformForPuuid(user.riotPuuid);
    if (!platform) return fallback;

    if (user.id && platform !== user.riotPlatform) {
      // Cache it, but never let a write failure cost us the answer.
      await prisma.user
        .update({ where: { id: user.id }, data: { riotPlatform: platform } })
        .catch((err) => console.error('[riot] could not store platform for', user.username, '-', err.message));
      user.riotPlatform = platform;
    }
    return platform;
  } catch (err) {
    console.error('[riot] platform lookup failed for', user?.username, '- using', fallback, '-', err.message);
    return fallback;
  }
}
