import { useEffect, useState } from 'react';
import { api } from '../api';
import SEO from '../Components/SEO';
import { TIERS, DIVISIONS, hasDivision, emblemUrl, onEmblemError, tierColor, rankLabel } from '../utils/ranks';

const post = (path, body) =>
  fetch(api(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

const QF_SLOTS = [
  ['QF1', 'A'], ['QF1', 'B'],
  ['QF2', 'A'], ['QF2', 'B'],
  ['QF3', 'A'], ['QF3', 'B'],
  ['QF4', 'A'], ['QF4', 'B'],
];

const LANES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

const card = 'rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-6 py-6 backdrop-blur-md';
const field = 'px-3 py-1.5 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-[12px] outline-none focus:border-[#DC143C]';
const heading = 'font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-4';

// Online-payment attempt status, straight from the Payment table.
const PAY_STATUS = {
  paid: ['Paid', 'text-[#4ade80] border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.1)]'],
  pending: ['Pending', 'text-[#f59e0b] border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.1)]'],
  failed: ['Failed', 'text-[#ef4444] border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.1)]'],
  expired: ['Expired', 'text-neutral-400 border-[rgba(102,0,0,0.4)] bg-black/40'],
};

function PayStatus({ status }) {
  if (!status) {
    return (
      <span className="font-slogan text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border text-neutral-600 border-[rgba(102,0,0,0.25)] bg-black/30">
        No attempt
      </span>
    );
  }
  const [label, cls] = PAY_STATUS[status] || [status, 'text-neutral-400 border-[rgba(102,0,0,0.4)] bg-black/40'];
  return (
    <span className={`font-slogan text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

export default function Admin() {
  const [regs, setRegs] = useState({ teams: [], individuals: [] });
  const [bracket, setBracket] = useState(null);
  const [seed, setSeed] = useState({}); // { QF1A: name, ... }
  const [scores, setScores] = useState({}); // { QF1: {a,b} }
  const [busy, setBusy] = useState('');
  const [rankings, setRankings] = useState([]);
  const [rankEdits, setRankEdits] = useState({}); // { id: points }
  const [newRank, setNewRank] = useState({ username: '', team: '', tier: '', division: '', points: '', riotId: '' });
  const [riotEdits, setRiotEdits] = useState({}); // { id: "Name#TAG" }
  const [move, setMove] = useState({}); // { memberId: { teamId, role } }

  const loadRegs = () =>
    fetch(api('/admin/registrations'), { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setRegs({ teams: d.teams || [], individuals: d.individuals || [] }))
      .catch(() => {});

  const loadBracket = () =>
    fetch(api('/tournament/bracket'), { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setBracket(d);
        const all = [...(d.quarterfinals || []), ...(d.semifinals || []), d.final].filter(Boolean);
        const s = {};
        all.forEach((m) => { s[m.id] = { a: m.scoreA ?? '', b: m.scoreB ?? '' }; });
        setScores(s);
      })
      .catch(() => {});

  const loadRankings = () =>
    fetch(api('/rankings'))
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setRankings(list);
        setRankEdits(list.reduce((acc, e) => ({ ...acc, [e.id]: e.points }), {}));
        setRiotEdits(
          list.reduce(
            (acc, e) => ({ ...acc, [e.id]: e.riotGameName ? `${e.riotGameName}#${e.riotTagLine}` : '' }),
            {}
          )
        );
      })
      .catch(() => {});

  useEffect(() => { loadRegs(); loadBracket(); loadRankings(); }, []);

  // Returns whether it saved, so the add-form only clears on success.
  // A rejected Riot ID has to be shown: silently keeping the old value would
  // look like the link took when it didn't.
  async function saveRanking(entry) {
    if (!entry.username?.trim()) return false;
    setBusy(`rank-${entry.username}`);
    try {
      const res = await post('/admin/ranking', { ...entry, username: entry.username.trim() });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message || 'Could not save that player.');
        return false;
      }
      return true;
    } finally {
      await loadRankings();
      setBusy('');
    }
  }

  async function removeRanking(id) {
    if (!confirm('Remove this player from the leaderboard?')) return;
    setBusy(`rank-del-${id}`);
    await fetch(api(`/admin/ranking/${id}`), { method: 'DELETE', credentials: 'include' });
    await loadRankings();
    setBusy('');
  }

  async function syncPlayers() {
    setBusy('rank-sync');
    await post('/admin/ranking/sync-players', {});
    await loadRankings();
    setBusy('');
  }

  async function refreshRanks() {
    setBusy('rank-refresh');
    try {
      const res = await post('/admin/ranking/refresh-ranks', {});
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        alert(`Ranks refreshed: ${data.updated} updated, ${data.skipped} skipped of ${data.scanned}.`);
      } else {
        alert(data?.message || 'Rank refresh failed.');
      }
    } finally {
      await loadRankings();
      setBusy('');
    }
  }

  async function addRanking() {
    const ok = await saveRanking({ ...newRank, points: Number(newRank.points) || 0 });
    if (ok) setNewRank({ username: '', team: '', tier: '', division: '', points: '', riotId: '' });
  }

  const teamNames = regs.teams.map((t) => t.name);

  async function togglePaid(kind, userId, paid) {
    setBusy(`pay-${userId}`);
    await post('/admin/payment/toggle', { kind, userId, paid: !paid });
    await loadRegs();
    setBusy('');
  }

  async function cancel(type, id) {
    if (!confirm('Cancel this registration?')) return;
    setBusy(`cancel-${id}`);
    await fetch(api(`/admin/registration/${type}/${id}`), { method: 'DELETE', credentials: 'include' });
    await loadRegs();
    setBusy('');
  }

  // Moves a rostered player to another team. The backend refuses a full roster
  // or an occupied lane and says which, so surface its message rather than a
  // generic failure — knowing *why* is the whole point here.
  async function movePlayer(m) {
    const to = move[m.id];
    if (!to?.teamId) return;
    setBusy(`move-${m.id}`);
    try {
      const res = await fetch(api(`/admin/team/member/${m.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ teamId: to.teamId, role: to.role || m.role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) alert(data?.message || 'Could not move that player.');
      else setMove((p) => ({ ...p, [m.id]: undefined }));
    } finally {
      await loadRegs();
      setBusy('');
    }
  }

  async function saveSeed() {
    const teams = QF_SLOTS.map(([code, slot]) => seed[`${code}${slot}`] || '');
    setBusy('seed');
    await post('/admin/bracket/seed', { teams });
    await loadBracket();
    setBusy('');
  }

  async function saveResult(code) {
    const s = scores[code] || {};
    setBusy(`res-${code}`);
    await post(`/admin/match/${code}/result`, { scoreA: s.a, scoreB: s.b });
    await loadBracket();
    setBusy('');
  }

  const allMatches = bracket
    ? [...bracket.quarterfinals, ...bracket.semifinals, bracket.final]
    : [];

  return (
    <div className="relative min-h-screen px-5 py-12">
      <SEO title="Admin" path="/admin" noindex />
      <div className="mx-auto max-w-4xl flex flex-col gap-6">
        <h1 className="font-heading text-white text-[40px] tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
          Admin Control
        </h1>

        {/* Teams */}
        <div className={card}>
          <p className={heading}>Registered Teams ({regs.teams.length})</p>
          {regs.teams.length === 0 ? (
            <p className="font-body text-[13px] text-neutral-500">No teams yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {regs.teams.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-black/30 border border-[rgba(102,0,0,0.25)]">
                  <span className="font-slogan text-[14px] font-bold text-white">{t.name}</span>
                  <PayStatus status={t.paymentStatus} />
                  <span className="font-slogan text-[11px] text-neutral-500">{t.captainUsername} · {t.captain?.email}</span>
                  <span className="font-slogan text-[10px] text-neutral-600">{t.members?.length ?? 0}/4 members</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => togglePaid('team', t.captainId, t.paid)}
                      disabled={busy === `pay-${t.captainId}`}
                      className={`font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors ${
                        t.paid
                          ? 'text-[#4ade80] border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.1)]'
                          : 'text-neutral-300 border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C]'
                      }`}
                    >
                      {t.paid ? 'Paid ✓' : 'Mark paid'}
                    </button>
                    <button
                      onClick={() => cancel('team', t.id)}
                      className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)]"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Roster. Captains can only touch their own team, so a
                      player switching sides would otherwise need both captains
                      to act in the right order — here it's one step. */}
                  {t.members?.length > 0 && (
                    <div className="w-full mt-1 flex flex-col gap-2 pl-4 border-l-2 border-[rgba(102,0,0,0.3)]">
                      {t.members.map((m) => (
                        <div key={m.id} className="flex flex-wrap items-center gap-2">
                          <span className="font-slogan text-[12px] text-neutral-300">{m.username}</span>
                          <span className="font-slogan text-[10px] font-bold uppercase tracking-wider text-[#DC143C]">
                            {m.role}
                          </span>
                          <div className="ml-auto flex flex-wrap items-center gap-2">
                            <select
                              value={move[m.id]?.teamId || ''}
                              onChange={(e) =>
                                setMove((p) => ({ ...p, [m.id]: { ...p[m.id], teamId: e.target.value } }))
                              }
                              className={`${field} w-44`}
                            >
                              <option value="">— move to team —</option>
                              {regs.teams
                                .filter((other) => other.id !== t.id)
                                .map((other) => (
                                  <option key={other.id} value={other.id}>{other.name}</option>
                                ))}
                            </select>
                            {/* Only needed when the destination has that lane
                                filled; otherwise the player keeps their own. */}
                            <select
                              value={move[m.id]?.role || m.role}
                              onChange={(e) =>
                                setMove((p) => ({ ...p, [m.id]: { ...p[m.id], role: e.target.value } }))
                              }
                              className={`${field} w-28`}
                            >
                              {LANES.map((lane) => <option key={lane} value={lane}>{lane}</option>)}
                            </select>
                            <button
                              onClick={() => movePlayer(m)}
                              disabled={!move[m.id]?.teamId || busy === `move-${m.id}`}
                              className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C] disabled:opacity-40"
                            >
                              {busy === `move-${m.id}` ? '…' : 'Move'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Individuals */}
        <div className={card}>
          <p className={heading}>Solo Players ({regs.individuals.length})</p>
          {regs.individuals.length === 0 ? (
            <p className="font-body text-[13px] text-neutral-500">No solo players yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {regs.individuals.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-black/30 border border-[rgba(102,0,0,0.25)]">
                  <span className="font-slogan text-[14px] font-bold text-white">{r.username}</span>
                  <PayStatus status={r.paymentStatus} />
                  <span className="font-slogan text-[11px] uppercase text-[#DC143C]">{String(r.role)}</span>
                  <span className="font-slogan text-[11px] text-neutral-500">{r.user?.email}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => togglePaid('individual', r.userId, r.paid)}
                      disabled={busy === `pay-${r.userId}`}
                      className={`font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors ${
                        r.paid
                          ? 'text-[#4ade80] border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.1)]'
                          : 'text-neutral-300 border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C]'
                      }`}
                    >
                      {r.paid ? 'Paid ✓' : 'Mark paid'}
                    </button>
                    <button
                      onClick={() => cancel('individual', r.id)}
                      className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Seed bracket */}
        <div className={card}>
          <p className={heading}>Seed the Quarterfinals</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['QF1', 'QF2', 'QF3', 'QF4'].map((code) => (
              <div key={code} className="rounded-lg bg-black/30 border border-[rgba(102,0,0,0.25)] p-3">
                <p className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2">{code}</p>
                {['A', 'B'].map((slot) => (
                  <select
                    key={slot}
                    value={seed[`${code}${slot}`] || ''}
                    onChange={(e) => setSeed((p) => ({ ...p, [`${code}${slot}`]: e.target.value }))}
                    className="w-full mb-2 px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none focus:border-[#DC143C]"
                  >
                    <option value="">— pick team —</option>
                    {teamNames.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={saveSeed}
            disabled={busy === 'seed'}
            className="mt-4 font-slogan text-[11px] font-bold uppercase tracking-[2px] px-5 py-2.5 rounded-lg text-white bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] bg-[length:300%_300%] animate-wind-flow-login"
          >
            {busy === 'seed' ? 'Saving…' : 'Save seeding (resets bracket)'}
          </button>
        </div>

        {/* Results */}
        <div className={card}>
          <p className={heading}>Enter Match Results</p>
          <div className="flex flex-col gap-2">
            {allMatches.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-black/30 border border-[rgba(102,0,0,0.25)]">
                <span className="font-slogan text-[10px] font-bold uppercase text-[#DC143C] w-14">{m.id}</span>
                <span className="font-slogan text-[13px] text-white flex-1 min-w-[140px] truncate">{m.teamA} <span className="text-neutral-600">vs</span> {m.teamB}</span>
                <input
                  type="number" min="0" value={scores[m.id]?.a ?? ''}
                  onChange={(e) => setScores((p) => ({ ...p, [m.id]: { ...p[m.id], a: e.target.value } }))}
                  className="w-14 px-2 py-1.5 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white text-center outline-none focus:border-[#DC143C]"
                />
                <span className="text-neutral-600">:</span>
                <input
                  type="number" min="0" value={scores[m.id]?.b ?? ''}
                  onChange={(e) => setScores((p) => ({ ...p, [m.id]: { ...p[m.id], b: e.target.value } }))}
                  className="w-14 px-2 py-1.5 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white text-center outline-none focus:border-[#DC143C]"
                />
                <button
                  onClick={() => saveResult(m.id)}
                  disabled={busy === `res-${m.id}`}
                  className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C]"
                >
                  {busy === `res-${m.id}` ? '…' : 'Save'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summoner Rankings — award points */}
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <p className={`${heading} mb-0`}>Summoner Rankings ({rankings.length})</p>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshRanks}
                disabled={busy === 'rank-refresh'}
                title="Pull every linked player's live rank from Riot onto the leaderboard (points are kept). Paced under the rate limit — may take a moment."
                className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C] disabled:opacity-50"
              >
                {busy === 'rank-refresh' ? 'Refreshing…' : 'Refresh ranks'}
              </button>
              <button
                onClick={syncPlayers}
                disabled={busy === 'rank-sync'}
                title="Add every registered captain and solo player to the leaderboard (points are kept)"
                className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C] disabled:opacity-50"
              >
                {busy === 'rank-sync' ? 'Syncing…' : 'Sync players'}
              </button>
            </div>
          </div>

          {/* Add a player */}
          <div className="flex flex-wrap items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-[rgba(220,20,60,0.06)] border border-[rgba(220,20,60,0.25)]">
            <input
              value={newRank.username}
              onChange={(e) => setNewRank((p) => ({ ...p, username: e.target.value }))}
              placeholder="Summoner name"
              className="flex-1 min-w-[150px] px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none focus:border-[#DC143C]"
            />
            <input
              value={newRank.team}
              onChange={(e) => setNewRank((p) => ({ ...p, team: e.target.value }))}
              placeholder="Team"
              className="w-36 px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none focus:border-[#DC143C]"
            />
            {/* Optional. With it, this player's rank tracks Riot from now on;
                without it the rank stays whatever is typed here. */}
            <input
              value={newRank.riotId}
              onChange={(e) => setNewRank((p) => ({ ...p, riotId: e.target.value }))}
              placeholder="Riot ID (Name#TAG)"
              title="Optional — link a Riot account so this player's rank updates automatically"
              className="w-44 px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none focus:border-[#DC143C]"
            />
            <select
              value={newRank.tier}
              onChange={(e) => setNewRank((p) => ({ ...p, tier: e.target.value, division: hasDivision(e.target.value) ? p.division : '' }))}
              className="w-36 px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none focus:border-[#DC143C]"
            >
              <option value="">— rank —</option>
              {TIERS.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </select>
            <select
              value={newRank.division}
              onChange={(e) => setNewRank((p) => ({ ...p, division: e.target.value }))}
              disabled={!hasDivision(newRank.tier) || !newRank.tier}
              className="w-20 px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none focus:border-[#DC143C] disabled:opacity-40"
            >
              <option value="">—</option>
              {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input
              type="number"
              value={newRank.points}
              onChange={(e) => setNewRank((p) => ({ ...p, points: e.target.value }))}
              placeholder="Pts"
              className="w-20 px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white text-center outline-none focus:border-[#DC143C]"
            />
            <button
              onClick={addRanking}
              disabled={!newRank.username.trim() || busy.startsWith('rank-')}
              className="font-slogan text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {rankings.length === 0 ? (
            <p className="font-body text-[13px] text-neutral-500">No players on the leaderboard yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {rankings.map((e, i) => (
                <div key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg bg-black/30 border border-[rgba(102,0,0,0.25)]">
                  <span className="font-heading text-[18px] leading-none w-6 text-neutral-400">{i + 1}</span>
                  {e.tier && (
                    <img
                      src={emblemUrl(e.tier)}
                      alt={e.tier}
                      onError={(ev) => onEmblemError(ev, e.tier)}
                      className="w-7 h-7 object-contain shrink-0"
                    />
                  )}
                  <span className="font-slogan text-[14px] font-bold text-white">{e.username}</span>
                  {e.team && <span className="font-slogan text-[11px] text-neutral-500">{e.team}</span>}
                  {e.tier && (
                    <span className={`font-slogan text-[11px] font-bold ${tierColor(e.tier)}`}>
                      {rankLabel(e.tier, e.division)}
                    </span>
                  )}
                  {/* Linked rows are swept alongside real accounts, so their
                      rank comes from Riot and typing it here is pointless.
                      Empty the field to unlink and go back to manual. */}
                  <span
                    className={`font-slogan text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      e.riotGameName
                        ? 'text-[#4ade80] border-[rgba(74,222,128,0.35)] bg-[rgba(74,222,128,0.08)]'
                        : 'text-neutral-600 border-[rgba(102,0,0,0.25)] bg-black/30'
                    }`}
                    title={e.riotGameName ? 'Rank tracks Riot automatically' : 'Manual entry — never updates on its own'}
                  >
                    {e.riotGameName ? 'Auto' : 'Manual'}
                  </span>

                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <input
                      value={riotEdits[e.id] ?? ''}
                      onChange={(ev) => setRiotEdits((p) => ({ ...p, [e.id]: ev.target.value }))}
                      placeholder="Riot ID"
                      title="Name#TAG — clear to unlink"
                      className="w-40 px-2 py-1.5 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-[12px] outline-none focus:border-[#DC143C]"
                    />
                    <input
                      type="number"
                      value={rankEdits[e.id] ?? e.points}
                      onChange={(ev) => setRankEdits((p) => ({ ...p, [e.id]: ev.target.value }))}
                      className="w-20 px-2 py-1.5 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white text-center outline-none focus:border-[#DC143C]"
                    />
                    <button
                      onClick={() => saveRanking({ username: e.username, team: e.team, tier: e.tier, division: e.division, points: Number(rankEdits[e.id]) || 0, riotId: riotEdits[e.id] ?? '' })}
                      disabled={busy === `rank-${e.username}`}
                      className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-white border border-[rgba(102,0,0,0.4)] bg-black/40 hover:border-[#DC143C]"
                    >
                      {busy === `rank-${e.username}` ? '…' : 'Save'}
                    </button>
                    <button
                      onClick={() => removeRanking(e.id)}
                      className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
