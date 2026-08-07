// Riot Games API helper — Account-V1, Summoner-V4, League-V4, Match-V5,
// Champion-Mastery-V4 endpoints, plus Data Dragon static champion data.
// Docs: https://developer.riotgames.com/apis

function getKey() {
  const key = process.env.RIOT_API_KEY;
  if (!key) throw new Error('RIOT_API_KEY is not set');
  return key;
}

async function riotFetch(url) {
  const res = await fetch(url, { headers: { 'X-Riot-Token': getKey() } });
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) throw new Error('Riot API key invalid/expired');
  if (res.status === 429) throw new Error('Riot API rate limit exceeded');
  if (!res.ok) throw new Error(`Riot API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ---- Region routing ------------------------------------------------------

// Riot's own answer to "which platform does this account play on". This is the
// only reliable source: a tagLine is free text the player chose, so it is
// usually a number or a word and says nothing about their region. Any routing
// host answers for any account, so europe is as good as the others.
// Returns e.g. 'euw1', or null if Riot doesn't know the account.
export async function getPlatformForPuuid(puuid) {
  const data = await riotFetch(
    `https://europe.api.riotgames.com/riot/account/v1/region/by-game/lol/by-puuid/${puuid}`
  );
  return data?.region || null;
}

// Last-resort guess from a tagLine, for when Riot can't be reached. Right only
// when the player happened to type their region as their tag — prefer
// getPlatformForPuuid (or platformForUser) wherever a PUUID is available.
export function inferPlatform(tagLine) {
  const t = (tagLine || '').toUpperCase();
  if (t === 'EUW' || t === 'EUW1') return 'euw1';
  if (t === 'EUNE' || t === 'EUN1') return 'eun1';
  if (t === 'NA' || t === 'NA1') return 'na1';
  if (t === 'KR') return 'kr';
  if (t === 'JP' || t === 'JP1') return 'jp1';
  if (t === 'BR' || t === 'BR1') return 'br1';
  if (t === 'LAN' || t === 'LA1') return 'la1';
  if (t === 'LAS' || t === 'LA2') return 'la2';
  if (t === 'OCE' || t === 'OC1') return 'oc1';
  if (t === 'TR' || t === 'TR1') return 'tr1';
  if (t === 'RU') return 'ru';
  return 'eun1';
}

// Map platform → routing region (used by Account-V1 and Match-V5).
export function platformToRouting(platform) {
  if (['euw1', 'eun1', 'tr1', 'ru'].includes(platform)) return 'europe';
  if (['na1', 'br1', 'la1', 'la2'].includes(platform)) return 'americas';
  if (['kr', 'jp1'].includes(platform)) return 'asia';
  if (['oc1'].includes(platform)) return 'sea';
  return 'europe';
}

// ---- Account / Summoner --------------------------------------------------

// Riot IDs are global — verified against all three routing hosts, each of which
// resolves any account regardless of region. So the host is a free choice, and
// deriving it from the tagLine only made this look region-dependent when it
// isn't. Signup verification works for a player on any platform.
// A Riot ID copied out of the game client, a browser, or this site's own data
// often carries invisible formatting characters — bidi isolates, zero-width
// joiners, a stray byte-order mark. They render as nothing, so an ID that looks
// perfect on screen comes back 404 with no visible reason. Strip them, and fold
// exotic spaces (non-breaking and friends) down to an ordinary one.
export function cleanRiotId(text) {
  return String(text ?? '')
    .replace(/\p{Cf}/gu, '')
    .replace(/\p{Zs}/gu, ' ')
    .trim();
}

export async function getAccountByRiotId(gameName, tagLine) {
  return riotFetch(
    `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );
}

export async function getSummonerByPuuid(puuid, platform) {
  return riotFetch(`https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`);
}

// ---- Ranked --------------------------------------------------------------

export async function getRankedEntries(puuid, platform) {
  // Riot's PUUID-based endpoint for league entries
  const data = await riotFetch(
    `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
  );
  return data || [];
}

// ---- Champion mastery ----------------------------------------------------

export async function getTopMastery(puuid, platform, count = 3) {
  const data = await riotFetch(
    `https://${platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`
  );
  return data || [];
}

// ---- Match history -------------------------------------------------------

export async function getMatchIds(puuid, routing, count = 10) {
  const data = await riotFetch(
    `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
  );
  return data || [];
}

export async function getMatchDetail(matchId, routing) {
  return riotFetch(`https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`);
}

// ---- Data Dragon (static champion data) ----------------------------------

// Cache static maps. Fetched once at first request, live forever.
// Riot's Data Dragon is a free static CDN — no API key needed.
let _championMap = null;
let _spellMap = null;
let _runeMap = null;
let _dataDragonVersion = null;

// Resolve (and cache) the latest Data Dragon version. Safe to call from
// multiple loaders concurrently — first one fetches, rest reuse.
async function ensureVersion() {
  if (!_dataDragonVersion) {
    const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then((r) => r.json());
    _dataDragonVersion = versions[0];
  }
  return _dataDragonVersion;
}

export async function getChampionMap() {
  if (_championMap) return _championMap;

  const ver = await ensureVersion();
  const data = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/champion.json`
  ).then((r) => r.json());

  const map = {};
  for (const champ of Object.values(data.data)) {
    map[parseInt(champ.key, 10)] = {
      id: champ.id,
      name: champ.name,
      title: champ.title,
    };
  }
  _championMap = map;
  return map;
}

// Summoner-spell map: numeric key (e.g. 4) → image id (e.g. "SummonerFlash").
// Image: img/spell/{imageId}.png
export async function getSummonerSpellMap() {
  if (_spellMap) return _spellMap;

  const ver = await ensureVersion();
  const data = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/summoner.json`
  ).then((r) => r.json());

  const map = {};
  for (const spell of Object.values(data.data)) {
    map[parseInt(spell.key, 10)] = spell.id;
  }
  _spellMap = map;
  return map;
}

// Runes map: id → icon path, for BOTH style ids (e.g. 8000) and individual
// rune ids (keystones etc.). Rune images use the version-less /cdn/img/ path:
// https://ddragon.leagueoflegends.com/cdn/img/{iconPath}
export async function getRunesMap() {
  if (_runeMap) return _runeMap;

  const ver = await ensureVersion();
  const styles = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${ver}/data/en_US/runesReforged.json`
  ).then((r) => r.json());

  const map = {};
  for (const style of styles) {
    map[style.id] = style.icon; // e.g. perk-images/Styles/7201_Precision.png
    for (const slot of style.slots) {
      for (const rune of slot.runes) {
        map[rune.id] = rune.icon; // e.g. perk-images/Styles/Precision/Conqueror/Conqueror.png
      }
    }
  }
  _runeMap = map;
  return map;
}

export function getDataDragonVersion() {
  return _dataDragonVersion;
}
