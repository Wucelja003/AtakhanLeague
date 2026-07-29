import { Suspense, lazy, useEffect, useState } from 'react';

// The rose → burst → Atakhan staging, shared by the intro splash and the
// Introduce section. Everything is sized as a percentage of this component's
// own box (never in vw) so the same scene works full-screen and inside a
// 380px slot, and everything is anchored to the same ground line at the bottom
// so the creature rises from exactly where the rose stood.
const IntroModel = lazy(() => import('./IntroModel'));

export const MODEL_SRC = '/atakhan-spawn.glb';
// The source clip runs 8.33s: the creature climbs out of the ground until
// ~4.2s and rears up, drops, then swings again at ~6.3s. Measuring the
// keyframes, the tail past ~7.0s carries about 4% of the spawn's motion per
// second — the landing settling rather than an idle worth keeping — so it's
// cut here.
export const CLIP_END_S = 6.9;
// Face-on, which suits the spawn's landing. The idle folds its four arms in
// much closer, so that pose wants turning further — see IDLE_YAW_DEG below.
export const MODEL_YAW_DEG = 180;
// Measured rather than eyeballed: sampling the idle's hand and elbow bones
// across the loop, dead-on leaves the four arms overlapping to within a
// fraction of a unit on screen. Turning to 230° opens the silhouette by about
// a sixth and pulls the closest pair apart by an order of magnitude.
export const IDLE_YAW_DEG = 230;
// Second clip in the same GLB, on the same skeleton — the creature standing
// there breathing once the spawn has played through.
export const IDLE_CLIP = 'Idle';

// Earliest the creature can take over — the rose is torn apart here. Matches
// the burst delays baked into the --animate-intro-* vars in index.css.
export const BURST_MS = 1000;
// How long past that to keep waiting for the rigged model before settling for
// the flat image. Deciding on a fixed deadline made this a race the model kept
// losing, and losing it meant the 3D version never appeared at all.
export const MODEL_WAIT_MS = 1800;

// Tendrils that climb out of the ground ahead of the creature. Each draws
// itself upward from the ground point (100,140).
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

let gradientSeq = 0;

export default function SpawnScene({
  clipRate = 1.4,
  clipEnd = CLIP_END_S,
  idleClip,
  yawDeg = MODEL_YAW_DEG,
  onDecided,
}) {
  // Each instance needs its own gradient id — two scenes on one page sharing
  // one id would both resolve to whichever was defined first.
  const [gradientId] = useState(() => `atk-tendril-${++gradientSeq}`);
  const [use3D, setUse3D] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [burstPassed, setBurstPassed] = useState(false);

  // Pull the model down at once, in parallel with the three.js chunks —
  // GLTFLoader can't ask for it until those have loaded and this has mounted.
  // Only warms the HTTP cache, so a failure costs nothing but the fallback.
  useEffect(() => {
    fetch(MODEL_SRC).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setBurstPassed(true), BURST_MS);
    return () => clearTimeout(id);
  }, []);

  // The creature takes over the moment the model is ready any time after the
  // burst — it only has to arrive, not arrive by a particular moment.
  useEffect(() => {
    if (use3D !== null) return;
    if (burstPassed && modelReady) setUse3D(true);
  }, [use3D, burstPassed, modelReady]);

  useEffect(() => {
    const id = setTimeout(
      () => setUse3D((chosen) => (chosen === null ? false : chosen)),
      BURST_MS + MODEL_WAIT_MS
    );
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (use3D !== null) onDecided?.(use3D);
  }, [use3D, onDecided]);

  return (
    // Paint order is DOM order: glow behind, creature over it, rose on top.
    <div className="relative flex h-full w-full items-end justify-center">
      {/* Crimson pool on the ground */}
      <div className="pointer-events-none absolute bottom-0 h-[26%] w-[150%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(220,20,60,0.38)_0%,rgba(139,0,0,0.16)_45%,transparent_72%)] blur-xl animate-intro-ground" />

      {/* Halo behind the creature */}
      <div className="pointer-events-none absolute bottom-[34%] aspect-square w-[85%] rounded-full bg-[radial-gradient(circle,rgba(220,20,60,0.42)_0%,rgba(139,0,0,0.18)_40%,transparent_70%)] blur-2xl animate-intro-halo" />

      {/* Tendrils breaking ground ahead of it. Dark crimson rather than true
          black, or they'd be invisible against the near-black backdrop. */}
      <div className="pointer-events-none absolute bottom-0 w-[95%] origin-bottom animate-intro-tendrils-out">
        <svg viewBox="0 0 200 140" className="w-full drop-shadow-[0_0_10px_rgba(220,20,60,0.35)]">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
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
              stroke={`url(#${gradientId})`}
              strokeWidth={t.w}
              strokeLinecap="round"
              className="animate-intro-tendril"
              style={{ strokeDasharray: 320, animationDelay: t.delay }}
            />
          ))}
        </svg>
      </div>

      {/* Smoke it climbs out of */}
      <div className="pointer-events-none absolute bottom-0 h-[38%] w-[110%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(18,4,6,0.95)_0%,rgba(18,4,6,0.5)_45%,transparent_72%)] blur-lg animate-intro-smoke" />

      {/* The rigged spawn. Mounted from the first frame but invisible, so it
          loads during the rose sequence; it only shows once it's been chosen. */}
      <div
        className={`pointer-events-none absolute bottom-0 aspect-square w-[125%] translate-y-[15%] transition-opacity duration-500 ${
          use3D ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Suspense fallback={null}>
          <IntroModel
            src={MODEL_SRC}
            playing={use3D === true}
            endAt={clipEnd}
            idleClip={idleClip}
            timeScale={clipRate}
            yawDeg={yawDeg}
            onReady={() => setModelReady(true)}
            onFail={() => setModelReady(false)}
          />
        </Suspense>
      </div>

      {/* Flat fallback — mounted only if we gave up waiting, so its animation
          runs from that moment rather than a fixed cue that would have fired
          mid-wait. */}
      {use3D === false && (
        <div className="pointer-events-none absolute bottom-0 w-[95%] origin-bottom animate-intro-demon">
          <img
            src="/mainDemon-removebg-preview.png"
            alt=""
            fetchPriority="high"
            className="w-full drop-shadow-[0_0_44px_rgba(220,20,60,0.45)]"
          />
          {/* Its crown catching light. Offset by half its own size instead of a
              centring translate, which the scale animation would clobber. */}
          <div className="pointer-events-none absolute left-[25%] top-[25%] h-[24%] w-[24%] rounded-full bg-[radial-gradient(circle,rgba(255,70,70,0.75)_0%,rgba(220,20,60,0.3)_45%,transparent_72%)] opacity-0 blur-md animate-intro-crown-now" />
        </div>
      )}

      {/* Smoke drifting in front of its feet, to seat it in the ground */}
      <div className="pointer-events-none absolute -bottom-[3%] h-[24%] w-[90%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(12,3,4,0.9)_0%,transparent_70%)] blur-md animate-intro-smoke" />

      {/* Shockwave rings. The wrapper drops the box by half its height so the
          ring's centre sits on the ground line; the inner element owns the
          scale animation (one transform per element). */}
      <div className="pointer-events-none absolute bottom-0 aspect-square w-[145%] translate-y-1/2">
        <div className="h-full w-full rounded-full border border-[rgba(220,20,60,0.6)] opacity-0 animate-intro-shock" />
      </div>
      <div className="pointer-events-none absolute bottom-0 aspect-square w-[145%] translate-y-1/2">
        <div className="h-full w-full rounded-full border border-[rgba(255,255,255,0.22)] opacity-0 animate-intro-shock-late" />
      </div>

      {/* The rose — grows, charges, trembles, then is torn apart */}
      {/* Centring lives on its own wrapper: tremble, burst and rose each own a
          transform, and stacking another on any of them would clobber it. */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-[26%] min-w-[52px] -translate-x-1/2">
        <div className="animate-intro-tremble">
          <div className="animate-intro-burst">
            <div className="relative animate-intro-rose">
              <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(220,20,60,0.6)_0%,rgba(139,0,0,0.22)_40%,transparent_70%)] blur-lg animate-intro-charge" />
              <img
                src="/MainLogoAtakhan-2.svg"
                alt=""
                className="relative w-full drop-shadow-[0_0_20px_rgba(220,20,60,0.75)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* The whirl circling it on the ground: a ring tilted well past 45° into
          the floor plane, its arcs turning at different speeds. */}
      <div className="pointer-events-none absolute bottom-0 aspect-square w-[118%] translate-y-1/2 [perspective:700px]">
        <div className="h-full w-full opacity-0 animate-intro-vortex-in">
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
    </div>
  );
}
