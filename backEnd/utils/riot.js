// Riot Games API helper — Account-V1 endpoint for verifying Riot IDs.
// Docs: https://developer.riotgames.com/apis#account-v1

// Account-V1 is global — any routing region works. "europe" is closest to most
// of our users; if Riot's europe cluster is down, swap to "americas".
const ROUTING = 'europe';
const BASE_URL = `https://${ROUTING}.api.riotgames.com`;

function getKey() {
  const key = process.env.RIOT_API_KEY;
  if (!key) {
    throw new Error('RIOT_API_KEY is not set — add it to .env (dev) or Railway env vars (prod)');
  }
  return key;
}

/**
 * Look up a Riot account by Riot ID (gameName + tagLine).
 * Returns { puuid, gameName, tagLine } on success.
 * Returns null if the account doesn't exist (404).
 * Throws on other errors (rate limit, server down, invalid key).
 */
export async function getAccountByRiotId(gameName, tagLine) {
  const url = `${BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

  const res = await fetch(url, {
    headers: { 'X-Riot-Token': getKey() },
  });

  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) {
    throw new Error('Riot API key is invalid or expired');
  }
  if (res.status === 429) {
    throw new Error('Riot API rate limit exceeded — try again in a minute');
  }
  if (!res.ok) {
    throw new Error(`Riot API error: ${res.status} ${res.statusText}`);
  }

  return res.json(); // { puuid, gameName, tagLine }
}
