// Crimson glow divider between sections — gradient line with a soft halo and a
// gently pulsing diamond in the middle. Purely decorative.
export default function GlowDivider() {
  return (
    <div aria-hidden className="relative z-[2] flex justify-center my-10 sm:my-16">
      <div className="relative h-[2px] w-[80%] max-w-[1400px] bg-[linear-gradient(90deg,transparent_0%,rgba(139,0,0,0.35)_18%,#DC143C_50%,rgba(139,0,0,0.35)_82%,transparent_100%)] shadow-[0_0_22px_rgba(220,20,60,0.35)]">
        {/* soft halo behind the center */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[radial-gradient(circle,rgba(220,20,60,0.35),transparent_70%)]" />
        {/* pulsing diamond */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-[#DC143C] shadow-[0_0_16px_rgba(220,20,60,0.9)] animate-pulse" />
      </div>
    </div>
  );
}
