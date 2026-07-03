import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import { api } from '../api';

const teamFields = [
  { name: 'playerName', label: 'Summoner name', type: 'text', placeholder: 'YourSummonerName' },
  { name: 'teamName', label: 'Team Name', type: 'text', placeholder: 'Demacian Kings' },
  { name: 'division', label: 'Ranked Division', type: 'text', placeholder: 'Emerald 2' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'atakhanleague@gmail.com' },
];

const individualFields = [
  { name: 'playerName', label: 'Game Name', type: 'text', placeholder: 'YourSummonerName' },
  { name: 'division', label: 'Ranked Division', type: 'text', placeholder: 'Emerald 2' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'atakhanleague@gmail.com' },
];

export default function Registration() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <section className="relative z-[2] mt-[100px] px-5 py-4">
      <div>
        <div className="flex flex-col items-center text-center">
          <span className="font-slogan text-[12px] font-bold uppercase tracking-[5px] text-secondary">
            Next Tournament
          </span>
          <h2 className="mt-3 font-heading text-[52px] leading-none tracking-[2px] text-transparent bg-clip-text bg-[linear-gradient(90deg,#660000,#DC143C,#660000)] [filter:drop-shadow(0_0_18px_rgba(139,0,0,0.5))]">
            15 - 16. August 2026.
          </h2>
          <span className="mt-5 h-[2px] w-24 rounded-full bg-[linear-gradient(90deg,transparent,#DC143C,transparent)]" />
        </div>

        {!currentUser ? (
          // Not logged in — show prompt instead of forms
          <div className="mt-[50px] flex justify-center">
            <div className="w-full max-w-lg rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-10 py-10 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(220,20,60,0.12)] border border-[rgba(220,20,60,0.3)] mb-5">
                <svg className="w-6 h-6 text-[#DC143C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-heading text-white text-[28px] leading-none tracking-wide [text-shadow:0_0_14px_rgba(139,0,0,0.6)] mb-3">
                Sign in to register
              </h3>
              <p className="font-body text-[15px] leading-7 text-neutral-400 mb-7">
                You must be signed in to your Atakhan League account before
                registering for the tournament. Create one if you don't have it yet —
                it only takes a moment.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate('/sign-in')}
                  className="btn-ripple relative overflow-hidden px-7 py-3 rounded-xl font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white border-0 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_0_24px_rgba(220,20,60,0.6)]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/sign-up')}
                  className="px-7 py-3 rounded-xl font-slogan text-[12px] font-bold uppercase tracking-[3px] text-neutral-300 border border-[rgba(102,0,0,0.4)] bg-black/40 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:border-[#660000] hover:shadow-[0_0_20px_rgba(102,0,0,0.4)]"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Logged in — show the actual forms
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 lg:gap-[100px] mt-[50px]">
            <RegistrationForm
              title="Team Registration for the Tournament"
              fields={teamFields}
              buttonLabel="Register Team"
              endpoint={api('/registration/team')}
              needsRole
              attention="The team captain needs to register on behalf of the entire squad. The remaining player details will be collected at a later stage. Good luck out there, summoner!"
            />
            <RegistrationForm
              title="Individual Registration for the Tournament"
              fields={individualFields}
              buttonLabel="Register"
              endpoint={api('/registration/individual')}
              needsRole
              attention="Individual registration is for solo players looking to be placed on a team or compete independently. Step up and make your mark!"
            />
          </div>
        )}
      </div>
    </section>
  );
}
