import { prisma } from '../db.js';

// The 8 fixed matches of an 8-team single-elimination bracket: 7 to find a
// champion, plus the third-place match between the two beaten semifinalists.
export const FIXED_MATCHES = [
  { code: 'QF1', round: 'quarterfinal', order: 1, time: '18:00' },
  { code: 'QF2', round: 'quarterfinal', order: 2, time: '18:00' },
  { code: 'QF3', round: 'quarterfinal', order: 3, time: '18:10' },
  { code: 'QF4', round: 'quarterfinal', order: 4, time: '18:20' },
  { code: 'SF1', round: 'semifinal', order: 1, time: '19:30' },
  { code: 'SF2', round: 'semifinal', order: 2, time: '19:30' },
  { code: 'TP', round: 'third', order: 1, time: '21:00' },
  { code: 'F', round: 'final', order: 1, time: '21:00' },
];

// Winner of `code` advances into `[nextCode, slot]`.
export const ADVANCE = {
  QF1: ['SF1', 'A'], QF2: ['SF1', 'B'],
  QF3: ['SF2', 'A'], QF4: ['SF2', 'B'],
  SF1: ['F', 'A'], SF2: ['F', 'B'],
};

// The other half of a semifinal result: whoever loses it plays for third.
export const DROPS = {
  SF1: ['TP', 'A'], SF2: ['TP', 'B'],
};

// Reverse of DROPS, for naming an empty third-place slot "Loser SF1".
export const DROP_FEEDERS = Object.entries(DROPS).reduce((acc, [from, [to, slot]]) => {
  (acc[to] ||= {})[slot] = from;
  return acc;
}, {});

// Reverse: which match feeds each slot → { SF1: { A:'QF1', B:'QF2' }, ... }
export const FEEDERS = Object.entries(ADVANCE).reduce((acc, [from, [to, slot]]) => {
  (acc[to] ||= {})[slot] = from;
  return acc;
}, {});

// Create the 7 rows if they don't exist yet (idempotent; never clobbers data).
export async function ensureBracket() {
  await Promise.all(
    FIXED_MATCHES.map((m) =>
      prisma.match.upsert({
        where: { code: m.code },
        update: {},
        create: m,
      })
    )
  );
}

const roundLabel = (m) =>
  m.round === 'quarterfinal' ? `Quarterfinal ${m.order}`
  : m.round === 'semifinal' ? `Semifinal ${m.order}`
  : m.round === 'third' ? 'Third Place'
  : 'Grand Final';

// Placeholder for an empty slot: "Winner QF1" where a winner feeds it,
// "Loser SF1" for the third-place match, "TBD" for an unseeded quarterfinal.
const slotName = (m, slot) => {
  const name = slot === 'A' ? m.teamAName : m.teamBName;
  if (name) return name;
  const won = FEEDERS[m.code]?.[slot];
  if (won) return `Winner ${won}`;
  const lost = DROP_FEEDERS[m.code]?.[slot];
  return lost ? `Loser ${lost}` : 'TBD';
};

const toCard = (m) => ({
  id: m.code,
  round: roundLabel(m),
  teamA: slotName(m, 'A'),
  teamB: slotName(m, 'B'),
  scoreA: m.scoreA,
  scoreB: m.scoreB,
  time: m.time,
});

// Group all matches into the shape Tournaments.jsx renders.
export function buildBracketResponse(matches) {
  const byCode = Object.fromEntries(matches.map((m) => [m.code, m]));
  const qf = ['QF1', 'QF2', 'QF3', 'QF4'].map((c) => toCard(byCode[c]));
  const sf = ['SF1', 'SF2'].map((c) => toCard(byCode[c]));
  const final = toCard(byCode['F']);
  // Guarded: a database seeded before this match existed would have no row
  // until ensureBracket next runs, and a missing card must not break the page.
  const thirdPlace = byCode['TP'] ? toCard(byCode['TP']) : null;
  return { quarterfinals: qf, semifinals: sf, thirdPlace, final };
}
