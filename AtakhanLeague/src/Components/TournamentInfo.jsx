import { TOURNAMENTS } from '../utils/tournaments';

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-slogan text-[11px] sm:text-[13px] font-bold uppercase tracking-[2px] text-white border border-[rgba(220,20,60,0.5)] bg-[rgba(139,0,0,0.25)] backdrop-blur-md shadow-[0_0_16px_rgba(139,0,0,0.35)]">
      {children}
    </span>
  );
}

function Tournament({ image, alt, focus, label, title, accent, pills, rows }) {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* ===== NAME ===== */}
      <div className="text-center">
        <h2 className="font-heading text-white text-[40px] sm:text-[52px] leading-none tracking-[3px] uppercase [text-shadow:0_0_22px_rgba(139,0,0,0.9),0_0_56px_rgba(220,20,60,0.5)]">
          {label}
        </h2>
        <span className="mx-auto mt-3 block h-[3px] w-[130px] rounded-full bg-[linear-gradient(90deg,transparent,#DC143C,transparent)]" />
      </div>

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

        <div className="relative px-5 sm:px-7 pt-40 sm:pt-52 pb-7">
          <p className="font-slogan text-[11px] sm:text-[13px] font-bold uppercase tracking-[5px] text-[#DC143C] mb-3 [text-shadow:0_0_14px_rgba(220,20,60,0.7)]">
            Atakhan League Presents
          </p>
          <h3 className="font-heading text-white text-[32px] sm:text-[42px] leading-[0.9] tracking-[2px] uppercase [text-shadow:0_0_26px_rgba(139,0,0,0.9),0_0_64px_rgba(220,20,60,0.55)]">
            {/* A real space before the break: <br /> splits the line visually
                but leaves no whitespace in the text, so it would read
                "Hunt or be HuntedTournament" to a screen reader. */}
            {title}{' '}<br />
            <span className="text-[#DC143C]">{accent}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {pills.map((p) => <Pill key={p}>{p}</Pill>)}
          </div>
        </div>
      </div>

      {/* ===== DETAILS LIST ===== */}
      <div className="flex-1 rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-5 sm:px-7 py-7 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.18),inset_0_0_24px_rgba(102,0,0,0.06)]">
        <h4 className="font-heading text-white text-[26px] sm:text-[30px] tracking-[2px] mb-5 pb-4 border-b border-[rgba(102,0,0,0.35)] [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
          Tournament Specification
        </h4>

        <ul className="flex flex-col">
          {rows.map((row, i) => (
            <li
              key={i}
              className="flex justify-between items-center gap-3 py-[13px] rounded-md border-b border-white/5 last:border-b-0 transition-all duration-200 hover:bg-[rgba(139,0,0,0.06)] hover:pl-2.5"
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
    <section className="relative z-[2] mt-[100px] px-5">
      {/* Side by side from lg, stacked below it — two of these blocks in one
          narrow column would be a very long scroll. items-stretch so both
          specification panels end level however many rows each has. */}
      <div className="mx-auto grid max-w-6xl items-stretch gap-8 lg:grid-cols-2 lg:gap-6">
        {TOURNAMENTS.map((t) => (
          <Tournament key={t.id} {...t} />
        ))}
      </div>
    </section>
  );
}
