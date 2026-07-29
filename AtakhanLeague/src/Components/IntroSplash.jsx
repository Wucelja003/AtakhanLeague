import { Suspense, lazy, useEffect, useRef, useState } from 'react';

// three.js only ever loads for the intro, and only as a chunk of its own — the
// splash itself is pure CSS and never waits on it.
const IntroModel = lazy(() => import('./IntroModel'));

// Full-screen intro shown once per session before the landing page: a rose
// grows out of a crimson pool, something inside it charges until the rose is
// torn apart, and Atakhan rises out of the smoke.
//
// Beat sheet (seconds; the delays live in the --animate-intro-* vars in
// index.css, so change them there and mirror the totals here):
//   0.00  ground pool bleeds in
//   0.10  rose pushes up
//   0.55  charge — glow swells, rose trembles
//   1.00  burst — flash, shockwave, rose torn apart
//   ~1.0  Atakhan rises out of the smoke — the rigged spawn as soon as it's
//         loaded, or the flat image once we stop waiting for it
//   2.90  wordmark lands letter by letter
//   then  the overlay fades once the creature has finished
const SESSION_KEY = 'atakhan:intro-seen';
const FADE_MS = 600; // the overlay fades out over this long

// Earliest the creature can take over — the rose is torn apart here.
const BURST_MS = 1000;
// How long past that we'll keep waiting for the rigged model before settling
// for the flat image. Deciding on a fixed deadline made this a race the model
// lost whenever the main thread was busy, and losing it once meant the 3D
// version simply never appeared.
const MODEL_WAIT_MS = 1800;
// Breathing room after the creature lands, before the overlay leaves.
const TAIL_MS = 400;
// Roughly how long the flat fallback's own animation runs.
const FLAT_RUN_MS = 1600;
// Hard ceiling, so a pathological load can't leave the splash up indefinitely.
const MAX_HOLD_MS = 9000;
// The source clip runs 8.33s. Sampling the rig frame by frame: it climbs out of
// the ground until ~4.2s and rears up, drops, swings again at ~6.3s, and is
// motionless from ~7.0s on. So everything up to 6.9s is worth showing and the
// tail is dead air. Played at 1.4× — near enough to its authored speed to read
// as the animation it is.
const CLIP_START_S = 0;
const CLIP_END_S = 6.9;
const CLIP_RATE = 1.4;
// Turned to face the other way.
const MODEL_YAW_DEG = 180;
const MODEL_SRC = '/atakhan-spawn.glb';

const TITLE = 'ATAKHAN LEAGUE';
const LETTER_START_S = 2.9;
const LETTER_STAGGER_S = 0.04;

// Tendrils that climb out of the ground before the creature does. Each one
// draws itself from the ground point (100,140) upward.
const TENDRILS = [
  { d: 'M100,140 C97,116 93,88 95,54',      w: 4,   delay: '0.6s' },
  { d: 'M100,140 C96,114 88,98 76,76',      w: 3.5, delay: '0.62s' },
  { d: 'M100,140 C103,118 108,96 112,48',   w: 3,   delay: '0.66s' },
  { d: 'M100,140 C105,112 114,94 126,72',   w: 3,   delay: '0.68s' },
  { d: 'M100,140 C109,119 126,104 144,92',  w: 2.5, delay: '0.71s' },
  { d: 'M100,140 C92,120 76,106 58,94',     w: 2.5, delay: '0.73s' },
  { d: 'M100,140 C107,123 118,113 132,110', w: 2,   delay: '0.76s' },
  { d: 'M100,140 C94,122 84,112 70,108',    w: 2,   delay: '0.78s' },
];

// Sparks thrown off by the burst. Fixed values (not random) so the layout is
// identical on every render; delays start after the rose blows apart.
const EMBERS = [
  { left: '22%', size: 3, delay: '1.1s',  duration: '2.6s' },
  { left: '31%', size: 2, delay: '1.6s',  duration: '3s' },
  { left: '40%', size: 4, delay: '1.2s',  duration: '2.4s' },
  { left: '52%', size: 2, delay: '1.85s', duration: '2.8s' },
  { left: '61%', size: 3, delay: '1.35s', duration: '2.6s' },
  { left: '70%', size: 2, delay: '1.05s', duration: '3.1s' },
  { left: '79%', size: 3, delay: '1.7s',  duration: '2.5s' },
];

// Decided once, synchronously, so the splash can never flash in and back out.
function shouldPlay() {
  if (typeof window === 'undefined') return false;
  // The intro belongs to the landing experience — someone deep-linked to
  // /rankings or /profile shouldn't be held behind it.
  if (window.location.pathname !== '/') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  } catch {
    // Storage blocked (private mode). The component mounts once per page load
    // anyway, so playing it is still correct — it just won't be remembered.
    return true;
  }
}

export default function IntroSplash() {
  // playing → leaving → done. Each phase owns its own timer, so they can't overlap.
  const [phase, setPhase] = useState(() => (shouldPlay() ? 'playing' : 'done'));
  // null until decided; then true (rigged model) or false (flat image).
  const [use3D, setUse3D] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [burstPassed, setBurstPassed] = useState(false);

  // Start pulling the model down immediately, in parallel with the three.js
  // chunks. GLTFLoader can't ask for it until those have loaded and IntroModel
  // has mounted, and that serial wait is a big share of the one second before
  // the burst. This only warms the HTTP cache — the loader's own request then
  // hits it — so a failure here costs nothing but the fallback.
  useEffect(() => {
    if (phase !== 'playing') return;
    fetch(MODEL_SRC).catch(() => {});
  }, [phase]);

  // The creature can't appear before the rose is torn apart...
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setTimeout(() => setBurstPassed(true), BURST_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // ...and after that it's whichever comes first: the model finishing, or us
  // giving up on it. Waiting rather than judging on a deadline is the whole
  // point — the model only has to arrive, not arrive by a particular moment.
  useEffect(() => {
    if (phase !== 'playing' || use3D !== null) return;
    if (burstPassed && modelReady) setUse3D(true);
  }, [phase, use3D, burstPassed, modelReady]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setTimeout(
      () => setUse3D((chosen) => (chosen === null ? false : chosen)),
      BURST_MS + MODEL_WAIT_MS
    );
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Not being able to remember it is not worth breaking the intro over.
    }
  }, [phase]);

  // Timed from when the creature actually starts, not from mount — otherwise a
  // slow model would have its spawn cut off by a deadline set before anyone
  // knew how long the wait would be.
  useEffect(() => {
    if (phase !== 'playing' || use3D === null) return;
    const run = use3D ? (CLIP_END_S / CLIP_RATE) * 1000 : FLAT_RUN_MS;
    const id = setTimeout(() => setPhase('leaving'), run + TAIL_MS);
    return () => clearTimeout(id);
  }, [phase, use3D]);

  // Backstop, in case the creature never arrives at all.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setTimeout(() => setPhase('leaving'), MAX_HOLD_MS);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const id = setTimeout(() => setPhase('done'), FADE_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // Any click or key press skips straight to the site.
  useEffect(() => {
    if (phase !== 'playing') return;
    const skip = () => setPhase('leaving');
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [phase]);

  // Don't let the page scroll underneath the overlay.
  useEffect(() => {
    if (phase === 'done') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  if (phase === 'done') return null;

  const leaving = phase === 'leaving';

  return (
    // Decorative: the real headings live on the page behind this.
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[#050505] transition-opacity ease-out ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {/* Burst flash across the whole screen */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_62%,rgba(255,150,150,0.85)_0%,rgba(220,20,60,0.35)_28%,transparent_62%)] animate-intro-flash" />

      {/* Embers thrown off by the burst */}
      {EMBERS.map((e) => (
        <span
          key={e.left}
          className="pointer-events-none absolute bottom-[38%] rounded-full bg-[#DC143C] shadow-[0_0_8px_rgba(220,20,60,0.9)] animate-intro-ember"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animationDelay: e.delay,
            animationDuration: e.duration,
          }}
        />
      ))}

      <div className="relative flex w-full max-w-[900px] flex-col items-center px-6">
        {/* Stage — everything is anchored to the same ground line (bottom-0),
            so the demon rises from exactly where the rose was. Paint order is
            DOM order: glow behind, demon over it, rose on top. */}
        <div className="relative flex h-[min(46vh,340px)] w-full items-end justify-center">
          {/* Crimson pool on the ground */}
          <div className="absolute bottom-0 h-[90px] w-[min(88vw,600px)] rounded-[50%] bg-[radial-gradient(ellipse,rgba(220,20,60,0.38)_0%,rgba(139,0,0,0.16)_45%,transparent_72%)] blur-xl animate-intro-ground" />

          {/* Halo behind the creature */}
          <div className="absolute bottom-[34%] aspect-square w-[min(60vw,340px)] rounded-full bg-[radial-gradient(circle,rgba(220,20,60,0.42)_0%,rgba(139,0,0,0.18)_40%,transparent_70%)] blur-2xl animate-intro-halo" />

          {/* Tendrils breaking ground ahead of it. Kept dark crimson rather
              than true black so they read against the near-black backdrop. */}
          <div className="pointer-events-none absolute bottom-0 w-[min(64vw,380px)] origin-bottom animate-intro-tendrils-out">
            <svg viewBox="0 0 200 140" className="w-full drop-shadow-[0_0_10px_rgba(220,20,60,0.35)]">
              <defs>
                <linearGradient id="atk-tendril" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#a01528" />
                  <stop offset="55%" stopColor="#450b16" />
                  <stop offset="100%" stopColor="#17040a" />
                </linearGradient>
              </defs>
              {TENDRILS.map((t) => (
                <path
                  key={t.d}
                  d={t.d}
                  fill="none"
                  stroke="url(#atk-tendril)"
                  strokeWidth={t.w}
                  strokeLinecap="round"
                  className="animate-intro-tendril"
                  style={{ strokeDasharray: 320, animationDelay: t.delay }}
                />
              ))}
            </svg>
          </div>

          {/* Smoke it climbs out of */}
          <div className="absolute bottom-0 h-[130px] w-[min(72vw,440px)] rounded-[50%] bg-[radial-gradient(ellipse,rgba(18,4,6,0.95)_0%,rgba(18,4,6,0.5)_45%,transparent_72%)] blur-lg animate-intro-smoke" />

          {/* The rigged spawn. Mounted from the first frame but invisible, so
              it loads during the rose sequence; it only becomes visible once
              it's been chosen. */}
          <div
            className={`pointer-events-none absolute bottom-0 aspect-square w-[min(86vw,500px)] translate-y-[15%] transition-opacity duration-500 ${
              use3D ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Suspense fallback={null}>
              <IntroModel
                src={MODEL_SRC}
                playing={use3D === true}
                startAt={CLIP_START_S}
                endAt={CLIP_END_S}
                timeScale={CLIP_RATE}
                yawDeg={MODEL_YAW_DEG}
                onReady={() => setModelReady(true)}
                onFail={() => setModelReady(false)}
              />
            </Suspense>
          </div>

          {/* Flat fallback — mounted only if we gave up waiting for the model,
              so its animation runs from that moment instead of a fixed cue. */}
          {use3D === false && (
            <div className="absolute bottom-0 w-[min(66vw,380px)] origin-bottom animate-intro-demon">
              <img
                src="/mainDemon-removebg-preview.png"
                alt=""
                fetchPriority="high"
                className="w-full drop-shadow-[0_0_44px_rgba(220,20,60,0.45)]"
              />
              {/* Its crown catching light. Offset by half its own size instead of
                  a centring translate, which the scale animation would clobber. */}
              <div className="pointer-events-none absolute left-[25%] top-[25%] h-[24%] w-[24%] rounded-full bg-[radial-gradient(circle,rgba(255,70,70,0.75)_0%,rgba(220,20,60,0.3)_45%,transparent_72%)] opacity-0 blur-md animate-intro-crown-now" />
            </div>
          )}

          {/* The whirl circling it on the ground: a flat ring tilted into the
              floor plane, its arcs turning at different speeds. */}
          <div className="pointer-events-none absolute bottom-0 aspect-square w-[min(74vw,470px)] translate-y-1/2 [perspective:700px]">
            <div className="h-full w-full opacity-0 animate-intro-vortex-in">
              {/* Tilted well past 45° so the ring reads as lying on the floor
                  and stays clear of the wordmark below. */}
              <div className="h-full w-full [transform:rotateX(78deg)]">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[rgba(150,20,38,0.75)] border-r-[rgba(60,10,18,0.5)] animate-intro-spin-slow" />
                <div className="absolute inset-[13%] rounded-full border-2 border-transparent border-b-[rgba(190,26,50,0.6)] border-l-[rgba(45,8,14,0.45)] animate-intro-spin-fast" />
                <div
                  className="absolute inset-[26%] rounded-full border border-transparent border-t-[rgba(120,16,30,0.5)] animate-intro-spin-slow"
                  style={{ animationDelay: '-3s' }}
                />
              </div>
            </div>
          </div>

          {/* Smoke drifting in front of its feet, to seat it in the ground */}
          <div className="absolute -bottom-3 h-[80px] w-[min(60vw,360px)] rounded-[50%] bg-[radial-gradient(ellipse,rgba(12,3,4,0.9)_0%,transparent_70%)] blur-md animate-intro-smoke" />

          {/* Shockwave rings. The wrapper drops the box by half its height so
              the ring's centre sits on the ground line; the inner element owns
              the scale animation (one transform per element). */}
          <div className="pointer-events-none absolute bottom-0 aspect-square w-[min(86vw,580px)] translate-y-1/2">
            <div className="h-full w-full rounded-full border border-[rgba(220,20,60,0.6)] opacity-0 animate-intro-shock" />
          </div>
          <div className="pointer-events-none absolute bottom-0 aspect-square w-[min(86vw,580px)] translate-y-1/2">
            <div className="h-full w-full rounded-full border border-[rgba(255,255,255,0.22)] opacity-0 animate-intro-shock-late" />
          </div>

          {/* The rose — trembles, then is torn apart */}
          <div className="absolute bottom-0 animate-intro-tremble">
            <div className="animate-intro-burst">
              <div className="relative animate-intro-rose">
                <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(220,20,60,0.6)_0%,rgba(139,0,0,0.22)_40%,transparent_70%)] blur-lg animate-intro-charge" />
                <img
                  src="/MainLogoAtakhan-2.svg"
                  alt=""
                  className="relative w-[clamp(60px,13vw,96px)] drop-shadow-[0_0_20px_rgba(220,20,60,0.75)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wordmark, letter by letter */}
        <div className="mt-16 flex font-heading text-[clamp(28px,7vw,54px)] leading-none tracking-[0.14em] text-white [text-shadow:0_0_20px_rgba(139,0,0,0.9),0_0_46px_rgba(102,0,0,0.5)]">
          {TITLE.split('').map((char, i) => (
            <span
              key={`${char}-${i}`}
              className="animate-intro-letter"
              style={{ animationDelay: `${LETTER_START_S + i * LETTER_STAGGER_S}s` }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </div>

        {/* Crimson rule */}
        <div className="mt-5 h-px w-[min(70vw,320px)] bg-[linear-gradient(90deg,transparent,#DC143C,transparent)] animate-intro-line" />
      </div>

      <span className="pointer-events-none absolute bottom-8 font-slogan text-[10px] font-bold uppercase tracking-[3px] text-neutral-600">
        Click to skip
      </span>
    </div>
  );
}
