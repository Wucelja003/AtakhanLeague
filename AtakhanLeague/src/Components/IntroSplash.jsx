import { useEffect, useState } from 'react';
import SpawnScene, { CLIP_END_S } from './SpawnScene';

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

// Breathing room after the creature lands, before the overlay leaves.
const TAIL_MS = 400;
// Roughly how long the flat fallback's own animation runs.
const FLAT_RUN_MS = 1600;
// Hard ceiling, so a pathological load can't leave the splash up indefinitely.
const MAX_HOLD_MS = 9000;
// Playback rate for the spawn here — fast enough to fit between the burst and
// the fade without reading as rushed.
const CLIP_RATE = 1.4;

const TITLE = 'ATAKHAN LEAGUE';
const LETTER_START_S = 2.9;
const LETTER_STAGGER_S = 0.04;

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
        <div className="relative flex h-[min(46vh,340px)] w-[min(84vw,400px)] items-end justify-center">
          <SpawnScene clipRate={CLIP_RATE} onDecided={setUse3D} />
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
