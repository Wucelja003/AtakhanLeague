import VideoBackground from '../Components/VideoBackground';
import Introduce from '../Components/Introduce';
import Journey from '../Components/Journey';
import TournamentInfo from '../Components/TournamentInfo';
import Registration from '../Components/Registration';
import PlayersPool from '../Components/PlayersPool';
import DiscordSection from '../Components/DiscordSection';

export default function Home() {
  return (
    <>
    <VideoBackground />
    <section className="relative z-[2] min-h-[calc(100vh-100px)] pt-[200px] flex">
      <div className="mx-auto flex flex-col items-center">
        <h2 className="font-body text-[35px] text-secondary animate-fade-in-down mb-2">
          Welcome to
        </h2>

        <h1 className="select-none text-center text-[clamp(48px,12vw,100px)] font-bold leading-none text-transparent bg-clip-text bg-[linear-gradient(90deg,rgba(15,15,15,1)_0%,rgba(123,26,26,1)_50%,rgba(10,10,10,1)_100%)] [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.5))_drop-shadow(0_1px_2px_rgba(0,0,0,0.8))]">
          Atakhan League
        </h1>

        <h3 className="text-[25px] text-center text-secondary font-orbitron [text-shadow:0_1px_6px_rgba(0,0,0,0.7),0_1px_2px_rgba(0,0,0,0.8)] animate-fade-in-up">
          Where every player gets a chance to fight, every team gets a shot at glory,
          and the Rift remembers the name of every champion who dared to compete.
        </h3>

        <div className="mt-[50px] flex flex-col items-center gap-5">
          <p className="px-[30px] py-3 rounded-full font-slogan text-[14px] font-bold uppercase tracking-[3px] text-[#cc3333] border border-[rgba(139,0,0,0.6)] bg-[rgba(123,26,26,0.12)] backdrop-blur-md shadow-[0_0_16px_rgba(139,0,0,0.25),inset_0_0_12px_rgba(139,0,0,0.08)] animate-fade-in-up-delayed">
            Next Tournament: 28. June 2026.
          </p>

          <button
            className="px-[45px] py-4 rounded-[20px] font-slogan text-[14px] font-bold uppercase tracking-[3px] text-white border-0 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] shadow-[0_4px_24px_rgba(139,0,0,0.4)] animate-wind-flow-login transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_6px_36px_rgba(220,20,60,0.6)]"
          >
            Join the Tournament
          </button>
        </div>
      </div>
    </section>
    <Introduce />
    <Journey />
    <TournamentInfo />
    <Registration />
    <PlayersPool />
    <DiscordSection />
    </>
  );
}
