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

// ---------------------------------------------------------------------------
// Both October tournaments are cancelled and registration is shut. One flag for
// the whole site: the hero, the specification blocks, the Tournaments page and
// the registration form all read it, so turning it back on is one edit here.
//
// The tournaments themselves stay in the list rather than being deleted — a
// cancelled tournament still has to say what it was, and an empty list would
// leave the pages with nothing to render.
// ---------------------------------------------------------------------------
export const CANCELLED = true;
export const REGISTRATION_OPEN = false;

// Shown wherever the cancellation needs a sentence rather than a badge.
// Deliberately says nothing about refunds — that is the organiser's call to
// word, not this file's to assume.
export const CANCELLED_NOTE =
  'Both October tournaments have been cancelled and registration is closed. Thanks to everyone who signed up — if you were registered, get in touch and we will sort it out with you.';

export const TOURNAMENTS = [
  {
    id: 'low-elo',
    image: '/LowEloTournament.webp',
    alt: 'Low Elo Tournament',
    // Landscape and almost exactly the banner's shape — nothing to choose.
    focus: 'center',
    label: 'Low Elo',
    slots: 8,
    // Group stage: two groups of four, top two from each into the semifinals.
    groups: { count: 2, size: 4, advance: 2, extraThirds: 0 },
    // The countdown needs a real instant, not "October 10-11". First day of the
    // window at 18:00 CEST, the hour the last tournament started at.
    startsAt: '2026-10-10T18:00:00+02:00',
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
      { key: 'Registration Fee', val: '7 € / player' },
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
    // Three groups of four. Top two from each is six, so the two best
    // third-placed teams come along to make a clean eight for the quarterfinals.
    groups: { count: 3, size: 4, advance: 2, extraThirds: 2 },
    startsAt: '2026-10-24T18:00:00+02:00',
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
      { key: 'Registration Fee', val: '8 € / player' },
      { key: '1st Place', val: '350e', color: 'text-[#DC143C]' },
      { key: '2nd Place', val: 'Legendary skins' },
    ],
  },
];

