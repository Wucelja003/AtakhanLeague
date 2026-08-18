// Group standings, and the round-robin fixtures that feed them.
//
// Four teams playing three Bo1 games each can only finish 3-0, 2-1, 1-2 or 0-3,
// so ties aren't the exception — they're most of the table. A Bo1 has no game
// difference to separate them either, which is why kills are recorded from the
// first match rather than only once a tie shows up.
//
// The order, once teams are level on wins:
//
//   1. wins
//   2. the mini-table between the tied teams only — wins, then kill difference
//      in those games. This is what "head to head" means when three teams are
//      level, and it can't help across groups, where they never met.
//   3. kill difference across the whole group
//   4. kills scored
//   5. name, so the order is at least stable rather than arbitrary
//
// Every comparison is decided on entered results alone: a table that changes
// between two reads of the same data would be worse than one that ties.

// Round-robin fixtures for n teams by index, in a rotation that spreads each
// team's games out instead of giving one team all of theirs first.
export function roundRobinPairs(n) {
  const pairs = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) pairs.push([i, j]);
  }
  // Sort by the later team, then the earlier: for four teams this gives
  // 0-1, 0-2, 1-2, 0-3, 1-3, 2-3 — no team plays twice in a row.
  return pairs.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

const played = (m) => m.winnerName != null && m.killsA != null && m.killsB != null;

// One row per team, from the matches actually finished.
function tally(teamNames, matches) {
  const rows = new Map(
    teamNames.map((name) => [
      name,
      { team: name, played: 0, wins: 0, losses: 0, killsFor: 0, killsAgainst: 0 },
    ])
  );

  for (const m of matches) {
    if (!played(m)) continue;
    const a = rows.get(m.teamAName);
    const b = rows.get(m.teamBName);
    if (!a || !b) continue; // a result for a team no longer in the group

    a.played += 1; b.played += 1;
    a.killsFor += m.killsA; a.killsAgainst += m.killsB;
    b.killsFor += m.killsB; b.killsAgainst += m.killsA;

    if (m.winnerName === m.teamAName) { a.wins += 1; b.losses += 1; }
    else if (m.winnerName === m.teamBName) { b.wins += 1; a.losses += 1; }
  }

  for (const row of rows.values()) row.killDiff = row.killsFor - row.killsAgainst;
  return rows;
}

// Wins and kill difference counted only in the games among a given set of teams.
function miniTable(names, matches) {
  const set = new Set(names);
  const mini = new Map(names.map((n) => [n, { wins: 0, killDiff: 0 }]));

  for (const m of matches) {
    if (!played(m)) continue;
    if (!set.has(m.teamAName) || !set.has(m.teamBName)) continue;
    mini.get(m.teamAName).killDiff += m.killsA - m.killsB;
    mini.get(m.teamBName).killDiff += m.killsB - m.killsA;
    if (m.winnerName === m.teamAName) mini.get(m.teamAName).wins += 1;
    else if (m.winnerName === m.teamBName) mini.get(m.teamBName).wins += 1;
  }
  return mini;
}

export function standings(teamNames, matches = []) {
  const rows = [...tally(teamNames, matches).values()];

  // Group by wins first, then order within each block by the mini-table. Doing
  // it in blocks is what makes three-way ties work: the head-to-head sub-table
  // is only meaningful among teams that are actually level.
  const byWins = new Map();
  for (const row of rows) {
    if (!byWins.has(row.wins)) byWins.set(row.wins, []);
    byWins.get(row.wins).push(row);
  }

  const ordered = [];
  for (const wins of [...byWins.keys()].sort((a, b) => b - a)) {
    const block = byWins.get(wins);
    if (block.length === 1) { ordered.push(block[0]); continue; }

    const mini = miniTable(block.map((r) => r.team), matches);
    block.sort((x, y) => {
      const mx = mini.get(x.team);
      const my = mini.get(y.team);
      return (
        my.wins - mx.wins ||
        my.killDiff - mx.killDiff ||
        y.killDiff - x.killDiff ||
        y.killsFor - x.killsFor ||
        x.team.localeCompare(y.team)
      );
    });
    ordered.push(...block);
  }

  return ordered.map((row, i) => ({ ...row, position: i + 1 }));
}

// Snake draw: strongest into the first group, then back along the row, so no
// group collects all the top seeds. Teams arrive already ordered strongest first.
export function snakeDraw(teams, groupCount) {
  const groups = Array.from({ length: groupCount }, () => []);
  teams.forEach((team, i) => {
    const row = Math.floor(i / groupCount);
    const col = i % groupCount;
    groups[row % 2 === 0 ? col : groupCount - 1 - col].push(team);
  });
  return groups;
}

// Third-placed teams across groups, best first — the two that fill out an
// eight-team bracket in the 12-team format. They never met, so the mini-table
// can't apply: wins, then kill difference, then kills.
export function rankThirds(tables) {
  return tables
    .map((t) => t.rows.find((r) => r.position === 3))
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.wins - a.wins || b.killDiff - a.killDiff || b.killsFor - a.killsFor || a.team.localeCompare(b.team)
    );
}
