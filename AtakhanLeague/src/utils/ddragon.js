// Champion portraits from Riot's Data Dragon — a free static CDN, no API key.
//
// Image paths are versioned, and old versions stay served forever, so a stale
// version still renders. The latest is fetched once and cached; the fallback
// below is only what's used until that answer arrives, or if it never does.
export const DDRAGON_FALLBACK_VERSION = '16.16.1';

// Data Dragon ids aren't the display names: no spaces, no punctuation, and a
// handful that don't follow from the name at all.
const ALIASES = {
  wukong: 'MonkeyKing',
  nunu: 'Nunu',
  'nunu & willump': 'Nunu',
  'nunu and willump': 'Nunu',
  'renata glasc': 'Renata',
  'dr. mundo': 'DrMundo',
  'dr mundo': 'DrMundo',
  'jarvan iv': 'JarvanIV',
  'lee sin': 'LeeSin',
  'master yi': 'MasterYi',
  'miss fortune': 'MissFortune',
  'tahm kench': 'TahmKench',
  'twisted fate': 'TwistedFate',
  'xin zhao': 'XinZhao',
  'aurelion sol': 'AurelionSol',
  'kog’maw': 'KogMaw',
  "kog'maw": 'KogMaw',
  "cho'gath": 'Chogath',
  "kai'sa": 'Kaisa',
  "kha'zix": 'Khazix',
  "vel'koz": 'Velkoz',
  "rek'sai": 'RekSai',
  "bel'veth": 'Belveth',
  "k'sante": 'KSante',
  leblanc: 'Leblanc',
  fiddlesticks: 'Fiddlesticks',
};

// Turn whatever was typed into the id Data Dragon uses for its files.
export function championId(name) {
  const raw = String(name || '').trim();
  if (!raw) return null;

  const alias = ALIASES[raw.toLowerCase()];
  if (alias) return alias;

  // Otherwise: strip anything that isn't a letter or digit, and capitalise the
  // first letter — "Miss Fortune" would have been caught above, "Ahri" is fine.
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, '');
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : null;
}

export function championIconUrl(name, version = DDRAGON_FALLBACK_VERSION) {
  const id = championId(name);
  return id ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${id}.png` : null;
}

let cached = null;

// One small CDN request, shared by every caller. Resolves to the fallback if
// Data Dragon can't be reached — a portrait from an older patch beats none.
export function latestDataDragonVersion() {
  if (!cached) {
    cached = fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then((r) => r.json())
      .then((v) => (Array.isArray(v) && v[0]) || DDRAGON_FALLBACK_VERSION)
      .catch(() => DDRAGON_FALLBACK_VERSION);
  }
  return cached;
}
