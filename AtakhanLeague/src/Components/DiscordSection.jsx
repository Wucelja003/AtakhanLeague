export default function DiscordSection() {
  return (
    <section className="relative z-[2] mt-[100px] px-5 pb-20">
      <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-between gap-8 rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-12 py-10 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.18),inset_0_0_24px_rgba(102,0,0,0.06)]">
        {/* Left: text + link */}
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-white text-[40px] leading-none tracking-[1px] [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
            Join Our Discord Server
          </h2>
          <a
            href="https://discord.gg/atakhanleague"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-slogan text-[16px] tracking-wider text-secondary transition-colors duration-300 hover:text-[#DC143C]"
          >
            discord.gg/atakhanleague
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Right: greyed Discord logo */}
        <img
          src="/Icons/Discord-icon.svg"
          alt="Discord"
          className="w-[90px] h-[90px] object-contain grayscale opacity-70 transition-all duration-300 hover:opacity-100 hover:scale-105"
        />
      </div>
    </section>
  );
}
