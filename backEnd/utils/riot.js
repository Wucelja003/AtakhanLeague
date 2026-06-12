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

// Map a tagLine to its platform region (used by Summoner-V4, League-V4,
// Champion-Mastery-V4). Falls back to 'eun1' if the tag isn't a region code.
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

export async function getAccountByRiotId(gameName, tagLine) {
  const routing = platformToRouting(inferPlatform(tagLine));
  return riotFetch(
    `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
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

// Cache champion ID → name map. Fetched once at first request, lives forever.
// Riot's Data Dragon is a free static CDN — no API key needed.
let _championMap = null;
let _dataDragonVersion = null;

export async function getChampionMap() {
  if (_championMap) return _championMap;

  // Get latest data dragon version
  const versions = await fetch('https://ddragon.leagueoflegends.com/api/versions.json').then((r) => r.json());
  _dataDragonVersion = versions[0];

  // Fetch champion list
  const data = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${_dataDragonVersion}/data/en_US/champion.json`
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

export function getDataDragonVersion() {
  return _dataDragonVersion;
}
