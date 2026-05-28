const info = [
  { key: 'Date', val: '28.06 2026.' },
  { key: 'Number of Teams', val: '4' },
  { key: 'Divisions', val: 'All Divisions' },
  { key: 'Registration Fee', val: 'Free' },
  { key: '1st Place', val: '5 Epic skins', color: 'text-accent-gold' },
  { key: '2nd Place', val: '1000rp', color: 'text-[#b4b4c8]' },
 // { key: '3rd Place', val: '1000 RP', color: 'text-[#b06528]' },
];

export default function TournamentInfo() {
  return (
    <section className="relative z-[2] mt-[100px] px-5 flex justify-center">
      <div className="w-full max-w-[700px] min-h-[600px] rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-[60px] py-[52px] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.18),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in">
        <h2 className="font-heading text-white text-[42px] tracking-[2px] mb-9 pb-5 border-b border-[rgba(102,0,0,0.35)] [text-shadow:0_0_18px_rgba(139,0,0,0.8)]">
          Tournament Specification
        </h2>

        <ul className="flex flex-col">
          {info.map((row, i) => (
            <li
              key={i}
              className="flex justify-between items-center py-[18px] rounded-md border-b border-white/5 last:border-b-0 transition-all duration-200 hover:bg-[rgba(139,0,0,0.06)] hover:pl-2.5"
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
    </section>
  );
}
