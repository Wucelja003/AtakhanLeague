import TournamentBoard from './TournamentBoard';
import PlayersPool from './PlayersPool';
import { TOURNAMENTS } from '../utils/tournaments';

// Everything that shows who has entered, in one section: the team boards beside
// each other so the two tournaments can be compared at a glance, and the solo
// pools below them under their own heading.
//
// The pools are here rather than in a section of their own because they answer
// the same question as the boards — who's in — and reading them apart meant
// scrolling past one tournament's board to reach the other's pool.
export default function Standings() {
  return (
    <section className="relative z-[2] mt-[80px] sm:mt-[100px] px-5 pb-16">
      <div className="mx-auto max-w-6xl">
        {/* ===== TEAMS ===== */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Who&apos;s in
            </span>
          </div>
          <h2 className="font-heading text-[32px] leading-none text-white [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)] sm:text-[44px]">
            Tournament Boards
          </h2>
        </div>

        {/* items-start so a shorter board doesn't stretch to match the taller
            one — Low Elo has 8 rows against High Elo's 12. */}
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-6">
          {TOURNAMENTS.map((t) => (
            <TournamentBoard key={t.id} tournament={t} />
          ))}
        </div>

        {/* ===== SOLO PLAYERS ===== */}
        <div className="mt-20 mb-10 text-center">
          <span className="mx-auto mb-8 block h-[2px] w-40 rounded-full bg-[linear-gradient(90deg,transparent,#DC143C,transparent)]" />
          <h2 className="font-heading text-[32px] leading-none text-white [text-shadow:0_0_18px_rgba(139,0,0,0.9),0_0_40px_rgba(102,0,0,0.5)] sm:text-[44px]">
            Players Pools
          </h2>
          <p className="mt-3 font-body text-[14px] text-neutral-400 sm:text-[16px]">
            Solo players waiting to be picked up by a team.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-6">
          {TOURNAMENTS.map((t) => (
            <PlayersPool key={t.id} tournament={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
