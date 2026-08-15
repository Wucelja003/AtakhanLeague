import { useState } from 'react';
import { SiKick } from 'react-icons/si';

// ---------------------------------------------------------------------------
// EDIT HERE. One entry per stream — add, remove or rename freely.
//
//   channel — the part after kick.com/ in the channel address
//   teamA / teamB — who is playing on that stream; leave both out for a
//                   channel that isn't carrying a specific match
//
// Two entries render side by side; one fills the row on its own.
// ---------------------------------------------------------------------------
const STREAMS = [
  {
    channel: 'atakhanleague',
    teamA: 'Bocica Limuna',
    teamB: 'Team Alpha',
  },
  // {
  //   channel: 'drugi-kanal',
  //   teamA: 'AOS',
  //   teamB: '018',
  // },
];

// A single stream: its heading, then a facade that becomes the real player.
//
// It starts as a facade rather than the player because an embedded Kick player
// is a third-party iframe pulling its own scripts, styles and video — two of
// them would be two of that, on a page most people open to read the bracket.
// Nothing of Kick's is requested until someone asks to watch.
//
// Kick's channel API sits behind bot protection and can't be read from the
// browser or the server, so nothing here claims to be live; the player shows
// Kick's own offline screen when there's nothing on.
function Stream({ channel, teamA, teamB }) {
  const [playing, setPlaying] = useState(false);
  const hasMatch = Boolean(teamA && teamB);

  return (
    <div className="flex flex-col">
      <div className="mb-3 text-center">
        {/* Real spaces around VS, not margins: with margins alone the line
            reads "Bocica LimunaVSTeam Alpha" to a screen reader and to anyone
            who copies it. */}
        {hasMatch ? (
          <p className="font-slogan text-[13px] sm:text-[15px] font-bold tracking-wide text-white">
            {teamA}{' '}
            <span className="font-heading text-[#DC143C]">VS</span>{' '}
            {teamB}
          </p>
        ) : (
          <p className="font-slogan text-[13px] sm:text-[15px] font-bold tracking-wide text-neutral-300">
            Main stream
          </p>
        )}
        <p className="mt-1 font-slogan text-[10px] uppercase tracking-[2px] text-neutral-500">
          kick.com/{channel}
        </p>
      </div>

      {playing ? (
        <div className="overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.45)] bg-black shadow-[0_0_48px_rgba(102,0,0,0.3)]">
          <div className="relative w-full pt-[56.25%]">
            <iframe
              src={`https://player.kick.com/${channel}?autoplay=true`}
              title={hasMatch ? `${teamA} vs ${teamB} on Kick` : `${channel} on Kick`}
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
          className="group flex w-full items-center gap-3 sm:gap-4 rounded-2xl border border-[rgba(102,0,0,0.45)] bg-[rgba(10,10,10,0.72)] px-4 sm:px-6 py-4 sm:py-5 text-left backdrop-blur-md shadow-[0_0_36px_rgba(102,0,0,0.25)] transition-all duration-300 hover:border-[rgba(220,20,60,0.6)] hover:shadow-[0_0_48px_rgba(139,0,0,0.4)]"
        >
          <SiKick
            aria-hidden="true"
            focusable="false"
            className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
            style={{ color: '#53FC18', filter: 'drop-shadow(0 0 10px rgba(83,252,24,0.4))' }}
          />
          <span className="min-w-0 flex-1 font-slogan text-[12px] sm:text-[13px] font-bold uppercase tracking-[2px] text-white">
            Watch on Kick
          </span>
          <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] bg-[length:300%_300%] animate-wind-flow-login transition-transform duration-300 group-hover:scale-110">
            {/* Play triangle */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-[1px] text-white" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}

      <div className="mt-3 text-center">
        <a
          href={`https://kick.com/${channel}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-slogan text-[10px] uppercase tracking-[2px] text-neutral-500 transition-colors hover:text-[#DC143C]"
        >
          Open on kick.com ↗
        </a>
      </div>
    </div>
  );
}

export default function StreamBanner() {
  if (STREAMS.length === 0) return null;
  const single = STREAMS.length === 1;

  return (
    <section className="mt-16">
      <div className="text-center mb-8">
        <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-2">
          {single ? 'Live Stream' : 'Live Streams'}
        </p>
        <h2 className="font-heading text-white text-[clamp(2rem,4vw,3rem)] leading-none tracking-wide [text-shadow:0_0_14px_rgba(139,0,0,0.6)]">
          Watch It Live
        </h2>
        <p className="font-body text-sm text-neutral-400 mt-3">
          Every match streamed on Kick — casting on the big ones.
        </p>
      </div>

      {/* One stream stays narrower than the bracket above it; two share the
          width so neither reads as the main one. */}
      <div className={`mx-auto grid gap-8 ${single ? 'max-w-2xl' : 'max-w-5xl sm:grid-cols-2'}`}>
        {STREAMS.map((s) => (
          <Stream key={s.channel} {...s} />
        ))}
      </div>
    </section>
  );
}
