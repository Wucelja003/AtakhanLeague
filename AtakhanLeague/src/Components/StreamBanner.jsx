import { useState } from 'react';
import { SiKick } from 'react-icons/si';

// Same channel the Community section links to.
export const KICK_CHANNEL = 'atakhanleague';

const WATCH_URL = `https://kick.com/${KICK_CHANNEL}`;
const PLAYER_URL = `https://player.kick.com/${KICK_CHANNEL}?autoplay=true`;

// The stream, at the top of the home page.
//
// It starts as a facade rather than the real player: an embedded Kick player is
// a third-party iframe that pulls its own scripts, styles and video, and this
// sits above the hero — the exact region that decides the page's largest
// contentful paint. Nothing of Kick's is requested until someone asks to watch.
//
// Kick's channel API sits behind bot protection and can't be read from the
// browser or the server, so the banner can't know whether the stream is live.
// It says "watch on Kick" rather than claiming to be live, and the player
// itself shows Kick's offline screen when there's nothing on.
export default function StreamBanner() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="relative z-[3] px-4 pt-8 sm:pt-12">
      <div className="mx-auto w-full max-w-3xl">
        {playing ? (
          <div className="overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.45)] bg-black shadow-[0_0_48px_rgba(102,0,0,0.3)]">
            <div className="relative w-full pt-[56.25%]">
              <iframe
                src={PLAYER_URL}
                title="Atakhan League live stream on Kick"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group flex w-full items-center gap-3 sm:gap-4 rounded-2xl border border-[rgba(102,0,0,0.45)] bg-[rgba(10,10,10,0.72)] px-4 sm:px-6 py-3.5 sm:py-4 text-left backdrop-blur-md shadow-[0_0_36px_rgba(102,0,0,0.25)] transition-all duration-300 hover:border-[rgba(220,20,60,0.6)] hover:shadow-[0_0_48px_rgba(139,0,0,0.4)]"
          >
            <SiKick
              aria-hidden="true"
              focusable="false"
              className="h-6 w-6 sm:h-7 sm:w-7 shrink-0"
              style={{ color: '#53FC18', filter: 'drop-shadow(0 0 10px rgba(83,252,24,0.4))' }}
            />

            <span className="min-w-0 flex-1">
              <span className="block font-slogan text-[12px] sm:text-[13px] font-bold uppercase tracking-[2px] text-white">
                Watch on Kick
              </span>
              <span className="mt-0.5 block truncate font-body text-[12px] sm:text-[13px] text-neutral-400">
                Every match streamed live — casting on the big ones.
              </span>
            </span>

            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] bg-[length:300%_300%] animate-wind-flow-login transition-transform duration-300 group-hover:scale-110">
              {/* Play triangle */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-[1px] text-white" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}

        <div className="mt-2 text-center">
          <a
            href={WATCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-slogan text-[10px] uppercase tracking-[2px] text-neutral-500 transition-colors hover:text-[#DC143C]"
          >
            Open on kick.com ↗
          </a>
        </div>
      </div>
    </section>
  );
}
