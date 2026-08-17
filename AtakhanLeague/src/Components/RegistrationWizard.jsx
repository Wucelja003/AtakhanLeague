import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../api';
import { LANES, LANE_META } from '../utils/pool';

// Registration as a short path rather than two forms side by side.
//
// The old version asked a signed-in player for their summoner name, their
// email and their rank — three things the site already knows, and the rank in
// particular was free text somebody had filled in as "Emerald 2 ( racunaj Dia
// posto nisam igrao toliko solo q )". Here it's read from Riot and shown, not
// typed, so it can't be invented; the only questions left are the ones that
// genuinely can't be answered for you.

const PATHS = [
  {
    key: 'team',
    title: 'Team Captain',
    blurb: 'You enter on behalf of five players and add the rest of your roster afterwards.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.36-1.86M17 20H7m10 0v-2c0-.66-.13-1.3-.36-1.86m0 0a5 5 0 00-9.28 0M7 20H2v-2a3 3 0 015.36-1.86M7 20v-2c0-.66.13-1.3.36-1.86m0 0a5 5 0 019.28 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    key: 'individual',
    title: 'Solo Player',
    blurb: 'You enter alone and get placed in the players pool to be picked up by a team.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
];

const STEPS = ['Entry', 'Details', 'Done'];

// "EMERALD" + "II" → "Emerald II". Master and above carry no division.
function rankLabel(entry) {
  if (!entry?.tier) return null;
  const tier = entry.tier.charAt(0) + entry.tier.slice(1).toLowerCase();
  return entry.rank ? `${tier} ${entry.rank}` : tier;
}

function Rail({ at }) {
  return (
    <div className="mx-auto mb-10 flex max-w-md items-center">
      {STEPS.map((label, i) => (
        <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
          <div className="flex flex-col items-center gap-2">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border font-slogan text-[12px] font-bold transition-all duration-300 ${
                i < at
                  ? 'border-[#DC143C] bg-[#DC143C] text-white'
                  : i === at
                    ? 'border-[#DC143C] bg-[rgba(220,20,60,0.15)] text-white shadow-[0_0_18px_rgba(220,20,60,0.45)]'
                    : 'border-[rgba(102,0,0,0.4)] bg-black/40 text-neutral-600'
              }`}
            >
              {i < at ? '✓' : i + 1}
            </span>
            <span
              className={`font-slogan text-[10px] font-bold uppercase tracking-[2px] transition-colors ${
                i <= at ? 'text-neutral-300' : 'text-neutral-600'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className="mx-2 -mt-5 h-[2px] flex-1 overflow-hidden rounded-full bg-[rgba(102,0,0,0.35)]">
              <span
                className="block h-full rounded-full bg-[#DC143C] transition-[width] duration-500"
                style={{ width: i < at ? '100%' : '0%' }}
              />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const CARD =
  'rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)]';

export default function RegistrationWizard() {
  const { currentUser } = useSelector((s) => s.user);
  const navigate = useNavigate();

  const [path, setPath] = useState(null);     // 'team' | 'individual'
  const [teamName, setTeamName] = useState('');
  const [lane, setLane] = useState('');
  const [rank, setRank] = useState({ state: 'loading', label: null });
  const [manualRank, setManualRank] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const step = done ? 2 : path ? 1 : 0;

  // The rank is fetched once the player has chosen a path — before that it
  // isn't needed, and this call reaches out to Riot.
  useEffect(() => {
    if (!path || rank.state !== 'loading') return;
    let alive = true;
    fetch(api('/riot/me'), { credentials: 'include' })
      // Rejecting on a bad response matters: falling through to null here
      // meant a failed call was reported as "unranked this season", which is a
      // claim about the player rather than about the request.
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`riot/me ${r.status}`))))
      .then((d) => {
        if (!alive) return;
        const label = rankLabel(d?.ranked?.solo) || rankLabel(d?.ranked?.flex);
        setRank(label ? { state: 'ok', label } : { state: 'unranked', label: null });
      })
      .catch(() => alive && setRank({ state: 'failed', label: null }));
    return () => { alive = false; };
  }, [path, rank.state]);

  // Riot is the source, but a player it can't place must still be able to
  // enter — an unreachable API is not their problem.
  const needsManualRank = rank.state === 'unranked' || rank.state === 'failed';
  const division = rank.label || manualRank.trim();
  const ready =
    Boolean(lane) && Boolean(division) && (path === 'team' ? teamName.trim().length > 1 : true);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!ready) return;
    setLoading(true);
    try {
      const res = await fetch(api(`/registration/${path}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // The server is sent rather than typed: the backend asks Riot which
        // region the account really lives on anyway, so a text field only ever
        // added a way to get it wrong.
        body: JSON.stringify({ teamName: teamName.trim(), division, role: lane, server: 'EUNE' }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || 'Registration failed.');
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className={`${CARD} px-10 py-10 animate-form-fade-in`}>
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(220,20,60,0.3)] bg-[rgba(220,20,60,0.12)]">
            <svg className="h-6 w-6 text-[#DC143C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mb-3 font-heading text-[28px] leading-none tracking-wide text-white [text-shadow:0_0_14px_rgba(139,0,0,0.6)]">
            Sign in to register
          </h3>
          <p className="mb-7 font-body text-[15px] leading-7 text-neutral-400">
            Registration is tied to your Atakhan League account — that's how your Riot rank is
            verified. Creating one takes a moment.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/sign-in')}
              className="btn-ripple relative overflow-hidden rounded-xl border-0 bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] bg-[length:300%_300%] px-7 py-3 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(220,20,60,0.6)]"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/sign-up')}
              className="rounded-xl border border-[rgba(102,0,0,0.4)] bg-black/40 px-7 py-3 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-neutral-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#660000] hover:text-white"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Rail at={step} />

      {/* ---------- STEP 3: done ---------- */}
      {done ? (
        <div className={`${CARD} px-8 py-10 text-center animate-form-fade-in sm:px-12`}>
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(74,222,128,0.4)] bg-[rgba(74,222,128,0.1)]">
            <svg className="h-8 w-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-heading text-[32px] leading-none tracking-wide text-white [text-shadow:0_0_18px_rgba(139,0,0,0.6)] sm:text-[40px]">
            You&apos;re in
          </h3>
          <p className="mx-auto mt-4 max-w-md font-body text-[15px] leading-7 text-neutral-400">
            {path === 'team'
              ? `${teamName.trim()} is registered. Add your four teammates from your profile, then pay the entry fee to confirm your slot.`
              : 'You are in the players pool. Pay the entry fee from your profile to confirm your slot.'}
          </p>

          <ol className="mx-auto mt-8 max-w-sm text-left">
            {[
              path === 'team' ? 'Add your four teammates' : 'Watch the players pool fill up',
              'Pay the entry fee',
              'Join the Discord for match pings',
            ].map((t, i) => (
              <li key={t} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-b-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(220,20,60,0.4)] font-slogan text-[11px] font-bold text-[#DC143C]">
                  {i + 1}
                </span>
                <span className="font-body text-[14px] text-neutral-300">{t}</span>
              </li>
            ))}
          </ol>

          <button
            onClick={() => navigate('/profile')}
            className="btn-ripple relative mt-8 overflow-hidden rounded-xl border-0 bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] bg-[length:300%_300%] px-8 py-3.5 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(220,20,60,0.6)]"
          >
            Go to my profile
          </button>
        </div>
      ) : !path ? (
        /* ---------- STEP 1: how are you entering ---------- */
        <div className="grid gap-5 sm:grid-cols-2">
          {PATHS.map((p, i) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPath(p.key)}
              style={{ animationDelay: `${0.05 + i * 0.1}s` }}
              className={`${CARD} group flex flex-col items-start gap-4 px-7 py-8 text-left animate-field-slide-in transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(220,20,60,0.55)] hover:shadow-[0_12px_40px_rgba(139,0,0,0.4)]`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(102,0,0,0.45)] bg-black/50 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-7 w-7 text-[#DC143C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  {p.icon}
                </svg>
              </span>
              <span>
                <span className="block font-heading text-[26px] leading-none tracking-wide text-white">
                  {p.title}
                </span>
                <span className="mt-2 block font-body text-[14px] leading-6 text-neutral-400">
                  {p.blurb}
                </span>
              </span>
              <span className="mt-auto inline-flex items-center gap-2 font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#cc3333] transition-colors group-hover:text-[#DC143C]">
                Choose
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        /* ---------- STEP 2: the two things we can't know ---------- */
        <form onSubmit={submit} noValidate className={`${CARD} px-6 py-8 animate-form-fade-in sm:px-10`}>
          <div className="mb-7 flex items-center justify-between gap-4">
            <h3 className="font-heading text-[26px] leading-none tracking-wide text-white sm:text-[30px]">
              {path === 'team' ? 'Team Captain' : 'Solo Player'}
            </h3>
            <button
              type="button"
              onClick={() => { setPath(null); setError(null); }}
              className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-neutral-500 transition-colors hover:text-[#DC143C]"
            >
              ← Change
            </button>
          </div>

          {/* What we already know.
              Deliberately not shaped like the inputs below — no boxes, a lock
              on the header and a tick on each row — because a bordered row with
              a label beside it reads as something waiting to be filled in. */}
          <div className="mb-7 rounded-xl border border-[rgba(74,222,128,0.22)] bg-[rgba(74,222,128,0.04)] px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <svg className="h-3.5 w-3.5 shrink-0 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="font-slogan text-[10px] font-bold uppercase tracking-[3px] text-[#4ade80]">
                Already taken from your account — don&apos;t type these
              </p>
            </div>

            <dl className="flex flex-col gap-2">
              {[
                { label: 'Summoner name', value: currentUser.username, note: 'Riot verified' },
                {
                  label: 'Rank',
                  value:
                    rank.state === 'ok' ? rank.label
                    : rank.state === 'loading' ? 'Reading from Riot…'
                    : rank.state === 'unranked' ? 'Unranked this season'
                    : 'Riot didn’t answer',
                  note: rank.state === 'ok' ? 'Live from Riot' : null,
                  muted: rank.state !== 'ok',
                },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline gap-2.5">
                  <svg className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <dt className="font-slogan text-[12px] uppercase tracking-wider text-neutral-500">
                    {row.label}
                  </dt>
                  <dd className={`ml-auto truncate text-right font-slogan text-[14px] font-bold ${row.muted ? 'text-neutral-400' : 'text-white'}`}>
                    {row.value}
                    {row.note && (
                      <span className="ml-2 font-slogan text-[10px] font-normal uppercase tracking-[1px] text-neutral-500">
                        {row.note}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* And the line that separates the two, so there is no doubt which
              half is yours to fill. */}
          <div className="mb-5 flex items-center gap-3">
            <span className="font-slogan text-[10px] font-bold uppercase tracking-[3px] text-[#DC143C]">
              Now your part
            </span>
            <span className="h-px flex-1 bg-[rgba(102,0,0,0.4)]" />
          </div>

          {/* Only asked when Riot couldn't supply it */}
          {needsManualRank && (
            <div className="mb-6">
              <label htmlFor="reg-rank" className="mb-2 block font-slogan text-[11px] uppercase tracking-wider text-neutral-300">
                Your division
              </label>
              <input
                id="reg-rank"
                value={manualRank}
                onChange={(e) => setManualRank(e.target.value)}
                placeholder="Emerald II"
                className="block w-full rounded-lg border border-[rgba(102,0,0,0.3)] bg-black/50 px-4 py-3 font-slogan text-sm text-white outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
              />
            </div>
          )}

          {path === 'team' && (
            <div className="mb-6">
              <label htmlFor="reg-team" className="mb-2 block font-slogan text-[11px] uppercase tracking-wider text-neutral-300">
                Team name
              </label>
              <div className="relative">
                <input
                  id="reg-team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Demacian Kings"
                  className={`block w-full rounded-lg border bg-black/50 px-4 py-3 pr-11 font-slogan text-sm text-white outline-none transition-all duration-300 placeholder:text-[#666] ${
                    teamName.trim().length > 1
                      ? 'border-[#2d6a2d] shadow-[0_0_8px_rgba(45,106,45,0.25)]'
                      : 'border-[rgba(102,0,0,0.3)] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]'
                  }`}
                />
                {teamName.trim().length > 1 && (
                  <svg className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Lane as five tiles rather than a dropdown: one click, and you can
              see all five at once. */}
          <div className="mb-7">
            <p className="mb-3 font-slogan text-[11px] uppercase tracking-wider text-neutral-300">
              {path === 'team' ? 'Your lane in the team' : 'Your lane'}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {LANES.map((key) => {
                const meta = LANE_META[key];
                const on = lane === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLane(key)}
                    aria-pressed={on}
                    className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition-all duration-300 ${
                      on
                        ? 'border-[#DC143C] bg-[rgba(220,20,60,0.12)] shadow-[0_0_20px_rgba(220,20,60,0.35)]'
                        : 'border-[rgba(102,0,0,0.3)] bg-black/40 hover:border-[rgba(220,20,60,0.5)]'
                    }`}
                  >
                    <img
                      src={meta.img}
                      alt=""
                      className={`h-7 w-7 object-contain transition-[filter] duration-300 ${on ? '' : 'grayscale'}`}
                    />
                    <span className={`font-slogan text-[10px] font-bold uppercase tracking-wider ${on ? 'text-white' : 'text-neutral-500'}`}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="mb-5 rounded-xl border border-[rgba(220,20,60,0.3)] bg-[rgba(220,20,60,0.08)] px-4 py-3 font-body text-sm text-[#DC143C]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!ready || loading}
            className="btn-ripple relative block w-full overflow-hidden rounded-xl border-0 bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] bg-[length:300%_300%] px-6 py-4 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(220,20,60,0.6)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Submitting…' : path === 'team' ? 'Register my team' : 'Enter the players pool'}
          </button>

          <p className="mt-4 text-center font-body text-[12px] text-neutral-600">
            EUNE only — checked against your Riot account, not typed.
          </p>
        </form>
      )}
    </div>
  );
}
