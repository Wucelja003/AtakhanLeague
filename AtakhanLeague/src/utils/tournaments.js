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
// Three flags carry the whole site's state. Each is read in several places, so
// a season opening or closing is an edit here and nowhere else.
//
//   CANCELLED          — the October run was called off. Off again now: the
//                        site shows the format it runs rather than a notice.
//   DATES_ANNOUNCED    — whether there is a date and a fee to publish yet.
//                        While false, the hero shows no clock and every date
//                        and price reads TBA, because inventing either is worse
//                        than admitting it is not decided.
//   REGISTRATION_OPEN  — whether anyone can enter. Stays shut until there is
//                        something real to enter and a backend to take it; the
//                        API endpoints enforce the same flag independently.
// ---------------------------------------------------------------------------
export const CANCELLED = false;
export const DATES_ANNOUNCED = false;
export const REGISTRATION_OPEN = false;

// Shown wherever the cancellation needs a sentence rather than a badge.
// Deliberately says nothing about refunds — that is the organiser's call to
// word, not this file's to assume.
export const CANCELLED_NOTE =
  'Both October tournaments have been cancelled and registration is closed. Thanks to everyone who signed up — if you were registered, get in touch and we will sort it out with you.';

// What stands in for a date or a fee while DATES_ANNOUNCED is false.
export const PENDING_NOTE =
  'The format below is the one we run. Dates, entry fees and the draw are announced before each season opens — registration stays closed until then.';

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

// ---------------------------------------------------------------------------
// What the specification blocks actually render.
//
// While a season has no confirmed date, the rows that commit to something —
// when it runs, what it costs, what it pays — read TBA instead of last
// season's numbers. The rows that describe the format are untouched, because
// those are true whether or not a date exists, and they are the half worth
// showing. Inventing a date or leaving a stale one is worse than saying it is
// not decided.
// ---------------------------------------------------------------------------
const PENDING_KEYS = ['Date', 'Start', 'Registration Fee', '1st Place', '2nd Place'];

export function specRows(tournament) {
  if (DATES_ANNOUNCED) return tournament.rows;
  return tournament.rows.map((row) =>
    PENDING_KEYS.includes(row.key) ? { ...row, val: TBA, color: undefined } : row
  );
}

// The pills on the banner: the date one goes while there is no date.
export function pillsFor(tournament) {
  if (DATES_ANNOUNCED) return tournament.pills;
  return ['Dates TBA', ...tournament.pills.filter((p) => !/date/i.test(p))];
}

