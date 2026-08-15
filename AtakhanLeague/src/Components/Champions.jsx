import { useEffect, useState } from 'react';
import useReveal from '../utils/useReveal';
import { LANE_META } from '../utils/pool';
import { championIconUrl, DDRAGON_FALLBACK_VERSION, latestDataDragonVersion } from '../utils/ddragon';

// ---------------------------------------------------------------------------
// Season One — 15 August 2026. Written down rather than read from the bracket
// on purpose: the bracket is the *current* tournament and gets re-seeded for
// the next one, which would wipe this the moment that happens.
// ---------------------------------------------------------------------------
const CHAMPION = {
  team: 'Brotherhood of the 5',
  beat: 'AOS',
  score: '35 – 17',
  // `played` is the champion each player picked in the final. Add the name and
  // the portrait appears; leave it out and the row simply has none.
  roster: [
    { lane: 'top', name: 'Cacke', captain: true, played: 'Ambessa' },
    { lane: 'jungle', name: 'Vidzil', tag: 'jggap', played: 'Aatrox' },
    { lane: 'mid', name: 'flexA', tag: '6971', played: 'Viktor' },
    { lane: 'adc', name: 'KEINER SO WIE DU', tag: 'ZZZZZ', played: 'Lucian' },
    { lane: 'support', name: 'Paveleee', tag: 'CAR', played: 'Bard' },
  ],
};

const MVP = { name: 'Vidzil', tag: 'jggap', lane: 'jungle', team: 'Brotherhood of the 5', played: 'Aatrox' };

const PODIUM = [
  { place: '2nd', team: 'AOS', note: 'Runner-up · lost the Grand Final', color: '#DC143C' },
  { place: '3rd', team: 'Trinity Gaming Club', note: 'Won the third-place match', color: '#8B0000' },
];

const CRIMSON = '#DC143C';

function Player({ lane, name, tag, captain, played, version }) {
  const meta = LANE_META[lane];
  const icon = championIconUrl(played, version);
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[rgba(102,0,0,0.3)] bg-black/40 px-3 py-2.5">
      {icon && (
        <img
          src={icon}
          alt={played}
          title={played}
          loading="lazy"
          /* Hidden rather than left as a broken image if the name doesn't
             resolve to a Data Dragon file. */
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          className="h-8 w-8 shrink-0 rounded-md border border-[rgba(102,0,0,0.45)] object-cover"
        />
      )}
      {meta && <img src={meta.img} alt={meta.label} className="h-5 w-5 shrink-0 object-contain" />}
      <span className="min-w-0 flex-1 truncate font-slogan text-[13px] font-semibold tracking-wider text-white">
        {name}
        {tag && <span className="ml-1 text-neutral-500">#{tag}</span>}
      </span>
      {captain && (
        <span className="shrink-0 font-slogan text-[9px] font-bold uppercase tracking-[1px]" style={{ color: CRIMSON }}>
          Captain
        </span>
      )}
    </div>
  );
}

export default function Champions() {
  const { ref, shown, animate, at, fade, grow } = useReveal({ threshold: 0.15 });
  const [version, setVersion] = useState(DDRAGON_FALLBACK_VERSION);

  // Asked for only once the section is reached, and only if a portrait is
  // actually wanted — no request at all on a page nobody scrolls this far down.
  useEffect(() => {
    if (!shown) return;
    const wanted = CHAMPION.roster.some((p) => p.played) || Boolean(MVP.played);
    if (!wanted) return;
    let alive = true;
    latestDataDragonVersion().then((v) => alive && setVersion(v));
    return () => { alive = false; };
  }, [shown]);

  return (
    <section ref={ref} className="relative z-[2] mt-[80px] sm:mt-[100px] px-5 pb-16">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <div
            className={`mb-4 inline-flex items-center gap-3 ${fade('animate-reveal-up')}`}
            style={at(0.05)}
          >
            <span className="h-px w-8" style={{ background: CRIMSON }} />
            <span className="font-orbitron text-[11px] font-bold uppercase tracking-[4px]" style={{ color: CRIMSON }}>
              Season One · 15 August 2026
            </span>
            <span className="h-px w-8" style={{ background: CRIMSON }} />
          </div>

          <h2
            className={`font-heading text-[44px] leading-none tracking-wide text-transparent sm:text-[64px] bg-clip-text bg-[linear-gradient(180deg,#ff6b81_0%,#DC143C_45%,#660000_100%)] [filter:drop-shadow(0_0_26px_rgba(220,20,60,0.45))] ${fade(
              'animate-reveal-up'
            )}`}
            style={at(0.14)}
          >
            Champions
          </h2>

          <span
            className={`mx-auto mt-5 block h-[3px] w-[200px] origin-center rounded-full bg-[linear-gradient(90deg,transparent,#DC143C,transparent)] ${grow(
              'animate-reveal-sweep',
              'scale-x-0'
            )}`}
            style={at(0.26)}
          />
        </div>

        {/* Champion */}
        <div
          className={`relative overflow-hidden rounded-3xl border bg-[rgba(10,10,10,0.7)] px-6 py-9 backdrop-blur-md sm:px-10 sm:py-11 ${
            animate ? 'animate-trophy-glow' : ''
          } ${fade('animate-reveal-up')}`}
          style={{ borderColor: 'rgba(220,20,60,0.45)', ...at(0.34) }}
        >
          {shown && animate && (
            <span className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 bg-[linear-gradient(90deg,transparent,rgba(255,190,200,0.16),transparent)] animate-champion-sheen" />
          )}

          <div className="relative flex flex-col items-center text-center">
            {/* Crown */}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`h-11 w-11 sm:h-14 sm:w-14 ${animate ? 'animate-crown-float' : ''}`}
              style={{ color: CRIMSON, filter: 'drop-shadow(0 0 16px rgba(220,20,60,0.6))' }}
              fill="currentColor"
            >
              <path d="M5 19h14l1.5-10-4.5 3L12 5 8 12 3.5 9z" />
            </svg>

            <p className="mt-3 font-slogan text-[11px] font-bold uppercase tracking-[5px]" style={{ color: CRIMSON }}>
              Winner
            </p>

            <h3 className="mt-2 font-heading text-[34px] leading-none tracking-wide text-white sm:text-[52px] [text-shadow:0_0_24px_rgba(220,20,60,0.6),0_0_60px_rgba(139,0,0,0.35)]">
              {CHAMPION.team}
            </h3>

            <p className="mt-4 font-body text-[14px] text-neutral-400 sm:text-[15px]">
              Grand Final ·{' '}
              <span className="font-slogan font-bold tracking-wider text-white">{CHAMPION.score}</span> vs{' '}
              {CHAMPION.beat}
            </p>
          </div>

          {/* Winning roster */}
          <div className="relative mx-auto mt-8 grid max-w-3xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CHAMPION.roster.map((p) => (
              <Player key={p.name} {...p} version={version} />
            ))}
          </div>
        </div>

        {/* MVP + podium */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div
            className={`relative overflow-hidden rounded-2xl border bg-[rgba(10,10,10,0.65)] px-6 py-7 backdrop-blur-md ${fade(
              'animate-reveal-up'
            )}`}
            style={{ borderColor: 'rgba(102,0,0,0.4)', ...at(0.46) }}
          >
            <div className="flex items-center gap-4">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-black/50"
                style={{ borderColor: 'rgba(102,0,0,0.45)' }}
              >
                {championIconUrl(MVP.played, version) ? (
                  <img
                    src={championIconUrl(MVP.played, version)}
                    alt={MVP.played}
                    title={MVP.played}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  <img
                    src={LANE_META[MVP.lane].img}
                    alt={LANE_META[MVP.lane].label}
                    className="h-8 w-8 object-contain"
                  />
                )}
              </span>

              <div className="min-w-0">
                <p className="font-slogan text-[10px] font-bold uppercase tracking-[4px]" style={{ color: CRIMSON }}>
                  Most Valuable Player
                </p>
                <p className="mt-1 truncate font-heading text-[28px] leading-none tracking-wide text-white sm:text-[34px] [text-shadow:0_0_18px_rgba(220,20,60,0.45)]">
                  {MVP.name}
                  <span className="ml-1.5 font-slogan text-[14px] tracking-normal text-neutral-500">#{MVP.tag}</span>
                </p>
                <p className="mt-1.5 font-body text-[13px] text-neutral-400">
                  {LANE_META[MVP.lane].label} · {MVP.team}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {PODIUM.map((p, i) => (
              <div
                key={p.place}
                className={`flex items-center gap-4 rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)] px-5 py-4 backdrop-blur-md ${fade(
                  'animate-reveal-up'
                )}`}
                style={at(0.54 + i * 0.1)}
              >
                <span
                  className="font-heading text-[30px] leading-none"
                  style={{ color: p.color, textShadow: `0 0 16px ${p.color}55` }}
                >
                  {p.place}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-slogan text-[15px] font-bold tracking-wide text-white">
                    {p.team}
                  </span>
                  <span className="mt-0.5 block font-body text-[12px] text-neutral-500">{p.note}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
