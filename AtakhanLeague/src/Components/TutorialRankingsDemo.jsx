import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, MapPin, ChevronRight, Trophy } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

// Fake leaderboard. Top three take the valuable prizes.
const RANKS = [
  { name: 'FakerEUNE', team: 'Nexus Raiders', points: 2450, prize: '1st place' },
  { name: 'CapsGod', team: 'Baron Stealers', points: 2280, prize: '2nd place' },
  { name: 'Rekkles', team: 'Void Walkers', points: 2110, prize: '3rd place' },
  { name: 'SoloQueenMid', team: 'Free Agent', points: 1980, prize: null },
  { name: 'NightReaper', team: 'Iron Wolves', points: 1850, prize: null },
  { name: 'PixelStorm', team: 'Storm Breakers', points: 1720, prize: null },
];

const MEDAL = ['#d4af37', '#c0c0c0', '#cd7f32']; // gold / silver / bronze

export default function TutorialRankingsDemo({ onClose }) {
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
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative my-auto w-full max-w-2xl rounded-2xl bg-[rgba(10,10,10,0.94)] border border-[rgba(102,0,0,0.35)] px-6 sm:px-8 py-7 backdrop-blur-md shadow-[0_0_60px_rgba(102,0,0,0.35),inset_0_0_24px_rgba(102,0,0,0.06)]"
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

        <div className="flex items-center gap-2 mb-5 rounded-lg border border-[rgba(102,0,0,0.3)] bg-black/30 px-3 py-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#DC143C]" />
          <span className="flex items-center font-slogan text-[11px] tracking-wider">
            <span className="text-neutral-400">Summoner Rankings</span>
            <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-neutral-600" />
            <span className="text-[#DC143C]">Leaderboard</span>
          </span>
          <span className="ml-auto font-slogan text-[9px] font-bold uppercase tracking-[1.5px] text-neutral-600">
            public
          </span>
        </div>

        <div className="text-center mb-5">
          <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-1">Leaderboard</p>
          <h3 className="font-heading text-white text-[30px] leading-none tracking-wide [text-shadow:0_0_16px_rgba(139,0,0,0.6)]">
            Summoner Rankings
          </h3>
          <p className="inline-flex items-center gap-1.5 font-body text-[13px] text-[#d4af37] mt-2">
            <Trophy className="w-3.5 h-3.5" />
            The best summoners win valuable prizes
          </p>
        </div>

        {/* Rankings table */}
        <div className="rounded-xl bg-black/30 border border-[rgba(102,0,0,0.35)] overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_auto_auto] gap-3 px-4 py-3 border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
            <span className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">#</span>
            <span className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C]">Summoner</span>
            <span className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] text-right">Points</span>
            <span className="w-16" />
          </div>

          {RANKS.map((r, i) => {
            const medal = MEDAL[i];
            return (
              <div
                key={r.name}
                className={`grid grid-cols-[40px_1fr_auto_auto] items-center gap-3 px-4 py-3 border-b border-[rgba(102,0,0,0.15)] last:border-b-0 ${
                  medal ? 'bg-[rgba(212,175,55,0.05)]' : ''
                }`}
              >
                <span
                  className="font-heading text-[20px] leading-none"
                  style={{ color: medal || '#8a8a8a' }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-slogan text-[14px] font-bold text-white truncate">{r.name}</p>
                  <p className="font-slogan text-[10px] uppercase tracking-wider text-neutral-500 truncate">{r.team}</p>
                </div>
                <span className="font-heading text-[18px] leading-none text-white text-right tabular-nums">
                  {r.points.toLocaleString()}
                </span>
                <div className="w-16 flex justify-end">
                  {r.prize ? (
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-slogan text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: medal, borderColor: `${medal}66`, backgroundColor: `${medal}1a`, borderWidth: 1 }}
                    >
                      <Trophy className="w-2.5 h-2.5" />
                      Prize
                    </span>
                  ) : (
                    <span className="font-slogan text-[11px] text-neutral-700">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="font-body text-[12px] text-neutral-500 mt-4">
          Points are earned across tournaments. The top-ranked summoners take home valuable prizes each season.
        </p>
      </motion.div>
    </motion.div>
  );
}
