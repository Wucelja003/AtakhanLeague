import { Suspense, lazy, useEffect, useRef, useState } from 'react';

// The same rigged spawn the intro splash plays. Lazy, so three.js stays out of
// the main bundle; by the time anyone scrolls this far the GLB is usually
// already cached from the splash.
const IntroModel = lazy(() => import('./IntroModel'));

const MODEL_SRC = '/atakhan-spawn.glb';
const CLIP_END_S = 6.9;
// Full speed here — unlike the splash there's no fade clock to squeeze it into.
const CLIP_RATE = 1;
const MODEL_YAW_DEG = 180;

export default function Introduce() {
  const slotRef = useRef(null);
  // Mount a little before the slot scrolls into view so the model has time to
  // load. It won't animate early: IntroModel idles its render loop until the
  // canvas is actually on screen, so the spawn still starts from the top.
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  // Separate from `near`: the spawn opens on an empty frame, so handing the
  // slot over the moment the model loads would blank it out while the visitor
  // is still scrolling towards it. The image holds until they actually arrive,
  // then cross-fades as the creature climbs into view.
  const [arrived, setArrived] = useState(false);
  const showModel = ready && arrived;

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        preload.disconnect();
      },
      { rootMargin: '300px' }
    );
    preload.observe(slot);

    const onScreen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setArrived(true);
        onScreen.disconnect();
      },
      { threshold: 0.35 }
    );
    onScreen.observe(slot);

    return () => {
      preload.disconnect();
      onScreen.disconnect();
    };
  }, []);

  return (
    <section className="relative z-[2] mt-[80px] sm:mt-[100px] px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        <div className="border-l-[3px] border-[#660000] pl-5 sm:pl-7 animate-slide-in-left flex-1">
          <h2 className="relative inline-block font-heading text-[28px] sm:text-[36px] lg:text-[44px] text-white pb-3 mb-5 sm:mb-7 [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:rounded-sm after:bg-[linear-gradient(90deg,#660000,#DC143C,#8B0000,#660000)]">
            What is Atakhan League?
          </h2>

          <p className="font-body text-[15px] sm:text-[17px] lg:text-[18px] leading-7 sm:leading-8 text-neutral-300">
            In honor of Atakhan, the ancient demon of bloodshed who once
            roamed the Summoner's Rift, a group of passionate League of
            Legends enthusiasts built a platform worthy of his legacy.
            <br /><br />
            Atakhan League was created for every player who lives and
            breathes League of Legends — regardless of rank, regardless
            of division. Here, every summoner gets a real shot at
            competing, climbing, and walking away with prizes that
            match their hunger for victory.
            <br /><br />
            This is not just a platform. This is your Rift.
          </p>
        </div>

        <div
          ref={slotRef}
          className="relative shrink-0 aspect-square w-[220px] sm:w-[300px] lg:w-[380px]"
        >
          {/* Left mounted rather than swapped out: it holds the slot steady
              while the model loads, keeps the alt text, and is what remains if
              WebGL is missing or the download fails. */}
          <img
            src="/mainDemon-removebg-preview.png"
            alt="Atakhan, the demon of bloodshed"
            className={`h-full w-full object-contain transition-opacity duration-1000 [filter:drop-shadow(0_0_30px_rgba(139,0,0,0.6))] ${
              showModel ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {near && (
            <div
              className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
                showModel ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Suspense fallback={null}>
                <IntroModel
                  src={MODEL_SRC}
                  playing
                  endAt={CLIP_END_S}
                  timeScale={CLIP_RATE}
                  yawDeg={MODEL_YAW_DEG}
                  onReady={() => setReady(true)}
                  onFail={() => setReady(false)}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
      <hr className="mt-16 sm:mt-20 border-0 h-[2px] bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)] shadow-[0_0_12px_rgba(220,20,60,0.5)]" />
    </section>
  );
}
