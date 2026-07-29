import { FaDiscord } from 'react-icons/fa6';
import { SiKick } from 'react-icons/si';
import useReveal from '../utils/useReveal';

// A touch of each platform's own colour on the icon and its glow, so the cards
// read as Discord and Kick at a glance. Everything structural stays crimson —
// full brand colouring would fight the rest of the site.
const CHANNELS = [
  {
    key: 'discord',
    Icon: FaDiscord,
    name: 'Discord',
    tagline: 'Find a team, catch match pings, and talk to the organisers directly.',
    cta: 'Join the server',
    href: 'https://discord.gg/WuNn2G8PxY',
    accent: '#5865F2',
    glow: 'rgba(88,101,242,0.45)',
  },
  {
    key: 'kick',
    Icon: SiKick,
    name: 'Kick',
    tagline: 'Every tournament streamed live, with casting on the big matches.',
    cta: 'Follow the channel',
    href: 'https://kick.com/atakhanleague',
    accent: '#53FC18',
    glow: 'rgba(83,252,24,0.4)',
  },
];

export default function CommunitySection() {
  const { ref, at, fade, grow } = useReveal({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative z-[2] mt-[100px] px-5 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div
            className={`mb-4 inline-flex items-center gap-3 ${fade('animate-reveal-up')}`}
            style={at(0.1)}
          >
            <span className="h-px w-8 bg-[#DC143C]" />
            <span className="font-orbitron text-[11px] font-bold uppercase tracking-[4px] text-[#DC143C]">
              Community
            </span>
            <span className="h-px w-8 bg-[#DC143C]" />
          </div>

          <h2
            className={`font-cinzel text-[28px] font-semibold leading-tight text-white sm:text-[36px] [text-shadow:0_0_22px_rgba(139,0,0,0.85),0_0_50px_rgba(102,0,0,0.45)] ${fade(
              'animate-reveal-up'
            )}`}
            style={at(0.2)}
          >
            Where the League lives
          </h2>

          <span
            className={`mx-auto mt-5 block h-[3px] w-[180px] origin-center rounded-full bg-[linear-gradient(90deg,transparent,#DC143C,transparent)] ${grow(
              'animate-reveal-sweep',
              'scale-x-0'
            )}`}
            style={at(0.32)}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {CHANNELS.map((c, i) => (
            <a
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              style={at(0.42 + i * 0.12)}
              className={`group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.65)] px-8 py-9 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(220,20,60,0.55)] hover:shadow-[0_10px_40px_rgba(139,0,0,0.35)] ${fade(
                'animate-reveal-up'
              )}`}
            >
              {/* Light raking across the card on hover. Sits behind the content
                  and can't take the pointer, or it would eat the link's hover. */}
              <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)] transition-transform duration-700 group-hover:translate-x-[420%]" />

              <span
                className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-[rgba(102,0,0,0.45)] bg-black/50 transition-transform duration-300 group-hover:scale-110"
                style={{ boxShadow: `0 0 0 0 ${c.glow}` }}
              >
                <c.Icon
                  className="h-7 w-7 transition-all duration-300"
                  style={{ color: c.accent, filter: `drop-shadow(0 0 10px ${c.glow})` }}
                />
              </span>

              <div className="relative">
                <h3 className="font-heading text-[26px] leading-none tracking-wide text-white">
                  {c.name}
                </h3>
                <p className="mt-2 font-body text-[14px] leading-6 text-neutral-400">{c.tagline}</p>
              </div>

              <span className="relative mt-auto inline-flex items-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[2px] text-[#cc3333] transition-colors duration-300 group-hover:text-[#DC143C]">
                {c.cta}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
