import { useEffect, useRef, useState } from 'react';

const POSTER = '/atakhan-bg-poster.webp';
// Two widths, so a phone isn't downloading a 1280px frame to paint it at around
// 720. The preload in index.html carries the same srcset, or it would fetch the
// large one while the img picked the small one and the page paid for both.
const POSTER_SET = '/atakhan-bg-poster-800.webp 800w, /atakhan-bg-poster.webp 1280w';
const VIDEO = '/atakhan-bg.mp4';

// Deliberately ungated. Earlier versions withheld this on narrow screens, on
// connections Chrome had guessed the speed of, behind window's load event, and
// for reduced-motion — and every one of those was another way for it to
// silently never play, which is what kept happening. It plays.
//
// The file is 6.7 MB rather than the original 16.8 MB, but at the same
// 1280x720: that saving is 24fps and a dropped audio track, not resolution.
export default function VideoBackground() {
  const [ready, setReady] = useState(false);
  const videoRef = useRef(null);

  // Autoplay is normally granted to a muted, inline video, but ask anyway — and
  // again when the page becomes visible, since a browser won't start playback
  // for a tab that isn't on screen and would otherwise leave it sitting frozen
  // on the first frame.
  useEffect(() => {
    const attempt = () => {
      if (document.hidden) return;
      const el = videoRef.current;
      if (el?.paused) el.play?.().catch(() => {});
    };
    attempt();
    document.addEventListener('visibilitychange', attempt);
    return () => document.removeEventListener('visibilitychange', attempt);
  }, []);

  const reveal = () => setReady(true);

  return (
    <div className="absolute top-0 left-0 w-full h-[110vh] sm:h-[115vh] z-0 overflow-hidden pointer-events-none">
      {/* Sits under the video the whole time: the frame shown until playback
          starts, and what remains if the clip can't play at all. */}
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

      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={POSTER}
        // Whichever of these lands first reveals it. Hanging on canplay alone
        // meant a missed event left the video mounted and permanently invisible.
        onCanPlay={reveal}
        onLoadedData={reveal}
        onPlaying={reveal}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src={VIDEO} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/80" />
    </div>
  );
}
