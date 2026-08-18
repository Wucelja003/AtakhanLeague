// ---------------------------------------------------------------------------
// EDIT HERE. The tournaments, in one place — the specification blocks, the
// team boards and the players pools all read this, so a date or a team count
// changed here changes everywhere at once.
//
// `image` is a file in AtakhanLeague/public/. The banner is a wide box and the
// image fills it by cropping, so a portrait source loses most of its height —
// `focus` says which part to keep (a CSS object-position). `rows` is the
// specification list; a row can carry `color` to pick its value out. `slots`
// is how many teams the bracket holds.
// ---------------------------------------------------------------------------
const TBA = 'TBA';

export const TOURNAMENTS = [
  {
    id: 'low-elo',
    image: '/LowEloTournament.webp',
    alt: 'Low Elo Tournament',
    // Landscape and almost exactly the banner's shape — nothing to choose.
    focus: 'center',
    label: 'Low Elo',
    slots: 8,
    divisions: 'Silver – Platinum',
    title: 'Hunt or be Hunted',
    accent: 'Tournament',
    pills: ['Date: October 10-11', '8 Teams', 'Round Robin'],
    rows: [
      { key: 'Date', val: 'October 10-11' },
      { key: 'Server', val: 'EUNE' },
      { key: 'Start', val: 'October 11' },
      { key: 'Number of Teams', val: '8' },
      { key: 'Format', val: 'Round Robin' },
      { key: 'Divisions', val:'Silver - Platinum' },
      { key: 'Registration Fee', val: '8e/player' },
      { key: '1st Place', val: '200e', color: 'text-[#DC143C]' },
      { key: '2nd Place', val: 'Legendary Skins' },
    ],
  },
  {
    id: 'high-elo',
    image: '/HighEloTournament.webp',
    alt: 'High Elo Tournament',
    // 736x1070: a portrait in a banner box. Side by side the column is
    // narrower and the banner shallower, so 53% of its height survives rather
    // than 41% — held high so the throne and the figure stay in frame.
    focus: 'center 25%',
    label: 'High Elo',
    slots: 12,
    divisions: 'Emerald – Low Master',
    title: 'The throne trembles',
    accent: 'Tournament',
    pills: ['Date: October 24-25 ', '12 Teams', 'Round Robin'],
    rows: [
      { key: 'Date', val: 'October 24-25' },
      { key: 'Server', val: 'EUNE' },
      { key: 'Start', val: 'October 24'},
      { key: 'Number of Teams', val: '12' },
      { key: 'Format', val: 'Round Robin' },
      { key: 'Divisions', val: 'Emerald – Low Master (max 200 LP)' },
      { key: 'Registration Fee', val: '9e/Player' },
      { key: '1st Place', val: '350e', color: 'text-[#DC143C]' },
      { key: '2nd Place', val: 'Legendary skins' },
    ],
  },
];

