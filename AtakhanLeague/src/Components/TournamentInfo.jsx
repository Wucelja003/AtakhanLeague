const rows = [
  { key: 'Date', val: '15 August 2026' },
  { key: 'Server' , val: 'EUNE'},
  { key: 'Start', val: '18:00 CET' },
  { key: 'Number of Teams', val: '8' },
  { key: 'Format', val: 'Single Elimination' },
  { key: 'Divisions', val: 'Gold IV – Diamond III' },
  { key: 'Registration Fee', val: '6€ / player' },
  { key: '1st Place', val: '200 €', color: 'text-[#DC143C]' },
  { key: '2nd Place', val: 'Legendary Skin' },
  { key: '3rd Place', val: '1380 RP' },
];

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-slogan text-[11px] sm:text-[13px] font-bold uppercase tracking-[2px] text-white border border-[rgba(220,20,60,0.5)] bg-[rgba(139,0,0,0.25)] backdrop-blur-md shadow-[0_0_16px_rgba(139,0,0,0.35)]">
      {children}
    </span>
  );
}

export default function TournamentInfo() {
  return (
    <section className="relative z-[2] mt-[100px] px-5 flex justify-center">
      <div className="w-full max-w-[860px] flex flex-col gap-6">

        {/* ===== HERO BANNER ===== */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(220,20,60,0.4)] shadow-[0_0_70px_rgba(139,0,0,0.4)] animate-form-fade-in">
          <img
            src="ThumbnailTournament.jpg"
            alt="Summer Split Tournament"
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
              The Chaos Begins<br />
              <span className="text-[#DC143C]">Tournament</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              <Pill>15 August 2026</Pill>
              <Pill>8 Teams</Pill>
              <Pill>Single Elimination</Pill>
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
    </section>
  );
}
