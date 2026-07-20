import { prisma } from '../db.js';

// The 7 fixed matches of an 8-team single-elimination bracket.
export const FIXED_MATCHES = [
  { code: 'QF1', round: 'quarterfinal', order: 1, time: '18:00' },
  { code: 'QF2', round: 'quarterfinal', order: 2, time: '18:00' },
  { code: 'QF3', round: 'quarterfinal', order: 3, time: '18:20' },
  { code: 'QF4', round: 'quarterfinal', order: 4, time: '18:20' },
  { code: 'SF1', round: 'semifinal', order: 1, time: '20:00' },
  { code: 'SF2', round: 'semifinal', order: 2, time: '20:00' },
  { code: 'F', round: 'final', order: 1, time: '22:00' },
];

// Winner of `code` advances into `[nextCode, slot]`.
export const ADVANCE = {
  QF1: ['SF1', 'A'], QF2: ['SF1', 'B'],
  QF3: ['SF2', 'A'], QF4: ['SF2', 'B'],
  SF1: ['F', 'A'], SF2: ['F', 'B'],
};

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
  : 'Grand Final';

// Placeholder for an empty slot: "Winner QF1" (fed) or "TBD" (unseeded QF).
const slotName = (m, slot) => {
  const name = slot === 'A' ? m.teamAName : m.teamBName;
  if (name) return name;
  const feeder = FEEDERS[m.code]?.[slot];
  return feeder ? `Winner ${feeder}` : 'TBD';
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
  return { quarterfinals: qf, semifinals: sf, final };
}
