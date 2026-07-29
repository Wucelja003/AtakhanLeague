import { useEffect, useState } from 'react';

// Full-screen "crimson forge" intro shown once per session before the landing
// page. It's an overlay, not a route — the real page renders behind it the whole
// time, so nothing is hidden from crawlers and there's no extra navigation step.
const SESSION_KEY = 'atakhan:intro-seen';
const HOLD_MS = 2600; // animation plays for this long...
const FADE_MS = 550;  // ...then the overlay fades out over this long

const TITLE = 'ATAKHAN LEAGUE';

// Sparks drifting up off the forge. Fixed values (not random) so the layout is
// identical on every render.
const EMBERS = [
  { left: '16%', size: 3, delay: '0.1s',  duration: '2.7s' },
  { left: '27%', size: 2, delay: '0.9s',  duration: '3.1s' },
  { left: '38%', size: 4, delay: '0.45s', duration: '2.4s' },
  { left: '52%', size: 2, delay: '1.35s', duration: '2.9s' },
  { left: '64%', size: 3, delay: '0.7s',  duration: '2.6s' },
  { left: '76%', size: 2, delay: '0.25s', duration: '3.2s' },
  { left: '87%', size: 3, delay: '1.1s',  duration: '2.5s' },
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
      {/* Forge glow */}
      <div className="pointer-events-none absolute aspect-square w-[min(80vw,640px)] rounded-full bg-[radial-gradient(circle,rgba(220,20,60,0.3)_0%,rgba(139,0,0,0.16)_38%,transparent_68%)] blur-2xl animate-intro-orb" />

      {/* Embers */}
      {EMBERS.map((e) => (
        <span
          key={e.left}
          className="pointer-events-none absolute bottom-[32%] rounded-full bg-[#DC143C] shadow-[0_0_8px_rgba(220,20,60,0.9)] animate-intro-ember"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animationDelay: e.delay,
            animationDuration: e.duration,
          }}
        />
      ))}

      <div className="relative flex flex-col items-center px-6">
        {/* Logo + light sweep */}
        <div className="relative animate-intro-logo">
          <img
            src="/MainLogoAtakhan-2.svg"
            alt=""
            className="h-auto w-[clamp(110px,26vw,180px)] drop-shadow-[0_0_30px_rgba(220,20,60,0.55)]"
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] animate-intro-sweep" />
          </div>
        </div>

        {/* Wordmark, letter by letter */}
        <div className="mt-7 flex font-heading text-[clamp(28px,7vw,54px)] leading-none tracking-[0.14em] text-white [text-shadow:0_0_20px_rgba(139,0,0,0.9),0_0_46px_rgba(102,0,0,0.5)]">
          {TITLE.split('').map((char, i) => (
            <span
              key={`${char}-${i}`}
              className="animate-intro-letter"
              style={{ animationDelay: `${0.55 + i * 0.055}s` }}
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
