import { useEffect, useState } from 'react';

const POSTER = '/atakhan-bg-poster.webp';
const VIDEO = '/atakhan-bg.mp4';

// The source clip is 17 MB, and `preload="none"` never held it back — autoplay
// overrides it — so every visit paid for the whole thing before anything else
// could load. It's re-encoded to 6.7 MB and only fetched on a screen big enough
// to warrant it, on a connection that isn't metered, after load, and not for
// anyone who has asked for less motion. Everyone else keeps the poster, which
// is 32 KB and already the first frame.
//
// Kept at the source's full 1280x720: since none of the above lets it touch a
// phone or the cold load, the bytes it saved by being smaller weren't buying
// anything, and downscaling was visibly mushing the in-game text.
function wantsVideo() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia?.('(min-width: 1024px)').matches) return false;
  const link = navigator.connection;
  if (link?.saveData) return false;
  if (link?.effectiveType && !/4g/.test(link.effectiveType)) return false;
  return true;
}

export default function VideoBackground() {
  const [play, setPlay] = useState(false);
  const [ready, setReady] = useState(false);

  // Decided after mount, and only once the page has settled, so the video never
  // competes with the content for the first paint.
  useEffect(() => {
    if (!wantsVideo()) return;
    const start = () => setPlay(true);
    if (document.readyState === 'complete') {
      const id = setTimeout(start, 400);
      return () => clearTimeout(id);
    }
    window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-[110vh] sm:h-[115vh] z-0 overflow-hidden pointer-events-none">
      {/* Always the poster underneath: it's what shows on phones, and what the
          video fades in over everywhere else. */}
      <img
        src={POSTER}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {play && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={POSTER}
          onCanPlay={() => setReady(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={VIDEO} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-black/80" />
    </div>
  );
}
