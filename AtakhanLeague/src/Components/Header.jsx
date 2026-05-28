import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../redux/user/userSlice';
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
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  async function handleSignOut() {
    try {
      await fetch(api('/auth/signout'), { method: 'POST', credentials: 'include' });
    } catch (_) {
      // ignore network errors — we sign out locally anyway
    }
    dispatch(signOut());
    navigate('/');
  }

  return (
    <header className="relative z-[2] max-h-[100px] px-5 py-[15px] animate-header-effect">
      <div className="flex items-center justify-between">
        <Link to="/">
          <img src="/AtakhanMainLogo.svg" alt="Atakhan League" height={70} />
        </Link>

        <nav className="nav-glass flex flex-nowrap gap-10 rounded-full bg-black/40 px-[30px] py-[15px] backdrop-blur-xl shadow-[0_8px_32px_rgba(139,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]">
          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="nav-link relative font-nav text-[17px] font-bold text-secondary no-underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-5">
          {currentUser ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className={`${btnBase} text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login hover:animate-wind-flow-fast hover:shadow-[0_0_20px_rgba(102,0,0,0.8)]`}
              >
                {currentUser.username || 'Profile'}
              </button>
              <button
                onClick={handleSignOut}
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
      </div>
    </header>
  );
}
