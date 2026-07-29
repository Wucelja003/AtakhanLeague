import { useEffect, useRef, useState } from 'react';

/**
 * Holds a section back until it's actually scrolled to, then reveals it.
 *
 * Returns { ref, shown, animate, at, fade, grow }:
 *   ref     — attach to the element to watch
 *   shown   — content should be visible
 *   animate — reveal with motion rather than just appearing
 *   at(s)   — inline animationDelay, or undefined when not animating
 *   fade(a) — resting opacity-0 → animation → plain visible
 *   grow(a, resting) — same, for transform-based reveals (scale-x-0 etc.)
 *
 * Content must never depend on the animation running, so a browser without
 * IntersectionObserver — or anyone who prefers reduced motion — gets everything
 * at once and still, instead of a section stuck at opacity 0.
 */
export default function useReveal({ threshold = 0.25 } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still || typeof IntersectionObserver === 'undefined') {
      setAnimate(false);
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return {
    ref,
    shown,
    animate,
    at: (seconds) => (shown && animate ? { animationDelay: `${seconds}s` } : undefined),
    fade: (animation) => (!shown ? 'opacity-0' : animate ? animation : 'opacity-100'),
    grow: (animation, resting) => (!shown ? resting : animate ? animation : ''),
  };
}
