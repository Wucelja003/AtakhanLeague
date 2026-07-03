const specs = [
  { key: 'Date', val: '15 — 16 Aug 2026' },
  { key: 'Teams', val: '8' },
  { key: 'Format', val: 'Single Elim' },
  { key: 'Divisions', val: 'Gold IV – Diamond III' },
  { key: 'Entry', val: '6€ / player' },
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
      <div className="w-full max-w-[900px] flex flex-col gap-6">

        {/* ===== HERO BANNER ===== */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(220,20,60,0.4)] shadow-[0_0_70px_rgba(139,0,0,0.4)] animate-form-fade-in">
          <img
            src="/summerSplitTournament.jpg"
            alt="Summer Split Tournament"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* dark bottom-up gradient so text is legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/20" />
          {/* crimson vignette for the brutal glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,20,60,0.35),transparent_60%)]" />
          {/* top crimson hairline accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[linear-gradient(90deg,transparent,#DC143C,#8B0000,#DC143C,transparent)]" />

          <div className="relative px-6 sm:px-10 pt-44 sm:pt-64 pb-8">
            <p className="font-slogan text-[11px] sm:text-[13px] font-bold uppercase tracking-[5px] text-[#DC143C] mb-3 [text-shadow:0_0_14px_rgba(220,20,60,0.7)]">
              Atakhan League Presents
            </p>
            <h2 className="font-heading text-white text-[46px] sm:text-[78px] leading-[0.85] tracking-[2px] uppercase [text-shadow:0_0_26px_rgba(139,0,0,0.9),0_0_64px_rgba(220,20,60,0.55)]">
              Summer Split<br />
              <span className="text-[#DC143C]">Tournament</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              <Pill>15 — 16 August 2026</Pill>
              <Pill>8 Teams</Pill>
              <Pill>Single Elimination</Pill>
            </div>
          </div>
        </div>

        {/* ===== PRIZE POOL ===== */}
        <div>
          <h3 className="font-heading text-white text-[22px] sm:text-[26px] tracking-[3px] uppercase mb-3 [text-shadow:0_0_16px_rgba(139,0,0,0.6)]">
            Prize Pool
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { place: '1st', label: 'Champion',  val: '200 €',         accent: 'text-[#DC143C]' },
              { place: '2nd', label: 'Runner-Up', val: 'Legendary Skin', accent: 'text-neutral-300' },
              { place: '3rd', label: 'Third',     val: '1380 RP',        accent: 'text-neutral-300' },
            ].map((p) => (
              <div
                key={p.place}
                className="rounded-xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-5 py-4 backdrop-blur-md transition-all duration-200 hover:border-[#DC143C]"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`font-heading text-[20px] leading-none ${p.accent}`}>{p.place}</span>
                  <span className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#777]">{p.label}</span>
                </div>
                <p className="font-heading text-white text-[24px] leading-tight tracking-wide">
                  {p.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SPEC GRID ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {specs.map((s) => (
            <div
              key={s.key}
              className="rounded-xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-4 py-4 backdrop-blur-md text-center transition-all duration-200 hover:border-[#DC143C] hover:shadow-[0_0_24px_rgba(220,20,60,0.3)]"
            >
              <p className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#777] mb-2">
                {s.key}
              </p>
              <p className="font-heading text-white text-[19px] leading-tight tracking-wide">
                {s.val}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
