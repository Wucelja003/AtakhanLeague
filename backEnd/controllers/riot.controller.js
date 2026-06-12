import { prisma } from '../db.js';
import { errorHandler } from '../utils/error.js';
import {
  inferPlatform, platformToRouting,
  getSummonerByPuuid, getRankedEntries, getTopMastery,
  getMatchIds, getMatchDetail, getChampionMap, getDataDragonVersion,
} from '../utils/riot.js';

// In-memory cache (per-process) so we don't burn rate limit on every refresh.
// Key = userId, value = { data, expiry }. TTL = 5 min.
const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

// ---- GET /api/riot/me ----------------------------------------------------
// Returns op.gg-style aggregated stats for the logged-in user.
export const getMyStats = async (req, res, next) => {
  const userId = req.user.id;

  // Cached?
  const cached = cache.get(userId);
  if (cached && cached.expiry > Date.now()) {
    return res.json(cached.data);
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.riotPuuid) {
      return next(errorHandler(404, 'No Riot account linked to this user'));
    }

    const platform = inferPlatform(user.riotTagLine);
    const routing  = platformToRouting(platform);

    // Run independent calls in parallel
    const [summoner, rankedEntries, topMastery, matchIds, champMap] = await Promise.all([
      getSummonerByPuuid(user.riotPuuid, platform),
      getRankedEntries(user.riotPuuid, platform),
      getTopMastery(user.riotPuuid, platform, 3),
      getMatchIds(user.riotPuuid, routing, 10),
      getChampionMap(),
    ]);

    // Fetch each match in parallel (only IDs returned, need to look up details)
    const matches = await Promise.all(
      matchIds.map((id) => getMatchDetail(id, routing).catch(() => null))
    );

    // Extract relevant fields from each match for this user
    const recentMatches = matches.filter(Boolean).map((m) => {
      const me = m.info.participants.find((p) => p.puuid === user.riotPuuid);
      if (!me) return null;
      return {
        matchId: m.metadata.matchId,
        gameDuration: m.info.gameDuration,         // seconds
        gameMode: m.info.gameMode,                 // CLASSIC, ARAM, ...
        queueId: m.info.queueId,                   // 420 = solo, 440 = flex
        gameEndTimestamp: m.info.gameEndTimestamp, // ms
        win: me.win,
        championId: me.championId,
        championName: champMap[me.championId]?.id || `Champion${me.championId}`,
        championDisplayName: champMap[me.championId]?.name || `Champion ${me.championId}`,
        kills: me.kills,
        deaths: me.deaths,
        assists: me.assists,
        totalDamageDealtToChampions: me.totalDamageDealtToChampions,
        totalMinionsKilled: me.totalMinionsKilled + (me.neutralMinionsKilled || 0),
        goldEarned: me.goldEarned,
        teamPosition: me.teamPosition, // TOP/JUNGLE/MIDDLE/BOTTOM/UTILITY
      };
    }).filter(Boolean);

    // Group ranked entries by queueType
    const ranked = {
      solo: rankedEntries.find((e) => e.queueType === 'RANKED_SOLO_5x5') || null,
      flex: rankedEntries.find((e) => e.queueType === 'RANKED_FLEX_SR')  || null,
    };

    // Enrich mastery with champion names
    const mastery = topMastery.map((m) => ({
      championId: m.championId,
      championName: champMap[m.championId]?.id || `Champion${m.championId}`,
      championDisplayName: champMap[m.championId]?.name || `Champion ${m.championId}`,
      championLevel: m.championLevel,
      championPoints: m.championPoints,
    }));

    const payload = {
      profile: {
        gameName: user.riotGameName,
        tagLine: user.riotTagLine,
        platform,
        summonerLevel: summoner?.summonerLevel ?? null,
        profileIconId: summoner?.profileIconId ?? null,
      },
      ranked,
      mastery,
      recentMatches,
      dataDragonVersion: getDataDragonVersion(),
    };

    cache.set(userId, { data: payload, expiry: Date.now() + TTL_MS });
    res.json(payload);
  } catch (err) {
    console.error('[riot] getMyStats failed:', err.message);
    next(errorHandler(503, err.message || 'Riot API unavailable'));
  }
};
