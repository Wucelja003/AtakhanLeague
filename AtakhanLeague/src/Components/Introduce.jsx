import { Fragment } from 'react';
import SpawnScene, { IDLE_CLIP, IDLE_YAW_DEG } from './SpawnScene';
import useReveal from '../utils/useReveal';

const HEADING = ['What', 'is', 'Atakhan', 'League?'];

// Run the spawn out to its full length here, then hand over to the idle.
const CLIP_DURATION_S = 8.33;

const PARAGRAPHS = [
  `In honor of Atakhan, the ancient demon of bloodshed who once roamed the
   Summoner's Rift, a group of passionate League of Legends enthusiasts built a
   platform worthy of his legacy.`,
  `Atakhan League was created for every player who lives and breathes League of
   Legends — regardless of rank, regardless of division. Here, every summoner
   gets a real shot at competing, climbing, and walking away with prizes that
   match their hunger for victory.`,
];

// L-shaped brackets framing the creature. Position first, borders second.
const CORNERS = [
  'top-0 left-0 border-t-2 border-l-2',
  'top-0 right-0 border-t-2 border-r-2',
  'bottom-0 left-0 border-b-2 border-l-2',
  'bottom-0 right-0 border-b-2 border-r-2',
];

export default function Introduce() {
  // Held back until the section is reached: the reveal delays are measured from
  // that moment, and the spawn's CSS beats run from when the scene mounts.
  // Firing on page load would mean it had all played before anyone scrolled to it.
  const { ref: sectionRef, shown, animate, at, fade, grow } = useReveal();

  return (
    <section
      ref={sectionRef}
      className="relative z-[2] mt-[80px] sm:mt-[100px] px-5 py-16 sm:py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="relative flex-1 pl-6 sm:pl-8">
          {/* Accent rail, drawing itself down the column */}
          <span
            className={`absolute left-0 top-0 h-full w-[3px] origin-top rounded-full bg-[linear-gradient(180deg,#DC143C_0%,#8B0000_55%,transparent_100%)] shadow-[0_0_14px_rgba(220,20,60,0.45)] ${grow(
              'animate-reveal-draw',
              'scale-y-0'
            )}`}
          />

          {/* Eyebrow */}
          <div
            className={`mb-4 flex items-center gap-3 ${fade('animate-reveal-up')}`}
            style={at(0.12)}
          >
            <span className="h-px w-8 bg-[#DC143C]" />
            <span className="font-orbitron text-[11px] font-bold uppercase tracking-[4px] text-[#DC143C]">
              The Legend
            </span>
          </div>

          {/* Heading — each word rises into its own clipped box, then a band of
              light crosses the whole line every few seconds. */}
          <div className="relative overflow-hidden pb-2">
            <h2 className="font-cinzel text-[30px] font-semibold leading-[1.15] text-white sm:text-[40px] lg:text-[48px] [text-shadow:0_0_22px_rgba(139,0,0,0.85),0_0_50px_rgba(102,0,0,0.45)]">
              {/* Real spaces between the words, not margins: the clipping
                  wrapper is one element per word, and without them the
                  heading's text content reads "WhatisAtakhanLeague?" to screen
                  readers and crawlers. */}
              {HEADING.map((word, i) => (
                <Fragment key={word}>
                  <span className="inline-block overflow-hidden align-bottom">
                    <span
                      className={`inline-block ${fade('animate-reveal-word')}`}
                      style={at(0.26 + i * 0.09)}
                    >
                      {word}
                    </span>
                  </span>
                  {i < HEADING.length - 1 && ' '}
                </Fragment>
              ))}
            </h2>
            {shown && animate && (
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(90deg,transparent,rgba(255,180,190,0.22),transparent)] animate-reveal-sheen" />
            )}
          </div>

          {/* Rule sweeping out from the rail */}
          <span
            className={`mt-1 mb-7 block h-[3px] w-full max-w-[440px] origin-left rounded-full bg-[linear-gradient(90deg,#660000,#DC143C,#8B0000,transparent)] ${grow(
              'animate-reveal-sweep',
              'scale-x-0'
            )}`}
            style={at(0.5)}
          />

          {PARAGRAPHS.map((text, i) => (
            <p
              key={i}
              className={`mb-5 font-body text-[15px] leading-7 text-neutral-300 sm:text-[17px] sm:leading-8 lg:text-[18px] ${fade(
                'animate-reveal-up'
              )}`}
              style={at(0.66 + i * 0.14)}
            >
              {text}
            </p>
          ))}

          <p
            className={`font-slogan text-[15px] font-bold uppercase tracking-[3px] text-[#cc3333] sm:text-[17px] ${fade(
              'animate-reveal-up'
            )}`}
            style={at(0.94)}
          >
            This is not just a platform. This is your Rift.
          </p>
        </div>

        <div className="relative aspect-square w-[240px] shrink-0 sm:w-[320px] lg:w-[400px]">
          {CORNERS.map((corner, i) => (
            <span
              key={corner}
              className={`pointer-events-none absolute h-8 w-8 border-[rgba(220,20,60,0.55)] ${corner} ${fade(
                'animate-reveal-bracket'
              )}`}
              style={at(0.4 + i * 0.08)}
            />
          ))}

          {/* Holds the slot until the sequence starts, carries the alt text,
              and is what's left if the scene can't render at all. */}
          <img
            src="/mainDemon-removebg-preview.png"
            alt="Atakhan, the demon of bloodshed"
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-contain transition-opacity duration-500 [filter:drop-shadow(0_0_30px_rgba(139,0,0,0.6))] ${
              shown && animate ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Reduced motion keeps the still image — the spawn is the one thing
              here that can't be made motionless. */}
          {shown && animate && (
            <div className="absolute inset-0">
              {/* Full speed — unlike the splash there's no fade clock to
                  squeeze the spawn into — and it hands over to the idle clip at
                  the end, so the creature stands there breathing rather than
                  freezing. */}
              <SpawnScene
                clipRate={1}
                clipEnd={CLIP_DURATION_S}
                idleClip={IDLE_CLIP}
                yawDeg={IDLE_YAW_DEG}
              />
            </div>
          )}
        </div>
      </div>

      <hr className="mt-16 border-0 h-[2px] bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)] shadow-[0_0_12px_rgba(220,20,60,0.5)] sm:mt-20" />
    </section>
  );
}
