import SEO from '../Components/SEO';
import { DEMO_LEAGUE, LEAGUE_CUTS } from '../utils/showcase';

/*
 * The league table — the season-long half of the platform, as against the
 * weekend tournaments the Tournaments page covers.
 *
 * This page was a "coming soon" card for its whole life. A league is a table,
 * so it is a table: every team, what they have played, and the two lines that
 * decide the season — the playoff cut at the top and the relegation line at
 * the bottom.
 */

const COLS = [
  { key: 'played', label: 'P', title: 'Played' },
  { key: 'won', label: 'W', title: 'Won' },
  { key: 'lost', label: 'L', title: 'Lost' },
  { key: 'roundsFor', label: 'RW', title: 'Rounds won' },
  { key: 'roundsAgainst', label: 'RL', title: 'Rounds lost' },
  { key: 'diff', label: '+/−', title: 'Round difference' },
];

function Form({ form }) {
  return (
    <span className="flex items-center justify-end gap-1">
      {form.map((r, i) => (
        <span
          key={i}
          title={r === 'W' ? 'Won' : 'Lost'}
          className={`grid h-5 w-5 place-items-center rounded-[4px] font-slogan text-[10px] font-bold ${
            r === 'W'
              ? 'bg-[rgba(220,20,60,0.22)] text-[#ff6b86]'
              : 'bg-white/[0.06] text-neutral-500'
          }`}
        >
          {r}
        </span>
      ))}
    </span>
  );
}

export default function League() {
  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-16">
      <SEO
        title="League"
        path="/league"
        description="The Atakhan League season table — every team, their record across the split, and the playoff and relegation lines."
      />
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <div className="mb-10 text-center animate-fade-in-down">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Season Table
            </span>
          </div>
          <h1 className="font-heading text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-wide text-white [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            The League
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-base text-neutral-400">
            Twelve teams, everyone plays everyone, three points a win. The top four meet in the
            playoffs and the bottom two drop out of the split.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
                  <th className="w-14 px-4 py-4 text-left font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                    #
                  </th>
                  <th className="px-4 py-4 text-left font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                    Team
                  </th>
                  {COLS.map((c) => (
                    <th
                      key={c.key}
                      title={c.title}
                      className="w-12 px-2 py-4 text-center font-slogan text-[11px] font-bold uppercase tracking-[1px] text-neutral-500"
                    >
                      {c.label}
                    </th>
                  ))}
                  <th className="w-20 px-4 py-4 text-right font-slogan text-[11px] font-bold uppercase tracking-[2px] text-[#DC143C]">
                    Pts
                  </th>
                  <th className="w-36 px-4 py-4 text-right font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-500">
                    Form
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEMO_LEAGUE.map((row, i) => {
                  const pos = i + 1;
                  const playoff = pos <= LEAGUE_CUTS.playoff;
                  const relegated = pos > LEAGUE_CUTS.relegation;
                  // The two lines that decide the season, drawn as lines —
                  // a legend underneath would make the reader count rows.
                  const cut =
                    pos === LEAGUE_CUTS.playoff
                      ? 'border-b-2 border-b-[rgba(220,20,60,0.55)]'
                      : pos === LEAGUE_CUTS.relegation
                        ? 'border-b-2 border-b-[rgba(120,120,120,0.35)]'
                        : 'border-b border-[rgba(102,0,0,0.15)]';

                  return (
                    <tr
                      key={row.name}
                      className={`transition-colors last:border-b-0 hover:bg-[rgba(139,0,0,0.08)] ${cut} ${
                        playoff ? 'bg-[rgba(220,20,60,0.07)]' : relegated ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-heading text-[18px] leading-none ${
                            playoff ? 'text-[#DC143C]' : 'text-neutral-500'
                          }`}
                        >
                          {pos}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-slogan text-[14px] font-bold tracking-wide text-white">
                          {row.name}
                        </span>
                      </td>
                      {COLS.map((c) => (
                        <td
                          key={c.key}
                          className={`px-2 py-3.5 text-center font-slogan text-[13px] tabular-nums ${
                            c.key !== 'diff'
                              ? 'text-neutral-400'
                              : row.diff > 0
                                ? 'font-bold text-[#4ade80]'
                                : row.diff < 0
                                  ? 'font-bold text-[#f87171]'
                                  : /* level — neither, and red read as a loss */
                                    'font-bold text-neutral-400'
                          }`}
                        >
                          {c.key === 'diff' && row.diff > 0 ? `+${row.diff}` : row[c.key]}
                        </td>
                      ))}
                      <td className="px-4 py-3.5 text-right font-heading text-[22px] leading-none text-white">
                        {row.points}
                      </td>
                      <td className="px-4 py-3.5">
                        <Form form={row.form} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* What the two lines mean */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 font-slogan text-[11px] tracking-wider text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-[#DC143C] bg-[rgba(220,20,60,0.3)]" />
            Playoffs
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-[rgba(102,0,0,0.35)] bg-black/40" />
            Mid table
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-[rgba(120,120,120,0.35)] bg-white/[0.04]" />
            Relegated
          </div>
        </div>

        {/* Quote — the one thing worth keeping from the placeholder this page was */}
        <blockquote className="mx-auto mt-14 max-w-2xl rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)] px-8 py-8 text-center backdrop-blur-md">
          <p className="font-orbitron text-[18px] italic leading-relaxed text-neutral-300 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
            "In the silence before the chant, even gods hold their breath — for the Rift answers
            only to those who dare to fight."
          </p>
          <footer className="mt-5">
            <span className="font-slogan text-[12px] font-bold uppercase tracking-[3px] text-secondary">
              — Atakhan League
            </span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
