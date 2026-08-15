import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SEO from '../Components/SEO';
import VideoBackground from '../Components/VideoBackground';
import StreamBanner from '../Components/StreamBanner';
import Introduce from '../Components/Introduce';
import useReveal from '../utils/useReveal';
// The heaviest thing on the page — framer-motion plus six demo components,
// 181 KB of it. Being lazy() alone did nothing: React starts the import as soon
// as the component renders, and this rendered unconditionally, so the chunk was
// landing 57ms into every visit. It has to be withheld from the tree until the
// section is near, which is what DeferredJourney below does.
const TournamentJourney = lazy(() => import('../Components/TournamentJourney'));

function DeferredJourney() {
  // Fetched a little before it's reached, so the chunk is ready by the time it
  // scrolls in rather than popping in late.
  const { ref, shown } = useReveal({ threshold: 0, rootMargin: '400px' });
  return (
    <div ref={ref} className="min-h-[60vh]">
      {shown && (
        <Suspense fallback={null}>
          <TournamentJourney />
        </Suspense>
      )}
    </div>
  );
}
import GlowDivider from '../Components/GlowDivider';
import ChampionQuotes from '../Components/ChampionQuotes';
import TournamentInfo from '../Components/TournamentInfo';
import Registration from '../Components/Registration';
import TournamentBoard from '../Components/TournamentBoard';
import PlayersPool from '../Components/PlayersPool';
import CommunitySection from '../Components/CommunitySection';

// Target: 15 August 2026 at 18:00 (Belgrade / Central European Summer Time)
const TOURNAMENT_DATE = new Date('2026-08-15T18:00:00+02:00');

function getTimeLeft() {
  const diff = TOURNAMENT_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

function Countdown() {
  const [t, setT] = useState(getTimeLeft());
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (t.ended) {
    return (
      <p className="font-slogan text-[13px] sm:text-[15px] font-bold uppercase tracking-[3px] text-[#DC143C]">
        Tournament is live
      </p>
    );
  }

  const cells = [
    { value: t.days, label: 'Days' },
    { value: t.hours, label: 'Hours' },
    { value: t.minutes, label: 'Min' },
    { value: t.seconds, label: 'Sec' },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3 animate-fade-in-up-delayed">
      {cells.map((c, i) => (
        <div key={c.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center min-w-[54px] sm:min-w-[70px] rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 bg-black/55 border border-[rgba(102,0,0,0.45)] backdrop-blur-md shadow-[0_0_18px_rgba(139,0,0,0.25)]">
            <span className="font-heading text-white text-[26px] sm:text-[36px] leading-none tabular-nums [text-shadow:0_0_12px_rgba(220,20,60,0.5)]">
              {String(c.value).padStart(2, '0')}
            </span>
            <span className="font-slogan text-[9px] sm:text-[10px] uppercase tracking-[2px] text-neutral-400 mt-0.5">
              {c.label}
            </span>
          </div>
          {i < cells.length - 1 && (
            <span className="font-heading text-[18px] sm:text-[24px] text-[#DC143C] leading-none">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((s) => s.user);

  function handleJoinClick() {
    if (!currentUser) {
      navigate('/sign-up');
      return;
    }
    const target = document.getElementById('registration-section');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <SEO
        path="/"
        description="Atakhan League — community-run League of Legends tournament platform. Register your team or sign up as an individual summoner and compete in the next tournament."
      />
      <VideoBackground />
      <StreamBanner />
      {/* Less top padding than before: the hero now spaces itself from the
          banner rather than from the top of the page. */}
      <section className="relative z-[2] min-h-[calc(100vh-100px)] pt-[56px] sm:pt-[110px] px-4 flex">
        <div className="mx-auto flex flex-col items-center">
          

          <h1 className="select-none text-center text-[clamp(36px,12vw,100px)] font-bold leading-[1.2] text-transparent bg-clip-text bg-[linear-gradient(90deg,rgba(123,26,26,1)_50%)] [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.5))_drop-shadow(0_1px_2px_rgba(0,0,0,0.8))] animate-hero-rise">
            Atakhan League
          </h1>

          <h3 className=" text-[15px] sm:text-[20px] md:text-[25px] text-center text-white font-orbitron [text-shadow:0_1px_6px_rgba(0,0,0,0.7),0_1px_2px_rgba(0,0,0,0.8)] animate-fade-in-up max-w-2xl">
            Where every player gets a chance to fight, every team gets a shot at glory,
            and the Rift remembers the name of every champion who dared to compete.
          </h3>

          <div className="mt-[30px] sm:mt-[50px] flex flex-col items-center gap-4 sm:gap-5">
            <p className="px-5 sm:px-[30px] py-2.5 sm:py-3 rounded-full font-slogan text-[11px] sm:text-[14px] font-bold uppercase tracking-[2px] sm:tracking-[3px] text-[#cc3333] border border-[rgba(139,0,0,0.6)] bg-[rgba(123,26,26,0.12)] backdrop-blur-md shadow-[0_0_16px_rgba(139,0,0,0.25),inset_0_0_12px_rgba(139,0,0,0.08)] animate-fade-in-up-delayed text-center">
              Next Tournament: 15 August 2026 · 18:00
            </p>

            <Countdown />

            <button
              onClick={handleJoinClick}
              className="px-8 sm:px-[45px] py-3.5 sm:py-4 rounded-[20px] font-slogan text-[12px] sm:text-[14px] font-bold uppercase tracking-[2px] sm:tracking-[3px] text-white border-0 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] shadow-[0_4px_24px_rgba(139,0,0,0.4)] animate-wind-flow-login transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_6px_36px_rgba(220,20,60,0.6)]"
            >
              {currentUser ? 'Join the Tournament' : 'Sign Up to Join'}
            </button>
          </div>
        </div>
      </section>
      <Introduce />
      <DeferredJourney />
      <GlowDivider />
      <TournamentInfo />
      <ChampionQuotes />
      <GlowDivider />
      <div id="registration-section">
        <Registration />
      </div>
      <TournamentBoard />
      <PlayersPool />
      <CommunitySection />
    </>
  );
}
