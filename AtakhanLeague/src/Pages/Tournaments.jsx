import { useSearchParams } from 'react-router-dom';
import SEO from '../Components/SEO';
import StreamBanner from '../Components/StreamBanner';
import BracketShowcase from '../Components/BracketShowcase';
import { GAMES, gameById } from '../utils/showcase';
import { CANCELLED, CANCELLED_NOTE, PENDING_NOTE } from '../utils/tournaments';

/*
 * What a tournament on this platform looks like, for each game it can be run
 * for and each format it can be run in.
 *
 * This page used to draw one hardcoded eight-team bracket from the API. It now
 * draws whichever format is picked, from the showcase data — the API is not
 * answering, and a page that renders "TBD" in every slot proves nothing to
 * anyone deciding whether the platform could run their tournament.
 *
 * The game is in the URL (`?game=tft`) so the picker on the home page can link
 * straight to it and so a particular bracket can be sent to someone.
 */

export default function Tournaments() {
  const [params, setParams] = useSearchParams();
  const game = gameById(params.get('game'));

  const pickGame = (id) => {
    // `replace` so flicking between three tabs does not fill the back button
    // with the three tabs.
    setParams(id === GAMES[0].id ? {} : { game: id }, { replace: true });
  };

  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-16">
      <SEO
        title="Tournaments"
        path="/tournaments"
        description="Every tournament format Atakhan League runs — group stages, single and double elimination, Swiss rounds and lobby points — for League of Legends, Teamfight Tactics and VALORANT."
      />
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mb-10 text-center animate-fade-in-down">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              {CANCELLED ? 'Cancelled' : 'Formats'}
            </span>
          </div>
          <h1 className="font-heading text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-wide text-white [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            Tournaments
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-base text-neutral-400">
            {CANCELLED ? CANCELLED_NOTE : PENDING_NOTE}
          </p>
        </div>

        {/* Which game */}
        <div className="mb-8 flex flex-wrap justify-center gap-2.5">
          {GAMES.map((g) => {
            const on = g.id === game.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => pickGame(g.id)}
                aria-pressed={on}
                className="rounded-full border px-5 py-2.5 font-slogan text-[12px] font-bold uppercase tracking-[2px] transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  borderColor: on ? g.accent : 'rgba(102,0,0,0.4)',
                  backgroundColor: on ? `${g.accent}22` : 'rgba(0,0,0,0.4)',
                  color: on ? '#fff' : '#9a9a9a',
                  boxShadow: on ? `0 0 22px ${g.accent}44` : 'none',
                }}
              >
                {g.short}
              </button>
            );
          })}
        </div>

        {/* What that game is, in one line, so the tabs are not three bare words */}
        <p className="mb-8 text-center font-slogan text-[11px] font-bold uppercase tracking-[3px]" style={{ color: game.accent }}>
          {game.name} · {game.tagline}
        </p>

        <BracketShowcase game={game} />

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 font-slogan text-[11px] tracking-wider text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-[#DC143C] bg-[rgba(220,20,60,0.4)]" />
            Winner advances
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-[rgba(102,0,0,0.35)] bg-black/40" />
            Knocked out
          </div>
          {game.teamSize > 1 && (
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#DC143C]" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
              Tap a team for its roster
            </div>
          )}
        </div>

        <StreamBanner />
      </div>
    </section>
  );
}
