import TournamentBoard from './TournamentBoard';
import { TOURNAMENTS } from '../utils/tournaments';

// Who has entered, in one section: a team board per tournament, side by side.
//
// The solo players pools belong here too and were briefly in — they answer the
// same question — but their shape in a half-width column hasn't been decided
// yet, so they're out until it is. PlayersPool itself is untouched and still
// takes a `tournament`; adding them back is the row below the boards again.
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

      </div>
    </section>
  );
}
