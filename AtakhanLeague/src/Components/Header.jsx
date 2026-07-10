import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../redux/user/userSlice';
import LogoutConfirm from './LogoutConfirm';
import './Header.css';

const navLinks = [
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/league', label: 'League' },
  { to: '/rankings', label: 'Summoner Rankings' },
  { to: '/contact-us', label: 'Contact us' },
  { to: '/terms', label: 'Terms&Conditions' },
];

const btnBase =
  'btn-ripple relative overflow-hidden rounded-[20px] px-6 py-[15px] font-slogan text-[11px] font-bold uppercase tracking-[2px] cursor-pointer transition-all duration-300 border-0 hover:-translate-y-0.5';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  // Auto-close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function handleSignOut() {
    setShowLogout(false);
    try {
      await fetch(api('/auth/signout'), { method: 'POST', credentials: 'include' });
    } catch (_) {}
    dispatch(signOut());
    navigate('/');
    setOpen(false);
  }

  return (
    <header className="relative z-[20] max-h-[100px] px-5 py-[15px] animate-header-effect">
      <div className="flex items-center justify-between">
        <Link to="/" className="shrink-0 flex items-center gap-3">
          <img
            src="/MainLogoAtakhan-2.svg"
            alt="Atakhan League logo"
            className="h-[52px] sm:h-[68px] lg:h-[84px] w-auto [filter:drop-shadow(0_0_18px_rgba(139,0,0,0.7))]"
          />
          <span className="font-heading text-white text-[18px] sm:text-[24px] lg:text-[30px] tracking-[3px] uppercase [text-shadow:0_0_18px_rgba(139,0,0,0.7),0_0_40px_rgba(102,0,0,0.4)] whitespace-nowrap">
            Atakhan <span className="text-secondary">League</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex nav-glass flex-nowrap gap-6 xl:gap-10 rounded-full bg-black/40 px-6 xl:px-[30px] py-[15px] backdrop-blur-xl shadow-[0_8px_32px_rgba(139,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="nav-link relative font-nav text-[14px] xl:text-[17px] font-bold text-secondary no-underline whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex gap-3 lg:gap-5">
          {currentUser ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className={`${btnBase} text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login hover:animate-wind-flow-fast hover:shadow-[0_0_20px_rgba(102,0,0,0.8)] max-w-[180px] truncate`}
              >
                {currentUser.username || 'Profile'}
              </button>
              <button
                onClick={() => setShowLogout(true)}
                className={`${btnBase} text-neutral-300 border border-[rgba(102,0,0,0.4)] bg-[length:300%_300%] bg-[linear-gradient(270deg,#1a1a1a,#2d2d2d,#3a3a3a,#2d2d2d,#1a1a1a)] animate-wind-flow-register hover:animate-wind-flow-fast hover:text-white hover:border-[#660000] hover:shadow-[0_0_20px_rgba(102,0,0,0.4)]`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/sign-in')}
                className={`${btnBase} text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login hover:animate-wind-flow-fast hover:shadow-[0_0_20px_rgba(102,0,0,0.8)]`}
              >
                Login
              </button>
              <button
                onClick={() => navigate('/sign-up')}
                className={`${btnBase} text-neutral-300 border border-[rgba(102,0,0,0.4)] bg-[length:300%_300%] bg-[linear-gradient(270deg,#1a1a1a,#2d2d2d,#3a3a3a,#2d2d2d,#1a1a1a)] animate-wind-flow-register hover:animate-wind-flow-fast hover:text-white hover:border-[#660000] hover:shadow-[0_0_20px_rgba(102,0,0,0.4)]`}
              >
                Registration
              </button>
            </>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="md:hidden relative w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-full bg-black/40 border border-[rgba(102,0,0,0.4)] backdrop-blur-md transition-colors hover:border-[#DC143C] z-[30]"
        >
          <span
            className={`block w-5 h-[2px] bg-secondary transition-all duration-300 ${
              open ? 'translate-y-[7px] rotate-45 bg-[#DC143C]' : ''
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-secondary transition-all duration-300 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-secondary transition-all duration-300 ${
              open ? '-translate-y-[7px] -rotate-45 bg-[#DC143C]' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[10] transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Drawer content */}
        <div
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[rgba(10,10,10,0.95)] border-l border-[rgba(102,0,0,0.4)] shadow-[-8px_0_32px_rgba(220,20,60,0.3)] flex flex-col px-7 pt-24 pb-8 transition-transform duration-500 ease-out ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Nav links */}
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                to={link.to}
                className="font-nav text-secondary text-[18px] font-bold py-3 border-b border-[rgba(102,0,0,0.25)] transition-colors hover:text-[#DC143C]"
                style={{
                  animation: open ? `mobileItemIn 0.4s ease ${i * 0.07}s both` : 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="mt-8 flex flex-col gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className={`${btnBase} w-full text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login`}
                >
                  {currentUser.username || 'Profile'}
                </button>
                <button
                  onClick={() => setShowLogout(true)}
                  className={`${btnBase} w-full text-neutral-300 border border-[rgba(102,0,0,0.4)] bg-[length:300%_300%] bg-[linear-gradient(270deg,#1a1a1a,#2d2d2d,#3a3a3a,#2d2d2d,#1a1a1a)] animate-wind-flow-register`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/sign-in')}
                  className={`${btnBase} w-full text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/sign-up')}
                  className={`${btnBase} w-full text-neutral-300 border border-[rgba(102,0,0,0.4)] bg-[length:300%_300%] bg-[linear-gradient(270deg,#1a1a1a,#2d2d2d,#3a3a3a,#2d2d2d,#1a1a1a)] animate-wind-flow-register`}
                >
                  Registration
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mobileItemIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <LogoutConfirm
        open={showLogout}
        onConfirm={handleSignOut}
        onCancel={() => setShowLogout(false)}
      />
    </header>
  );
}
