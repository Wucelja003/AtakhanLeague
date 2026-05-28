import { Link } from 'react-router-dom';

const socials = [
  { label: 'Discord', img: '/Icons/Discord-icon.svg', href: '#' },
  { label: 'Instagram', img: '/Icons/Instragram-icon.svg', href: '#' },
  { label: 'TikTok', img: '/Icons/tiktok-icon.svg', href: '#' },
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
  return (
    <footer className="relative z-[2] mt-24 px-5 pt-14 border-t-2 border-[rgba(139,0,0,0.4)] shadow-[0_-1px_30px_rgba(139,0,0,0.15)]">
      <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-[1fr_auto] items-start pb-10">
        {/* Left: logo + socials */}
        <div className="flex flex-col items-start gap-7">
          <Link to="/">
            <img
              src="/mainDemon-removebg-preview.png"
              alt="Atakhan League"
              className="w-[120px] h-auto [filter:drop-shadow(0_0_20px_rgba(139,0,0,0.5))] transition-[filter] duration-300 hover:[filter:drop-shadow(0_0_32px_rgba(139,0,0,0.85))]"
            />
          </Link>

          <div className="flex gap-7">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="group flex flex-col items-center gap-2 font-body text-[13px] text-neutral-400 transition-colors duration-300 hover:text-secondary"
              >
                <img
                  src={s.img}
                  alt={s.label}
                  className="w-10 h-10 object-contain grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                />
                <span>{s.label}</span>
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
              About Us
            </h3>
            <p className="font-body text-[15px] text-neutral-400">admin@atakhanleague.com</p>
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
      <h2 className="select-none text-center text-[clamp(48px,12vw,100px)] font-bold leading-none text-transparent bg-clip-text bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_0%,rgba(123,26,26,1)_50%,rgba(0,0,0,0.5)_100%)] [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.5))_drop-shadow(0_1px_2px_rgba(0,0,0,0.8))]">
        Atakhan League
      </h2>
    </footer>
  );
}
