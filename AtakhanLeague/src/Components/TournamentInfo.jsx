// ---------------------------------------------------------------------------
// EDIT HERE. One entry per upcoming tournament — the layout is identical for
// each, so adding a third is another entry in this array.
//
// `image` is a file in AtakhanLeague/public/. The banner is a wide box and the
// image fills it by cropping, so a portrait source loses most of its height —
// `focus` says which part to keep (a CSS object-position). `rows` is the
// specification list; a row can carry `color` to pick its value out.
// ---------------------------------------------------------------------------
const TBA = 'TBA';

const TOURNAMENTS = [
  {
    id: 'low-elo',
    image: '/LowEloTournament.webp',
    alt: 'Low Elo Tournament',
    // Landscape and almost exactly the banner's shape — nothing to choose.
    focus: 'center',
    title: 'Low Elo',
    accent: 'Tournament',
    pills: ['Date TBA', '8 Teams', 'Single Elimination'],
    rows: [
      { key: 'Date', val: TBA },
      { key: 'Server', val: 'EUNE' },
      { key: 'Start', val: TBA },
      { key: 'Number of Teams', val: '8' },
      { key: 'Format', val: 'Single Elimination' },
      { key: 'Divisions', val: TBA },
      { key: 'Registration Fee', val: TBA },
      { key: '1st Place', val: TBA, color: 'text-[#DC143C]' },
      { key: '2nd Place', val: TBA },
      { key: '3rd Place', val: TBA },
    ],
  },
  {
    id: 'high-elo',
    image: '/HighEloTournament.webp',
    alt: 'High Elo Tournament',
    // 736x1070: a tall portrait in a wide box shows only 41% of its height.
    // Held high so the throne and Viego himself stay in frame instead of a
    // band across his middle.
    focus: 'center 22%',
    title: 'High Elo',
    accent: 'Tournament',
    pills: ['Date TBA', '8 Teams', 'Single Elimination'],
    rows: [
      { key: 'Date', val: TBA },
      { key: 'Server', val: 'EUNE' },
      { key: 'Start', val: TBA },
      { key: 'Number of Teams', val: '8' },
      { key: 'Format', val: 'Single Elimination' },
      { key: 'Divisions', val: TBA },
      { key: 'Registration Fee', val: TBA },
      { key: '1st Place', val: TBA, color: 'text-[#DC143C]' },
      { key: '2nd Place', val: TBA },
      { key: '3rd Place', val: TBA },
    ],
  },
];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-slogan text-[11px] sm:text-[13px] font-bold uppercase tracking-[2px] text-white border border-[rgba(220,20,60,0.5)] bg-[rgba(139,0,0,0.25)] backdrop-blur-md shadow-[0_0_16px_rgba(139,0,0,0.35)]">
      {children}
    </span>
  );
}

function Tournament({ image, alt, focus, title, accent, pills, rows }) {
  return (
    <div className="w-full max-w-[860px] flex flex-col gap-6">
      {/* ===== HERO BANNER ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-[rgba(220,20,60,0.4)] shadow-[0_0_70px_rgba(139,0,0,0.4)] animate-form-fade-in">
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: focus }}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,20,60,0.35),transparent_60%)]" />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)]" />

        <div className="relative px-6 sm:px-10 pt-44 sm:pt-64 pb-8">
          <p className="font-slogan text-[11px] sm:text-[13px] font-bold uppercase tracking-[5px] text-[#DC143C] mb-3 [text-shadow:0_0_14px_rgba(220,20,60,0.7)]">
            Atakhan League Presents
          </p>
          <h2 className="font-heading text-white text-[46px] sm:text-[78px] leading-[0.85] tracking-[2px] uppercase [text-shadow:0_0_26px_rgba(139,0,0,0.9),0_0_64px_rgba(220,20,60,0.55)]">
            {/* A real space before the break: <br /> splits the line visually
                but leaves no whitespace in the text, so the heading read
                "Low EloTournament" to a screen reader and to crawlers. */}
            {title}{' '}<br />
            <span className="text-[#DC143C]">{accent}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2.5 mt-6">
            {pills.map((p) => <Pill key={p}>{p}</Pill>)}
          </div>
        </div>
      </div>

      {/* ===== DETAILS LIST ===== */}
      <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-6 sm:px-10 py-8 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.18),inset_0_0_24px_rgba(102,0,0,0.06)]">
        <h3 className="font-heading text-white text-[30px] sm:text-[38px] tracking-[2px] mb-6 pb-4 border-b border-[rgba(102,0,0,0.35)] [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
          Tournament Specification
        </h3>

        <ul className="flex flex-col">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex justify-between items-center py-[15px] rounded-md border-b border-white/5 last:border-b-0 transition-all duration-200 hover:bg-[rgba(139,0,0,0.06)] hover:pl-2.5"
            >
              <span className="font-slogan text-[13px] font-bold tracking-[1.5px] uppercase text-[#777]">
                {row.key}
              </span>
              <span className={`font-body text-[16px] font-semibold ${row.color ?? 'text-white'}`}>
                {row.val}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function TournamentInfo() {
  return (
    <section className="relative z-[2] mt-[100px] px-5 flex flex-col items-center gap-16 sm:gap-20">
      {TOURNAMENTS.map((t) => (
        <Tournament key={t.id} {...t} />
      ))}
    </section>
  );
}
