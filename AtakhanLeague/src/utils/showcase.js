// ---------------------------------------------------------------------------
// EDIT HERE. Everything the site shows when it has no live data to show.
//
// The API is the source of truth wherever it answers. This file is what fills
// the boards, tables and brackets when it does not — which is most of the time
// now, and all of the time for the two games that have never had a season.
// Without it the Rankings page, the group tables, the bracket and the League
// page all render their empty states, and a platform that renders nothing
// looks broken rather than idle.
//
// The names here are invented. No real player is placed in a fixture they did
// not play, and nothing claims a date — the formats are the point, not a
// schedule that does not exist yet.
// ---------------------------------------------------------------------------

/* The three games a tournament can be run for. `image` is a file in public/.
   `accent` is the colour that game's sections tint towards — the site is
   crimson throughout, so each game shifts it rather than replacing it. */
export const GAMES = [
  {
    id: 'lol',
    name: 'League of Legends',
    short: 'LoL',
    image: '/ThumbnailTournament.webp',
    // Landscape and close to the card's shape, so nothing important crops out.
    focus: 'center 35%',
    accent: '#DC143C',
    tagline: 'Five on five, one Rift',
    blurb:
      'The format Atakhan League was built on. Five players a side, round-robin groups, then straight knockout until one team is left.',
    teamSize: 5,
    roles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
    facts: [
      ['Team size', '5 players'],
      ['Server', 'EUNE'],
      ['Default format', 'Groups → Knockout'],
      ['Match length', 'Bo1 groups, Bo3 playoffs'],
    ],
    formats: ['groups', 'single', 'double'],
  },
  {
    id: 'tft',
    name: 'Teamfight Tactics',
    short: 'TFT',
    image: '/tft-keyart.webp',
    // 2500x2500 square in a landscape card, so most of its height is cropped
    // away. Held just below the middle — that is where the stage and the
    // figures on it are; higher up is empty sky.
    focus: 'center 58%',
    accent: '#b06bff',
    tagline: 'Eight players, one lobby',
    blurb:
      'No teams and no bracket — eight players a lobby, placement turned into points, and the table carried across every round of the day.',
    teamSize: 1,
    roles: ['Solo'],
    facts: [
      ['Lobby size', '8 players'],
      ['Server', 'EUNE'],
      ['Default format', 'Points across lobbies'],
      ['Scoring', '8 / 7 / 6 / 5 / 4 / 3 / 2 / 1'],
    ],
    formats: ['lobbies', 'swiss'],
  },
  {
    id: 'valorant',
    name: 'VALORANT',
    short: 'Valorant',
    image: '/valorant-keyart.webp',
    focus: 'center 40%',
    accent: '#ff4655',
    tagline: 'Five on five, no second chances',
    blurb:
      'Double elimination, because one bad map should not end a tournament. Lose in the upper bracket and the lower bracket is still open.',
    teamSize: 5,
    roles: ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Flex'],
    facts: [
      ['Team size', '5 players'],
      ['Server', 'EU'],
      ['Default format', 'Double elimination'],
      ['Match length', 'Bo1 until the final'],
    ],
    formats: ['double', 'single', 'swiss'],
  },
];

export const gameById = (id) => GAMES.find((g) => g.id === id) || GAMES[0];

/* The bracket and table formats the platform can run. This list is what the
   Tournaments page offers — each one is drawn with real, filled-in demo data
   rather than described in a sentence. */
export const FORMATS = [
  {
    id: 'groups',
    label: 'Groups → Knockout',
    blurb:
      'Everyone plays everyone in their group, the top of each group goes through, and the rest is a straight bracket. Level on wins is settled by kill difference.',
  },
  {
    id: 'single',
    label: 'Single Elimination',
    blurb:
      'Lose once and you are out. The shortest format there is — eight teams, three rounds, and a third-place match so nobody goes home on a semifinal.',
  },
  {
    id: 'double',
    label: 'Double Elimination',
    blurb:
      'A loss drops you to the lower bracket instead of out. Longer to run, far harder to be knocked out by one bad draw.',
  },
  {
    id: 'swiss',
    label: 'Swiss Rounds',
    blurb:
      'No bracket at all. Each round pairs teams on equal records, and everyone plays every round until enough of them have the wins to qualify.',
  },
  {
    id: 'lobbies',
    label: 'Points Across Lobbies',
    blurb:
      'For games without two sides. Placement in each lobby becomes points, the points carry across the day, and the table is the result.',
  },
];

export const formatById = (id) => FORMATS.find((f) => f.id === id);

// ---------------------------------------------------------------------------
// Invented teams and players. Kept in one place so a name changed here changes
// in the bracket, the group table and the league table at once.
// ---------------------------------------------------------------------------

export const DEMO_TEAMS = [
  'Crimson Vanguard',
  'Nocturne Syndicate',
  'Iron Covenant',
  'Void Wardens',
  'Ashen Legion',
  'Sablewood',
  'Riftbreakers',
  'Emberfall',
  'Hollow Crown',
  'Pale Horizon',
  'Gravewind',
  'Stormcallers',
];

export const DEMO_PLAYERS = [
  'Vexmar', 'Lunarbane', 'Sythe', 'Drakovian', 'Tenebrae',
  'Noxwell', 'Kaidrel', 'Morrowyn', 'Fenrisk', 'Halvard',
  'Ysolde', 'Brannoc', 'Cindrel', 'Oskaryn', 'Threnody',
  'Varkos', 'Mirelle', 'Durnhal', 'Esveig', 'Ravenwood',
];

/* A full five for each team, so expanding a match card in the bracket shows a
   roster instead of nothing. Built rather than written out: twelve teams of
   five is sixty lines of noise otherwise. */
export function demoRoster(teamName, roles) {
  const seed = [...teamName].reduce((n, c) => n + c.charCodeAt(0), 0);
  return roles.map((role, i) => ({
    username: DEMO_PLAYERS[(seed + i * 7) % DEMO_PLAYERS.length],
    // Lowercase because that is how LANE_META is keyed, and the lane icon is
    // looked up straight off this value. Valorant's roles have no icon and
    // fall through to a blank spacer, which is the intended result.
    role: role.toLowerCase(),
    captain: i === 0,
  }));
}

export function demoRosters(game, teams = DEMO_TEAMS) {
  if (game.teamSize === 1) return {};
  return Object.fromEntries(teams.map((t) => [t, demoRoster(t, game.roles)]));
}

// ---------------------------------------------------------------------------
// Leaderboard. Points follow the distribution the first season actually used
// — 1000 / 700 / 500 / 350 and 200 for everyone else — so the spread looks
// like a season that happened rather than random numbers.
// ---------------------------------------------------------------------------

const TIERS = [
  ['CHALLENGER', 'I'], ['GRANDMASTER', 'I'], ['MASTER', 'I'],
  ['DIAMOND', 'II'], ['DIAMOND', 'IV'], ['EMERALD', 'I'], ['EMERALD', 'III'],
  ['PLATINUM', 'II'], ['PLATINUM', 'IV'], ['GOLD', 'I'], ['GOLD', 'III'],
  ['SILVER', 'II'], ['SILVER', 'IV'], ['BRONZE', 'I'],
];

const LEADERBOARD_POINTS = [
  2450, 2100, 1850, 1700, 1550, 1400, 1300, 1150, 1050, 950,
  900, 850, 800, 750, 700, 650, 600, 550, 500, 450,
];

export const DEMO_RANKINGS = DEMO_PLAYERS.map((username, i) => ({
  username,
  tier: TIERS[i % TIERS.length][0],
  division: TIERS[i % TIERS.length][1],
  points: LEADERBOARD_POINTS[i],
}));

// ---------------------------------------------------------------------------
// The season-long league table. Not a tournament: every team plays every other
// one across the split, three points a win, and the top four meet in playoffs.
// ---------------------------------------------------------------------------

const LEAGUE_RESULTS = [
  // [played, won, lost, roundsFor, roundsAgainst]
  [14, 12, 2, 26, 9],
  [14, 11, 3, 25, 12],
  [14, 10, 4, 23, 13],
  [14, 9, 5, 21, 15],
  [14, 8, 6, 19, 16],
  [14, 7, 7, 18, 18],
  [14, 7, 7, 17, 18],
  [14, 6, 8, 16, 19],
  [14, 5, 9, 14, 20],
  [14, 4, 10, 12, 22],
  [14, 3, 11, 10, 24],
  [14, 2, 12, 8, 26],
];

export const DEMO_LEAGUE = DEMO_TEAMS.map((name, i) => {
  const [played, won, lost, roundsFor, roundsAgainst] = LEAGUE_RESULTS[i];
  return {
    name,
    played,
    won,
    lost,
    roundsFor,
    roundsAgainst,
    diff: roundsFor - roundsAgainst,
    points: won * 3,
    // Last five, newest first — the little form strip at the end of the row.
    form: Array.from({ length: 5 }, (_, k) => ((i + k) % 3 === 0 ? 'L' : 'W')),
  };
});

/* Where the table splits: top four into the playoffs, bottom two relegated out
   of the split. Drawn as lines in the table rather than explained underneath. */
export const LEAGUE_CUTS = { playoff: 4, relegation: DEMO_TEAMS.length - 2 };

// ---------------------------------------------------------------------------
// The brackets.
//
// Written out rather than generated. A generator would have to be told who won
// anyway, and hand-written results can be made to agree across rounds — the
// winner of a quarterfinal is the name that turns up in the semifinal, the team
// knocked out of the upper bracket is the one that appears in the lower. A
// bracket whose rounds contradict each other is the one thing that would give
// the whole showcase away.
//
// The eight are the first eight of DEMO_TEAMS, in seed order.
// ---------------------------------------------------------------------------
const [CV, NS, IC, VW, AL, SW, RB, EF] = DEMO_TEAMS;

const m = (id, round, teamA, scoreA, teamB, scoreB) => ({
  id, round, teamA, teamB, scoreA, scoreB,
});

export const SINGLE_ELIM = {
  columns: [
    {
      label: 'Quarterfinals',
      matches: [
        m('qf1', 'Quarterfinal 1', CV, 2, EF, 0),
        m('qf2', 'Quarterfinal 2', NS, 2, RB, 1),
        m('qf3', 'Quarterfinal 3', IC, 0, SW, 2),
        m('qf4', 'Quarterfinal 4', VW, 2, AL, 1),
      ],
    },
    {
      label: 'Semifinals',
      matches: [
        m('sf1', 'Semifinal 1', CV, 2, NS, 1),
        m('sf2', 'Semifinal 2', SW, 1, VW, 2),
      ],
    },
    {
      label: 'Final',
      matches: [m('f', 'Grand Final', CV, 3, VW, 2)],
      // Hung under the final rather than given a column of its own.
      extra: { label: 'Third Place', match: m('tp', 'Third Place', NS, 2, SW, 0) },
    },
  ],
  champion: CV,
};

export const DOUBLE_ELIM = {
  upper: [
    {
      label: 'Upper Round 1',
      matches: [
        m('ur1', 'Upper 1', CV, 2, EF, 0),
        m('ur2', 'Upper 2', NS, 2, RB, 1),
        m('ur3', 'Upper 3', IC, 0, SW, 2),
        m('ur4', 'Upper 4', VW, 2, AL, 1),
      ],
    },
    {
      label: 'Upper Semifinals',
      matches: [
        m('us1', 'Upper SF 1', CV, 2, NS, 1),
        m('us2', 'Upper SF 2', SW, 1, VW, 2),
      ],
    },
    { label: 'Upper Final', matches: [m('uf', 'Upper Final', CV, 2, VW, 0)] },
  ],
  // Everyone here arrived by losing above, in the round the label names.
  lower: [
    {
      label: 'Lower Round 1',
      matches: [
        m('lr1', 'Lower 1', EF, 0, RB, 2),
        m('lr2', 'Lower 2', IC, 2, AL, 1),
      ],
    },
    {
      label: 'Lower Round 2',
      matches: [
        m('lr3', 'Lower 3', RB, 2, NS, 0),
        m('lr4', 'Lower 4', IC, 1, SW, 2),
      ],
    },
    { label: 'Lower Semifinal', matches: [m('ls', 'Lower SF', RB, 2, SW, 1)] },
    { label: 'Lower Final', matches: [m('lf', 'Lower Final', RB, 1, VW, 2)] },
  ],
  grandFinal: m('gf', 'Grand Final', CV, 3, VW, 1),
  champion: CV,
};

/* Two groups of four, played out. The columns are the tiebreakers in the order
   they apply — level on wins is settled by kill difference. */
const groupRow = (name, wins, losses, killsFor, killsAgainst) => ({
  name, played: wins + losses, wins, losses, killsFor, killsAgainst,
  killDiff: killsFor - killsAgainst,
});

export const GROUP_STAGE = {
  groups: [
    {
      name: 'A',
      rows: [
        groupRow(CV, 3, 0, 61, 32),
        groupRow(NS, 2, 1, 48, 41),
        groupRow(IC, 1, 2, 39, 50),
        groupRow(EF, 0, 3, 28, 53),
      ],
    },
    {
      name: 'B',
      rows: [
        groupRow(VW, 3, 0, 57, 30),
        groupRow(SW, 2, 1, 51, 44),
        // Level on wins with Sablewood above them; kill difference separates
        // the two, which is exactly what the last column is for.
        groupRow(RB, 1, 2, 42, 47),
        groupRow(AL, 0, 3, 31, 60),
      ],
    },
  ],
  advance: 2,
  knockout: [
    {
      label: 'Semifinals',
      matches: [
        m('gs1', 'Semifinal 1', CV, 2, SW, 0),
        m('gs2', 'Semifinal 2', VW, 2, NS, 1),
      ],
    },
    { label: 'Final', matches: [m('gf2', 'Grand Final', CV, 3, VW, 1)] },
  ],
  champion: CV,
};

/* Swiss: nobody is knocked out, everyone plays every round, and the pairing
   each round is between teams on the same record. Three wins qualifies, three
   losses is out — so the table, not a bracket, is the result. */
export const SWISS = {
  rounds: 3,
  qualifyAt: 3,
  rows: [
    { name: CV, wins: 3, losses: 0, opponents: [EF, NS, VW], status: 'Qualified' },
    { name: VW, wins: 3, losses: 0, opponents: [AL, SW, IC], status: 'Qualified' },
    { name: NS, wins: 2, losses: 1, opponents: [RB, CV, SW], status: 'Qualified' },
    { name: SW, wins: 2, losses: 1, opponents: [IC, VW, NS], status: 'Qualified' },
    { name: RB, wins: 1, losses: 2, opponents: [NS, EF, AL], status: 'Eliminated' },
    { name: IC, wins: 1, losses: 2, opponents: [SW, AL, VW], status: 'Eliminated' },
    { name: AL, wins: 1, losses: 2, opponents: [VW, IC, RB], status: 'Eliminated' },
    { name: EF, wins: 0, losses: 3, opponents: [CV, RB, '—'], status: 'Eliminated' },
  ],
};

/* Points across lobbies — the format for a game with no two sides. Eight
   players, three lobbies, placement turned into points. */
const PLACEMENT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

const LOBBY_PLACINGS = [
  [1, 3, 1], [2, 1, 4], [4, 2, 2], [3, 5, 3],
  [6, 4, 5], [5, 7, 6], [7, 6, 8], [8, 8, 7],
];

export const LOBBY_STAGE = {
  lobbies: 3,
  scoring: PLACEMENT_POINTS,
  rows: DEMO_PLAYERS.slice(0, 8)
    .map((name, i) => {
      const placings = LOBBY_PLACINGS[i];
      return {
        name,
        placings,
        points: placings.reduce((n, p) => n + PLACEMENT_POINTS[p - 1], 0),
        wins: placings.filter((p) => p === 1).length,
      };
    })
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name)),
  advance: 4,
};

/* Which data each format draws. Keeps the switcher from growing a chain of
   conditionals that has to be edited in two places whenever a format is added. */
export const FORMAT_DATA = {
  single: SINGLE_ELIM,
  double: DOUBLE_ELIM,
  groups: GROUP_STAGE,
  swiss: SWISS,
  lobbies: LOBBY_STAGE,
};

/* Swiss is the one format both kinds of game can run, and the brackets above
   are all written in team names. For a game played one player to a seat, the
   same table has to be about players — a Swiss round between two five-man
   rosters is not what TFT is. Same records, same pairings, different names. */
const SOLO_NAMES = Object.fromEntries(
  DEMO_TEAMS.slice(0, 8).map((team, i) => [team, DEMO_PLAYERS[i]])
);

export function swissFor(game) {
  if (game.teamSize > 1) return SWISS;
  const rename = (n) => SOLO_NAMES[n] ?? n;
  return {
    ...SWISS,
    rows: SWISS.rows.map((r) => ({
      ...r,
      name: rename(r.name),
      opponents: r.opponents.map(rename),
    })),
  };
}

/* The formats a game offers, in the game's own order of preference — the
   default is whichever it lists first. Filtering the FORMATS list directly
   returns them in that list's order instead, which had TFT opening on Swiss
   rounds when lobbies are what TFT actually is. */
export function formatsFor(game) {
  return game.formats.map((id) => FORMATS.find((f) => f.id === id)).filter(Boolean);
}

// ---------------------------------------------------------------------------
// The entry boards and the solo pools.
//
// Deliberately not full. A board showing every slot taken says the thing is
// closed; one with a few left says it is running and there is room — and it is
// the only way to show both states of a row, taken and open, at once. The paid
// badge and the pool-built team are in here for the same reason: they are
// features of the board that an empty board never shows.
// ---------------------------------------------------------------------------
const BOARD_FILL = { 'low-elo': 6, 'high-elo': 9 };

export function demoBoard(tournament) {
  const count = BOARD_FILL[tournament.id] ?? Math.ceil(tournament.slots * 0.7);
  // High Elo starts further down the list so the two boards are not the same
  // six names side by side.
  const offset = tournament.id === 'high-elo' ? 3 : 0;

  return Array.from({ length: count }, (_, i) => {
    const seat = (offset + i) % DEMO_TEAMS.length;
    const last = i === count - 1;
    return {
      name: DEMO_TEAMS[seat],
      // Picked by the team's seat rather than by hashing its name: two names
      // hashing to the same player put one captain on two different teams.
      captainUsername: DEMO_PLAYERS[seat],
      paid: !last,          // one still to pay, so the badge means something
      fromPool: last,       // and the last one was assembled out of the pool
      tournament: tournament.id,
    };
  });
}

const POOL_LANES = ['top', 'jungle', 'mid', 'adc', 'support'];

/* Enough solo players to leave some lanes busy and one thin — the pool exists
   to answer "which lane is still going spare", and every lane evenly filled
   answers nothing. */
const POOL_SHAPE = {
  'low-elo': [2, 1, 3, 2, 0],
  'high-elo': [1, 2, 1, 3, 1],
};

export function demoPool(tournament) {
  const shape = POOL_SHAPE[tournament.id] ?? [1, 1, 1, 1, 1];
  const divisions = tournament.id === 'high-elo'
    ? ['Emerald II', 'Diamond IV', 'Emerald IV', 'Diamond II', 'Master']
    : ['Gold III', 'Platinum IV', 'Silver II', 'Platinum I', 'Gold I'];

  const out = [];
  let n = tournament.id === 'high-elo' ? 11 : 0;
  shape.forEach((count, lane) => {
    for (let i = 0; i < count; i += 1) {
      out.push({
        username: DEMO_PLAYERS[n % DEMO_PLAYERS.length],
        role: POOL_LANES[lane],
        division: divisions[n % divisions.length],
        tournament: tournament.id,
      });
      n += 1;
    }
  });
  return out;
}
