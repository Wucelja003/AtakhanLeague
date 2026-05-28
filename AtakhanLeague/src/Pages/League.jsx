export default function League() {
  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-20 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        {/* Eyebrow + heading */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Coming Soon
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            The League
          </h1>
        </div>

        {/* Main message */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-12 py-12 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in">
          <p className="font-body text-[19px] leading-9 text-neutral-300 text-center">
            League information will be published on this website and across our official
            social media channels. Stay tuned, summoner — the call to arms is near.
          </p>

          {/* Decorative divider */}
          <div className="my-10 h-[2px] mx-auto w-32 bg-[linear-gradient(90deg,transparent,#DC143C,transparent)]" />

          {/* Quote */}
          <blockquote className="text-center">
            <p className="font-orbitron text-[20px] italic leading-relaxed text-neutral-300 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
              "In the silence before the chant, even gods hold their breath —
              for the Rift answers only to those who dare to fight."
            </p>
            <footer className="mt-6 flex justify-end">
              <span className="font-slogan text-[12px] font-bold uppercase tracking-[3px] text-secondary">
                — Atakhan League
              </span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
