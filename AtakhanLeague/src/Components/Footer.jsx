import { Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import useReveal from '../utils/useReveal';
import { FaDiscord, FaInstagram, FaTiktok } from 'react-icons/fa6';
// Lazy — keeps three.js out of the main bundle
// Decoration at the very bottom of every page — and it drags three.js in with
// it. Rendered unconditionally it was pulling that down on every page load, so
// it waits until the footer is actually reached.
const RisingLines = lazy(() => import('./RisingLines'));

const socials = [
  { label: 'Discord', Icon: FaDiscord, href: 'https://discord.gg/WuNn2G8PxY' },
  { label: 'Instagram', Icon: FaInstagram, href: 'https://www.instagram.com/atakhanleague' },
  { label: 'TikTok', Icon: FaTiktok, href: 'https://www.tiktok.com/@atakhanleague' },
];

const navLinks = [
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/league', label: 'League' },
  { to: '/rankings', label: 'Summoner Rankings' },
  { to: '/contact-us', label: 'Contact us' },
  { to: '/terms', label: 'Terms&Conditions' },
];

const legalLinks = [
  { to: '/terms', label: 'Terms of use' },
  { to: '/terms', label: 'Privacy' },
  { to: '/terms', label: 'Cookies' },
];

export default function Footer() {
  // `shown` here just means "the footer came into view", which is when the
  // three.js chunk is finally worth fetching.
  const { ref, shown: nearFooter } = useReveal({ threshold: 0 });

  return (
    <footer
      ref={ref}
      className="relative z-[2] mt-24 px-5 pt-14 border-t-2 border-[rgba(139,0,0,0.4)] shadow-[0_-1px_30px_rgba(139,0,0,0.15)] overflow-hidden"
    >
      {/* Rising-lines animation band, all the way at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] z-0 pointer-events-none">
        {nearFooter && (
          <Suspense fallback={null}>
            <RisingLines color="#DC143C" horizonColor="#8B0000" haloColor="#FF3B57" />
          </Suspense>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl grid gap-12 md:grid-cols-[1fr_auto] items-start pb-10">
        {/* Left: logo + name + socials */}
        <div className="flex flex-col items-start gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/MainLogoAtakhan.png"
              alt="Atakhan League"
              className="w-[60px] h-auto [filter:drop-shadow(0_0_20px_rgba(139,0,0,0.5))] transition-[filter] duration-300 hover:[filter:drop-shadow(0_0_32px_rgba(139,0,0,0.85))]"
            />
            <span className="font-heading text-white text-[26px] sm:text-[30px] tracking-[3px] uppercase leading-none [text-shadow:0_0_18px_rgba(139,0,0,0.7),0_0_40px_rgba(102,0,0,0.4)]">
              Atakhan <span className="text-secondary">League</span>
            </span>
          </Link>

          <p className="font-body text-[14px] text-neutral-400 max-w-xs">
            Community-run League of Legends tournaments. Compete, climb, conquer the Rift.
          </p>

          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="group grid place-items-center w-12 h-12 rounded-xl text-[#DC143C] bg-[rgba(139,0,0,0.08)] border border-[rgba(220,20,60,0.35)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#DC143C] hover:bg-[rgba(220,20,60,0.15)] hover:shadow-[0_0_22px_rgba(220,20,60,0.5)]"
              >
                <s.Icon
                  aria-hidden="true"
                  focusable="false"
                  className="w-[22px] h-[22px] transition-transform duration-300 group-hover:scale-110"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Right: nav columns */}
        <div className="flex flex-wrap gap-x-16 gap-y-8">
          <div className="flex flex-col gap-3">
            <h3 className="font-slogan text-[13px] font-bold tracking-[2px] uppercase text-secondary mb-1">
              Navigation
            </h3>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="font-body text-[15px] text-neutral-400 transition-colors duration-300 hover:text-secondary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-slogan text-[13px] font-bold tracking-[2px] uppercase text-secondary mb-1">
             E-mail            
             </h3>
            <p className="font-body text-[15px] text-neutral-400">atakhanleague@gmail.com</p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-slogan text-[13px] font-bold tracking-[2px] uppercase text-secondary mb-1">
              Legal
            </h3>
            {legalLinks.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="font-body text-[15px] text-neutral-400 transition-colors duration-300 hover:text-secondary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Big brand watermark */}
      <h2 className="relative z-10 select-none text-center text-[clamp(48px,12vw,100px)] font-bold leading-none text-transparent bg-clip-text bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(123,26,26,1)_50%,rgba(0,0,0,0.5)_100%)] [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.5))_drop-shadow(0_1px_2px_rgba(0,0,0,0.8))]">
        Atakhan League
      </h2>
    </footer>
  );
}
