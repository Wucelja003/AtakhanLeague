import { useEffect, useState } from 'react';

// Full-screen intro shown once per session before the landing page: a rose
// grows out of a crimson pool, something inside it charges until the rose is
// torn apart, and Atakhan rises out of the smoke.
//
// Beat sheet (seconds; the delays live in the --animate-intro-* vars in
// index.css, so change them there and mirror the totals here):
//   0.00  ground pool bleeds in
//   0.25  rose pushes up
//   1.05  charge — glow swells, rose trembles
//   1.70  burst — flash, shockwave, rose torn apart
//   1.80  Atakhan rises out of the smoke
//   2.70  wordmark lands letter by letter
//   3.90  overlay fades away
const SESSION_KEY = 'atakhan:intro-seen';
const HOLD_MS = 3900; // full sequence...
const FADE_MS = 600;  // ...then the overlay fades out over this long

const TITLE = 'ATAKHAN LEAGUE';
const LETTER_START_S = 2.7;
const LETTER_STAGGER_S = 0.04;

// Sparks thrown off by the burst. Fixed values (not random) so the layout is
// identical on every render; delays start after the rose blows apart.
const EMBERS = [
  { left: '22%', size: 3, delay: '1.85s', duration: '2.6s' },
  { left: '31%', size: 2, delay: '2.35s', duration: '3s' },
  { left: '40%', size: 4, delay: '1.95s', duration: '2.4s' },
  { left: '52%', size: 2, delay: '2.6s',  duration: '2.8s' },
  { left: '61%', size: 3, delay: '2.1s',  duration: '2.6s' },
  { left: '70%', size: 2, delay: '1.8s',  duration: '3.1s' },
  { left: '79%', size: 3, delay: '2.45s', duration: '2.5s' },
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

  useEffect(() => {
    if (phase !== 'playing') return;
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Not being able to remember it is not worth breaking the intro over.
    }
    const id = setTimeout(() => setPhase('leaving'), HOLD_MS);
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

          {/* Smoke it climbs out of */}
          <div className="absolute bottom-0 h-[130px] w-[min(72vw,440px)] rounded-[50%] bg-[radial-gradient(ellipse,rgba(18,4,6,0.95)_0%,rgba(18,4,6,0.5)_45%,transparent_72%)] blur-lg animate-intro-smoke" />

          {/* Atakhan. Rendered from the first frame (at opacity 0) so the
              browser has the whole run-up to fetch it — no pop-in at 1.8s. */}
          <img
            src="/mainDemon-removebg-preview.png"
            alt=""
            fetchPriority="high"
            className="absolute bottom-0 w-[min(66vw,380px)] drop-shadow-[0_0_44px_rgba(220,20,60,0.45)] animate-intro-demon"
          />

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
        <div className="mt-8 flex font-heading text-[clamp(28px,7vw,54px)] leading-none tracking-[0.14em] text-white [text-shadow:0_0_20px_rgba(139,0,0,0.9),0_0_46px_rgba(102,0,0,0.5)]">
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
