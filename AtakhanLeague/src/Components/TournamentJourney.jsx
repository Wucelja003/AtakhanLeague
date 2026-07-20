import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Fingerprint, ClipboardList, UsersRound, CreditCard, Users, KeyRound, Swords, ArrowRight, User, CalendarDays, Trophy } from 'lucide-react';
import TutorialAuthDemo from './TutorialAuthDemo';
import TutorialRosterDemo from './TutorialRosterDemo';
import TutorialPaymentDemo from './TutorialPaymentDemo';
import TutorialBoardDemo from './TutorialBoardDemo';
import TutorialScheduleDemo from './TutorialScheduleDemo';
import TutorialRankingsDemo from './TutorialRankingsDemo';

const EASE = [0.22, 1, 0.36, 1];

const steps = [
  {
    icon: Fingerprint,
    title: 'Register & sign in',
    meta: 'Start here',
    label: 'Account & sign in',
    copy: "Create your account with your Riot Summoner ID — we verify it live through Riot's API, so every player is real and rank-verified. Log in and you're ready to enter the tournament.",
    panel: 'auth',
  },
  {
    icon: ClipboardList,
    title: 'Register your team or go solo',
    meta: 'Two ways in',
    label: 'Team or solo',
    copy: "Enter the way that suits you. Register your whole squad as team captain, or sign up solo and our organizers place you on a team before the draw. Two options, one Rift — pick yours below.",
    panel: 'register',
  },
  {
    icon: UsersRound,
    title: 'Build your roster',
    meta: 'Captains',
    label: 'Your squad',
    copy: "Captains, head to your Profile and fill the four open lanes. Add each teammate by Summoner name — your own lane is locked in. Five lanes, one squad, ready for the Rift.",
    panel: 'roster',
  },
  {
    icon: CreditCard,
    title: 'Pay the entry fee',
    meta: 'Secure your slot',
    label: 'Payment',
    copy: 'Lock your spot with the entry fee — 30 € per team, 6 € solo. Pay with PayPal or crypto, whatever suits you; your place is final the moment the payment clears.',
    panel: 'pay',
  },
  {
    icon: Users,
    title: 'Get on the board & bracket',
    meta: 'Go live',
    label: 'Tournament board',
    copy: 'Once confirmed and paid, your team name appears on the public Tournament Board and solo players join the Players Pool — for the whole community to see, then into the bracket.',
    panel: 'board',
  },
  {
    icon: CalendarDays,
    title: 'Check the match schedule',
    meta: 'Fixtures',
    label: 'Match schedule',
    copy: 'The full fixture list — who plays who and when — is posted on the Tournaments page and on our Instagram. Know exactly when your match starts, Summoner.',
    panel: 'schedule',
  },
  {
    icon: KeyRound,
    title: 'Check in & get your lobby code',
    meta: 'Match day',
    label: 'Check-in & lobby',
    copy: 'Check in at least 30 minutes before the tournament on Discord. Captains then receive the lobby code on Discord — that\'s how you join the custom game.',
    panel: 'text',
    bullets: [
      'Check in on Discord ~30 minutes before the tournament',
      'Captains receive the lobby code on Discord',
      'Use the code to join the custom game lobby',
    ],
  },
  {
    icon: Swords,
    title: 'Play the tournament',
    meta: 'Conquer',
    label: 'The matches',
    copy: 'In the custom game, lock in your champions and play your matches. Win to advance through the bracket, round by round.',
    panel: 'text',
    bullets: [
      'Join the custom game with your lobby code',
      'Play your match and lock in the win',
      'Advance through the bracket toward the final',
    ],
  },
  {
    icon: Trophy,
    title: 'Climb the Summoner Rankings',
    meta: 'Glory & prizes',
    label: 'Summoner rankings',
    copy: 'Every match earns points that stack on the public Summoner Rankings. The best summoners each season take home valuable prizes — so leave your mark.',
    panel: 'rankings',
  },
];

function AuthPanel({ onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-[14px] text-neutral-400 leading-relaxed">
        These are the exact buttons in the top-right of the site. Click one to see the form —
        no account needed, it's just a preview.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onOpen('login')}
          className="flex-1 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-transform duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast"
        >
          Login
        </button>
        <button
          onClick={() => onOpen('signup')}
          className="flex-1 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-neutral-300 rounded-xl py-3.5 cursor-pointer border border-[rgba(102,0,0,0.4)] bg-[length:300%_300%] bg-[linear-gradient(270deg,#1a1a1a,#2d2d2d,#3a3a3a,#2d2d2d,#1a1a1a)] animate-wind-flow-register transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:border-[#660000]"
        >
          Registration
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(102,0,0,0.35)] bg-black/20 px-4 py-3">
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-[rgba(220,20,60,0.12)] text-[#DC143C]">
          <ArrowRight className="w-4 h-4" />
        </span>
        <span className="font-body text-[13px] text-neutral-400">
          “Login” takes returning summoners in; “Registration” creates a new account.
        </span>
      </div>
    </div>
  );
}

function RegisterPanel({ onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-[14px] text-neutral-400 leading-relaxed">
        Choose how you enter the tournament. Click an option to preview its registration form —
        no account needed, it's just a preview.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onOpen('team')}
          className="flex-1 inline-flex items-center justify-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-transform duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast"
        >
          <Users className="w-4 h-4" />
          Team
        </button>
        <button
          onClick={() => onOpen('individual')}
          className="flex-1 inline-flex items-center justify-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-neutral-300 rounded-xl py-3.5 cursor-pointer border border-[rgba(102,0,0,0.4)] bg-[length:300%_300%] bg-[linear-gradient(270deg,#1a1a1a,#2d2d2d,#3a3a3a,#2d2d2d,#1a1a1a)] animate-wind-flow-register transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:border-[#660000]"
        >
          <User className="w-4 h-4" />
          Individual
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(102,0,0,0.35)] bg-black/20 px-4 py-3">
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-[rgba(220,20,60,0.12)] text-[#DC143C]">
          <ArrowRight className="w-4 h-4" />
        </span>
        <span className="font-body text-[13px] text-neutral-400">
          Captains register the whole squad; solo players get placed on a team before the draw.
        </span>
      </div>
    </div>
  );
}

function RosterPanel({ onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-[14px] text-neutral-400 leading-relaxed">
        On your Profile, the captain fills the four open lanes by Summoner name — your own lane
        is already locked in. Click below to see how the roster fills up.
      </p>

      <button
        onClick={() => onOpen('roster')}
        className="inline-flex items-center justify-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 px-6 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-transform duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast"
      >
        <UsersRound className="w-4 h-4" />
        Preview roster builder
      </button>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(102,0,0,0.35)] bg-black/20 px-4 py-3">
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-[rgba(220,20,60,0.12)] text-[#DC143C]">
          <ArrowRight className="w-4 h-4" />
        </span>
        <span className="font-body text-[13px] text-neutral-400">
          Each lane takes one player; the captain's lane is locked. Solo players skip this step.
        </span>
      </div>
    </div>
  );
}

function PayPanel({ onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-[14px] text-neutral-400 leading-relaxed">
        Pay the entry fee from your Profile — <span className="text-white">30 €</span> per team or
        <span className="text-white"> 6 €</span> solo. Pick a method to preview how it works — no real charge.
      </p>

      <button
        onClick={() => onOpen('payment')}
        className="inline-flex items-center justify-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 px-6 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-transform duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast"
      >
        <CreditCard className="w-4 h-4" />
        Preview the entry-fee field
      </button>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(102,0,0,0.35)] bg-black/20 px-4 py-3">
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-[rgba(220,20,60,0.12)] text-[#DC143C]">
          <ArrowRight className="w-4 h-4" />
        </span>
        <span className="font-body text-[13px] text-neutral-400">
          On your Profile you pick <span className="text-neutral-200">PayPal</span> or{' '}
          <span className="text-neutral-200">Crypto</span> and finish on the provider's page.
        </span>
      </div>
    </div>
  );
}

function BoardPanel({ onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-[14px] text-neutral-400 leading-relaxed">
        This part is public. Registered teams show up by name on the <span className="text-white">Tournament Board</span>,
        and solo players in the <span className="text-white">Players Pool</span>. Preview where the names land.
      </p>

      <button
        onClick={() => onOpen('board')}
        className="inline-flex items-center justify-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 px-6 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-transform duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast"
      >
        <Users className="w-4 h-4" />
        Preview the board &amp; pool
      </button>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(102,0,0,0.35)] bg-black/20 px-4 py-3">
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-[rgba(220,20,60,0.12)] text-[#DC143C]">
          <ArrowRight className="w-4 h-4" />
        </span>
        <span className="font-body text-[13px] text-neutral-400">
          Team names hit the Board; solo names hit the Pool — then the bracket is drawn.
        </span>
      </div>
    </div>
  );
}

function SchedulePanel({ onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-[14px] text-neutral-400 leading-relaxed">
        Once the teams are set, the full <span className="text-white">fixture list</span> goes up on the
        Tournaments page — and on our Instagram. Preview how the schedule looks.
      </p>

      <button
        onClick={() => onOpen('schedule')}
        className="inline-flex items-center justify-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 px-6 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-transform duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast"
      >
        <CalendarDays className="w-4 h-4" />
        Preview the schedule
      </button>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(102,0,0,0.35)] bg-black/20 px-4 py-3">
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-[rgba(220,20,60,0.12)] text-[#DC143C]">
          <ArrowRight className="w-4 h-4" />
        </span>
        <span className="font-body text-[13px] text-neutral-400">
          Schedules are published on the site and on Instagram <span className="text-neutral-200">@atakhanleague</span>.
        </span>
      </div>
    </div>
  );
}

function RankingsPanel({ onOpen }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="font-body text-[14px] text-neutral-400 leading-relaxed">
        Results feed the public <span className="text-white">Summoner Rankings</span>. Climb the leaderboard —
        the best summoners each season win valuable prizes.
      </p>

      <button
        onClick={() => onOpen('rankings')}
        className="inline-flex items-center justify-center gap-2 font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 px-6 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-transform duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast"
      >
        <Trophy className="w-4 h-4" />
        Preview the rankings
      </button>

      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[rgba(102,0,0,0.35)] bg-black/20 px-4 py-3">
        <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-[rgba(212,175,55,0.14)] text-[#d4af37]">
          <Trophy className="w-4 h-4" />
        </span>
        <span className="font-body text-[13px] text-neutral-400">
          Top of the leaderboard = <span className="text-[#d4af37]">valuable prizes</span> each season.
        </span>
      </div>
    </div>
  );
}

function TextPanel({ step }) {
  const Icon = step.icon;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <span className="grid place-items-center w-12 h-12 shrink-0 rounded-2xl bg-[rgba(220,20,60,0.1)] border border-[rgba(102,0,0,0.4)] text-[#DC143C]">
          <Icon className="w-6 h-6" />
        </span>
        <p className="font-body text-[14px] text-neutral-300 leading-relaxed">{step.copy}</p>
      </div>

      {step.bullets && (
        <ul className="flex flex-col gap-2.5">
          {step.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-xl border border-[rgba(102,0,0,0.3)] bg-black/20 px-4 py-3"
            >
              <span className="mt-0.5 grid place-items-center w-5 h-5 shrink-0 rounded-full bg-[rgba(220,20,60,0.15)] text-[#DC143C] font-slogan text-[10px] font-bold">
                {i + 1}
              </span>
              <span className="font-body text-[13px] text-neutral-300 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SoonPanel({ Icon }) {
  return (
    <div className="grid h-full min-h-[300px] place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[rgba(220,20,60,0.1)] border border-[rgba(102,0,0,0.4)] text-[#DC143C]">
          <Icon className="w-6 h-6" />
        </span>
        <p className="font-slogan text-[12px] font-bold uppercase tracking-[3px] text-[#DC143C]">
          Walkthrough coming soon
        </p>
        <p className="font-body text-[13px] text-neutral-500 max-w-xs">
          We'll wire the interactive element for this step next.
        </p>
      </div>
    </div>
  );
}

export default function TournamentJourney() {
  const [active, setActive] = useState(0);
  const [modalMode, setModalMode] = useState(null); // 'login' | 'signup' | 'team' | 'individual' | null
  const reduce = useReducedMotion();
  const step = steps[active];
  const ActiveIcon = step.icon;

  return (
    <section className="relative z-[2] w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="font-slogan text-[11px] font-bold tracking-[4px] uppercase text-[#DC143C]">
            How it works
          </p>
          <h2 className="mt-4 font-heading text-white text-[40px] sm:text-[56px] md:text-[64px] tracking-[2px] leading-[0.95] uppercase [text-shadow:0_0_20px_rgba(139,0,0,0.8),0_0_48px_rgba(102,0,0,0.4)]">
            Tournament Journey
          </h2>
          <p className="mt-4 font-body text-[15px] sm:text-base text-neutral-400 max-w-md mx-auto">
            From sign-up to the Rift — follow the path, Summoner.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(320px,0.95fr)_1.15fr] lg:gap-14 lg:items-start">
          {/* Left: step tabs */}
          <div role="tablist" aria-label="Tournament steps" className="flex flex-col gap-2">
            {steps.map((s, i) => {
              const isActive = active === i;
              const Icon = s.icon;
              return (
                <button
                  key={s.title}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  className="relative w-full rounded-2xl px-5 py-4 text-left cursor-pointer transition-colors duration-200"
                >
                  {isActive && (
                    <motion.span
                      layoutId="tj-indicator"
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute inset-0 rounded-2xl bg-[rgba(139,0,0,0.14)] border border-[rgba(220,20,60,0.35)]"
                      aria-hidden
                    />
                  )}
                  <span className="relative flex items-start gap-4">
                    <span
                      className={`grid place-items-center w-10 h-10 shrink-0 rounded-xl border transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#DC143C] text-white border-transparent'
                          : 'bg-black/40 text-neutral-400 border-[rgba(102,0,0,0.4)]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span
                          className={`font-heading text-[18px] sm:text-[20px] tracking-[1px] ${
                            isActive ? 'text-white' : 'text-neutral-300'
                          }`}
                        >
                          {s.title}
                        </span>
                        <span className="shrink-0 font-slogan text-[10px] uppercase tracking-[2px] text-neutral-500">
                          {s.meta}
                        </span>
                      </span>
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.span
                            key="copy"
                            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="block overflow-hidden"
                          >
                            <span className="block pt-2 font-body text-[13px] sm:text-[14px] leading-relaxed text-neutral-400">
                              {s.copy}
                            </span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: panel */}
          <div className="min-w-0">
            <div className="rounded-3xl border border-[rgba(102,0,0,0.35)] bg-[rgba(10,10,10,0.5)] p-2 backdrop-blur-md">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C]">
                  {step.label}
                </span>
                <span className="font-slogan text-[11px] text-neutral-500">
                  Step {active + 1} of {steps.length}
                </span>
              </div>
              <div className="min-h-[420px] rounded-2xl border border-[rgba(102,0,0,0.3)] bg-[rgba(0,0,0,0.5)] p-6 sm:p-8">
                <motion.div
                  key={active}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {step.panel === 'auth' ? (
                    <AuthPanel onOpen={setModalMode} />
                  ) : step.panel === 'register' ? (
                    <RegisterPanel onOpen={setModalMode} />
                  ) : step.panel === 'roster' ? (
                    <RosterPanel onOpen={setModalMode} />
                  ) : step.panel === 'pay' ? (
                    <PayPanel onOpen={setModalMode} />
                  ) : step.panel === 'board' ? (
                    <BoardPanel onOpen={setModalMode} />
                  ) : step.panel === 'schedule' ? (
                    <SchedulePanel onOpen={setModalMode} />
                  ) : step.panel === 'rankings' ? (
                    <RankingsPanel onOpen={setModalMode} />
                  ) : step.panel === 'text' ? (
                    <TextPanel step={step} />
                  ) : (
                    <SoonPanel Icon={ActiveIcon} />
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalMode === 'roster' ? (
          <TutorialRosterDemo onClose={() => setModalMode(null)} />
        ) : modalMode === 'payment' ? (
          <TutorialPaymentDemo onClose={() => setModalMode(null)} />
        ) : modalMode === 'board' ? (
          <TutorialBoardDemo onClose={() => setModalMode(null)} />
        ) : modalMode === 'schedule' ? (
          <TutorialScheduleDemo onClose={() => setModalMode(null)} />
        ) : modalMode === 'rankings' ? (
          <TutorialRankingsDemo onClose={() => setModalMode(null)} />
        ) : modalMode ? (
          <TutorialAuthDemo mode={modalMode} onClose={() => setModalMode(null)} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
