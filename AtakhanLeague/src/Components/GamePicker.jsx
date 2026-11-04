import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES, FORMATS } from '../utils/showcase';
import useReveal from '../utils/useReveal';

/*
 * Which game a tournament is being run for — the first thing a visitor picks.
 *
 * Sits straight after the Introduce section, because that section says what
 * Atakhan League is and this one says what it can be run for. Three cards, one
 * active at a time, and a panel underneath that changes with it.
 *
 * The cards themselves are never hidden behind the reveal: if the observer
 * never fires, the section still has to be a section. Only the heading above
 * them animates in.
 */

/* Each game tints the crimson rather than replacing it — the site stays one
   site. Held as inline style because the colours come from the data, and
   Tailwind cannot generate a class from a value it has not seen. */
function tint(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function GameCard({ game, active, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className="group relative w-full overflow-hidden rounded-2xl border text-left transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC143C]"
      style={{
        borderColor: active ? tint(game.accent, 0.75) : 'rgba(102,0,0,0.35)',
        boxShadow: active
          ? `0 0 48px ${tint(game.accent, 0.35)}, inset 0 0 28px ${tint(game.accent, 0.1)}`
          : '0 0 24px rgba(0,0,0,0.5)',
        transform: active ? 'translateY(-4px)' : 'none',
      }}
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden sm:aspect-[16/10]">
        <img
          src={game.image}
          alt={game.name}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: game.focus }}
          className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${
            active ? 'scale-105' : 'scale-100 grayscale-[55%] opacity-70'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        {/* The accent only washes over the one that is picked. */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: active ? 1 : 0,
            background: `radial-gradient(circle at 50% 120%, ${tint(game.accent, 0.4)}, transparent 62%)`,
          }}
        />
        <span
          className="absolute left-0 right-0 top-0 h-[3px] transition-opacity duration-500"
          style={{
            opacity: active ? 1 : 0,
            background: `linear-gradient(90deg,transparent,${game.accent},transparent)`,
          }}
        />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <span
            className="font-slogan text-[10px] font-bold uppercase tracking-[3px] transition-colors duration-300"
            style={{ color: active ? game.accent : '#8a8a8a' }}
          >
            {game.tagline}
          </span>
          <h3 className="mt-1.5 font-heading text-[26px] leading-none tracking-[1.5px] text-white sm:text-[30px] [text-shadow:0_0_20px_rgba(0,0,0,0.9)]">
            {game.name}
          </h3>
        </div>
      </div>
    </button>
  );
}

export default function GamePicker() {
  const [activeId, setActiveId] = useState(GAMES[0].id);
  const { ref, shown, at, fade } = useReveal({ threshold: 0.1 });

  const game = GAMES.find((g) => g.id === activeId) ?? GAMES[0];
  const formats = FORMATS.filter((f) => game.formats.includes(f.id));

  return (
    <section ref={ref} id="games" className="relative z-[2] mt-[70px] px-5 py-12 sm:mt-[90px] sm:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className={`mb-10 text-center ${fade('animate-reveal-up')}`} style={at(0.05)}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Three games, one platform
            </span>
          </div>
          <h2 className="font-heading text-[clamp(2.2rem,5vw,3.5rem)] leading-none tracking-wide text-white [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            Choose your battlefield
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-base text-neutral-400">
            Brackets, group tables, rosters and payments work the same whichever one you run.
            Pick a game to see what changes.
          </p>
        </div>

        {/* The three cards */}
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {GAMES.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              active={g.id === activeId}
              onPick={() => setActiveId(g.id)}
            />
          ))}
        </div>

        {/* What picking it means. Keyed on the game so it replays on each
            change — without the key React keeps the node and the content
            swaps with no transition at all. */}
        <div
          key={game.id}
          className="mt-5 animate-form-fade-in rounded-2xl border bg-[rgba(10,10,10,0.7)] px-5 py-7 backdrop-blur-md sm:px-8"
          style={{
            borderColor: tint(game.accent, 0.4),
            boxShadow: `0 0 48px ${tint(game.accent, 0.14)}, inset 0 0 24px rgba(0,0,0,0.3)`,
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
            <div>
              <span
                className="font-slogan text-[11px] font-bold uppercase tracking-[4px]"
                style={{ color: game.accent }}
              >
                {game.short}
              </span>
              <p className="mt-3 font-body text-[16px] leading-8 text-neutral-300 sm:text-[17px]">
                {game.blurb}
              </p>

              <span className="mt-7 block font-slogan text-[11px] font-bold uppercase tracking-[3px] text-neutral-500">
                Formats it can run
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {formats.map((f) => (
                  <span
                    key={f.id}
                    className="rounded-full border px-3.5 py-1.5 font-slogan text-[11px] font-bold uppercase tracking-[1.5px] text-neutral-200"
                    style={{
                      borderColor: tint(game.accent, 0.45),
                      backgroundColor: tint(game.accent, 0.1),
                    }}
                  >
                    {f.label}
                  </span>
                ))}
              </div>

              <Link
                to={`/tournaments?game=${game.id}`}
                className="mt-7 inline-flex items-center gap-2 rounded-[20px] border px-7 py-3 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  borderColor: tint(game.accent, 0.6),
                  backgroundColor: tint(game.accent, 0.14),
                }}
              >
                See the brackets
                <span aria-hidden>→</span>
              </Link>
            </div>

            {/* The specification, same shape as a tournament's own. */}
            <ul className="flex flex-col self-start rounded-xl border border-[rgba(102,0,0,0.3)] bg-black/40 px-5 py-2">
              {game.facts.map(([key, val]) => (
                <li
                  key={key}
                  className="flex items-center justify-between gap-3 border-b border-white/5 py-3.5 last:border-b-0"
                >
                  <span className="font-slogan text-[12px] font-bold uppercase tracking-[1.5px] text-[#777]">
                    {key}
                  </span>
                  <span className="text-right font-body text-[15px] font-semibold text-white">
                    {val}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Same rule Introduce closes with, so the two sections read as a pair. */}
      <hr className="mx-auto mt-14 max-w-6xl border-0 h-[2px] bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)] shadow-[0_0_12px_rgba(220,20,60,0.5)] sm:mt-16" />
    </section>
  );
}
