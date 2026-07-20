import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, MapPin, ChevronRight } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa6';

const EASE = [0.22, 1, 0.36, 1];

// Fake fixtures, matching the real tournament format (QF → SF → Final).
const SCHEDULE = [
  { round: 'Quarterfinal 1', a: 'Nexus Raiders', b: 'Baron Stealers', time: '18:00' },
  { round: 'Quarterfinal 2', a: 'Void Walkers', b: 'Rift Kings', time: '18:00' },
  { round: 'Quarterfinal 3', a: 'Shadow Legion', b: 'Storm Breakers', time: '18:20' },
  { round: 'Quarterfinal 4', a: 'Iron Wolves', b: 'Crimson Order', time: '18:20' },
  { round: 'Semifinal 1', a: 'Winner QF1', b: 'Winner QF2', time: '20:00' },
  { round: 'Semifinal 2', a: 'Winner QF3', b: 'Winner QF4', time: '20:00' },
  { round: 'Grand Final', a: 'Winner SF1', b: 'Winner SF2', time: '22:00' },
];

export default function TutorialScheduleDemo({ onClose }) {
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
            <span className="text-neutral-400">Tournaments</span>
            <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-neutral-600" />
            <span className="text-[#DC143C]">Match Schedule</span>
          </span>
          <span className="ml-auto font-slogan text-[9px] font-bold uppercase tracking-[1.5px] text-neutral-600">
            public
          </span>
        </div>

        <div className="text-center mb-5">
          <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-1">Match Schedule</p>
          <h3 className="font-heading text-white text-[30px] leading-none tracking-wide [text-shadow:0_0_16px_rgba(139,0,0,0.6)]">
            Full Fixture List
          </h3>
          <p className="font-body text-[13px] text-neutral-400 mt-2">All times CET · 15 August 2026</p>
        </div>

        {/* Schedule table — same style as the Tournaments page */}
        <div className="rounded-xl bg-black/30 border border-[rgba(102,0,0,0.35)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(102,0,0,0.4)] bg-[rgba(102,0,0,0.1)]">
                <th className="text-left font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] px-4 py-3 hidden sm:table-cell">Round</th>
                <th className="text-center font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] px-4 py-3">Match</th>
                <th className="text-right font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((m) => (
                <tr key={m.round} className="border-b border-[rgba(102,0,0,0.15)] last:border-b-0">
                  <td className="px-4 py-3 font-slogan text-[11px] font-bold uppercase tracking-wider text-neutral-400 hidden sm:table-cell">
                    {m.round}
                  </td>
                  <td className="px-4 py-3">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 font-slogan text-[13px] font-bold tracking-wide text-white">
                      <span className="text-right truncate">{m.a}</span>
                      <span className="font-heading text-[#DC143C] text-[14px] leading-none">VS</span>
                      <span className="text-left truncate">{m.b}</span>
                    </div>
                    <div className="sm:hidden mt-1 text-center font-slogan text-[9px] uppercase tracking-wider text-neutral-500">
                      {m.round}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-heading text-[18px] leading-none text-white">{m.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-[rgba(102,0,0,0.3)] bg-black/20 px-4 py-3">
          <FaInstagram className="w-4 h-4 shrink-0 text-[#DC143C]" />
          <span className="font-body text-[13px] text-neutral-400">
            The full schedule is posted here on the site and on our Instagram{' '}
            <span className="text-neutral-200">@atakhanleague</span>.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
