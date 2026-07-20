import { useEffect, useState } from 'react';
import { api } from '../api';
import SEO from '../Components/SEO';

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

const card = 'rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-6 py-6 backdrop-blur-md';
const heading = 'font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-4';

export default function Admin() {
  const [regs, setRegs] = useState({ teams: [], individuals: [] });
  const [bracket, setBracket] = useState(null);
  const [seed, setSeed] = useState({}); // { QF1A: name, ... }
  const [scores, setScores] = useState({}); // { QF1: {a,b} }
  const [busy, setBusy] = useState('');

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

  useEffect(() => { loadRegs(); loadBracket(); }, []);

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
      </div>
    </div>
  );
}
