import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, MapPin, ChevronRight } from 'lucide-react';
import TournamentBoard from './TournamentBoard';
import PlayersPool from './PlayersPool';

const EASE = [0.22, 1, 0.36, 1];

// Fake example data so the demo never shows real registrations.
const FAKE_TEAMS = [
  { name: 'Nexus Raiders', captainUsername: 'FakerEUNE', paid: true },
  { name: 'Baron Stealers', captainUsername: 'CapsGod', paid: true },
  { name: 'Void Walkers', captainUsername: 'Rekkles', paid: false },
];
const FAKE_SOLO = [
  { username: 'SoloQueenMid', role: 'mid' },
  { username: 'NightReaper', role: 'jungle' },
  { username: 'WardMother', role: 'support' },
  { username: 'PixelStorm', role: 'adc' },
  { username: 'TopDiff', role: 'top' },
];

// Shows the real Tournament Board + Players Pool exactly as they look on the
// home page — the same components — so people see where names land. Public,
// live data. Section spacing is neutralised so they sit tidily in the modal.
export default function TutorialBoardDemo({ onClose }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-start justify-center px-4 py-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative my-auto w-full max-w-4xl rounded-2xl bg-[rgba(10,10,10,0.94)] border border-[rgba(102,0,0,0.35)] px-5 sm:px-8 py-7 backdrop-blur-md shadow-[0_0_60px_rgba(102,0,0,0.35),inset_0_0_24px_rgba(102,0,0,0.06)]"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)] font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C] animate-pulse" />
            Demo preview
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Where it shows up */}
        <div className="flex items-center gap-2 mb-6 rounded-lg border border-[rgba(102,0,0,0.3)] bg-black/30 px-3 py-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#DC143C]" />
          <span className="flex items-center font-slogan text-[11px] tracking-wider">
            <span className="text-neutral-400">Home page</span>
            <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-neutral-600" />
            <span className="text-[#DC143C]">Board &amp; Pool</span>
          </span>
          <span className="ml-auto font-slogan text-[9px] font-bold uppercase tracking-[1.5px] text-neutral-600">
            public
          </span>
        </div>

        {/* The real components — identical to the home page. Their own section
            margins/padding are stripped so they nest neatly here. */}
        <div className="flex flex-col gap-6 [&_section]:!m-0 [&_section]:!p-0">
          <TournamentBoard teams={FAKE_TEAMS} />
          <PlayersPool registrations={FAKE_SOLO} />
        </div>
      </motion.div>
    </motion.div>
  );
}
