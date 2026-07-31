import { useEffect, useRef, useState } from 'react';

const POSTER = '/atakhan-bg-poster.webp';
// Two widths: the backdrop spans the viewport, so a phone was downloading a
// 1280px frame to paint it around 720. The preload in index.html carries the
// same srcset, or it would fetch the large one and the picked one separately.
const POSTER_SET = '/atakhan-bg-poster-800.webp 800w, /atakhan-bg-poster.webp 1280w';
const VIDEO = '/atakhan-bg.mp4';
const WIDE = '(min-width: 1024px)';

// The source clip is 17 MB, and `preload="none"` never held it back — autoplay
// overrides it — so every visit paid for the whole thing before anything else
// could load. Re-encoded to 6.7 MB and only fetched on a screen big enough to
// warrant it, on a connection the visitor hasn't marked as metered, and after
// the page has loaded. Everyone else keeps the poster, which is 32 KB and is
// already the clip's first frame.
//
// No effectiveType check: Chrome's estimate is often still "3g" in the first
// seconds of a page even on fast wifi, which quietly withheld the video on
// perfectly good connections. saveData is the signal that actually means the
// visitor wants fewer bytes.
function allowed() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.connection?.saveData) return false;
  return true;
}

export default function VideoBackground() {
  const [play, setPlay] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!allowed()) return;

    const wide = window.matchMedia(WIDE);
    let settled = false;

    const start = () => {
      // Re-checked each time rather than once on mount, so a window that was
      // narrow at that moment — or reported no width at all mid-load — isn't
      // written off for the rest of the session.
      if (settled || !wide.matches) return;
      settled = true;
      setPlay(true);
    };

    // Deliberately NOT waiting on window's load event. Any single resource that
    // stalls holds that event back indefinitely, and the video was hanging off
    // it — one slow image and it simply never started. A timer from mount
    // gives the same "after the page has settled" behaviour with nothing to
    // hang on.
    const timer = setTimeout(start, 600);
    wide.addEventListener('change', start);

    return () => {
      clearTimeout(timer);
      wide.removeEventListener('change', start);
    };
  }, []);

  // Autoplay can still be refused; muted + playsInline normally satisfies it,
  // but ask explicitly and reveal on whichever event arrives first, so a missed
  // `canplay` can't leave the video mounted and permanently invisible.
  //
  // The retry on visibilitychange matters: a browser won't start playback for a
  // page that isn't on screen, so a visit that begins in a background tab would
  // otherwise end up mounted, visible and frozen on its first frame — which
  // looks exactly like a broken video rather than a paused one.
  useEffect(() => {
    if (!play) return;
    const attempt = () => {
      if (document.hidden) return;
      const el = videoRef.current;
      if (el?.paused) el.play?.().catch(() => {});
    };
    attempt();
    document.addEventListener('visibilitychange', attempt);
    return () => document.removeEventListener('visibilitychange', attempt);
  }, [play]);

  const reveal = () => setReady(true);

  return (
    <div className="absolute top-0 left-0 z-0 w-full overflow-hidden pointer-events-none">
      {/* Sized by width at the clip's own 16:9, so nothing is cropped. */}
      <div className="relative aspect-video w-full">
        <img
          src={POSTER}
          srcSet={POSTER_SET}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {play && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={POSTER}
            onCanPlay={reveal}
            onLoadedData={reveal}
            onPlaying={reveal}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={VIDEO} type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-black/80" />
        {/* Carries the bottom edge into the page background instead of ending
            on a hard line where the clip stops. */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(to_bottom,transparent,#0A0A0A)]" />
      </div>
    </div>
  );
}
