import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, MapPin, ChevronRight, User } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

// Same 5 lanes as the real TeamRoster.
const ROLES = [
  { key: 'top', label: 'Top', img: '/Icons/Top_icon.png' },
  { key: 'jungle', label: 'Jungle', img: '/Icons/Jungle_icon.png' },
  { key: 'mid', label: 'Mid', img: '/Icons/Middle_icon.png' },
  { key: 'adc', label: 'ADC', img: '/Icons/Bottom_icon.png' },
  { key: 'support', label: 'Support', img: '/Icons/Support_icon.png' },
];

// Visual-only demo. The captain (you) plays Mid; the other four get added.
const CAPTAIN = { role: 'mid', username: 'AtakhanKing' };
const ADD_ORDER = [
  { role: 'top', username: 'ShadowBlade' },
  { role: 'jungle', username: 'NightReaper' },
  { role: 'adc', username: 'PixelStorm' },
  { role: 'support', username: 'WardMother' },
];

export default function TutorialRosterDemo({ onClose }) {
  const reduce = useReducedMotion();
  const [added, setAdded] = useState({}); // { top: 'ShadowBlade', ... }
  const [typingRole, setTypingRole] = useState(null);
  const [typedName, setTypedName] = useState('');
  const [pressing, setPressing] = useState(null);
  const [caretOn, setCaretOn] = useState(true);

  // Esc to close
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Blinking caret
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setCaretOn((v) => !v), 480);
    return () => clearInterval(id);
  }, [reduce]);

  // Roster-building animation — types a name into a lane, presses Add, fills it.
  useEffect(() => {
    if (reduce) {
      setAdded(ADD_ORDER.reduce((a, p) => ({ ...a, [p.role]: p.username }), {}));
      setTypingRole(null);
      setTypedName('');
      return;
    }
    let alive = true;
    const timers = [];
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));

    (async () => {
      while (alive) {
        setAdded({});
        setTypingRole(null);
        setTypedName('');
        await wait(600);

        for (const p of ADD_ORDER) {
          if (!alive) break;
          setTypingRole(p.role);
          setTypedName('');
          await wait(350);
          for (let c = 1; c <= p.username.length && alive; c++) {
            setTypedName(p.username.slice(0, c));
            await wait(55 + Math.random() * 45);
          }
          await wait(360);
          setPressing(p.role);
          await wait(240);
          setPressing(null);
          setAdded((prev) => ({ ...prev, [p.role]: p.username }));
          setTypingRole(null);
          setTypedName('');
          await wait(520);
        }

        await wait(1400);
      }
    })();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  const filledCount = 1 + Object.keys(added).length;

  const renderRow = (role) => {
    const isCaptain = CAPTAIN.role === role.key;
    const member = added[role.key];
    const isTyping = typingRole === role.key;

    if (isCaptain) {
      return (
        <div
          key={role.key}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.35)]"
        >
          <img src={role.img} alt={role.label} className="w-7 h-7 object-contain shrink-0" />
          <div className="w-16 font-slogan text-[11px] font-bold uppercase tracking-wider text-[#DC143C]">{role.label}</div>
          <div className="flex-1 min-w-0">
            <p className="font-slogan text-[14px] font-bold text-white truncate">{CAPTAIN.username}</p>
            <p className="font-slogan text-[9px] uppercase tracking-wider text-[#d4af37]">Captain</p>
          </div>
        </div>
      );
    }

    if (member) {
      return (
        <motion.div
          key={role.key}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-black/40 border border-[rgba(102,0,0,0.3)]"
        >
          <img src={role.img} alt={role.label} className="w-7 h-7 object-contain shrink-0" />
          <div className="w-16 font-slogan text-[11px] font-bold uppercase tracking-wider text-neutral-400">{role.label}</div>
          <div className="flex-1 min-w-0">
            <p className="font-slogan text-[14px] font-semibold text-white truncate">{member}</p>
          </div>
          <span className="font-slogan text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)]">
            Remove
          </span>
        </motion.div>
      );
    }

    return (
      <div
        key={role.key}
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-black/20 border border-dashed border-[rgba(102,0,0,0.4)]"
      >
        <img src={role.img} alt={role.label} className="w-7 h-7 object-contain shrink-0 opacity-60" />
        <div className="w-16 font-slogan text-[11px] font-bold uppercase tracking-wider text-neutral-500">{role.label}</div>
        <div
          className={`flex-1 min-w-0 px-3 py-2 rounded-lg bg-black/50 border font-slogan text-[13px] min-h-[36px] flex items-center ${
            isTyping ? 'border-[#DC143C]' : 'border-[rgba(102,0,0,0.3)]'
          }`}
        >
          <span className={isTyping && typedName ? 'text-white' : 'text-[#666]'}>
            {isTyping ? typedName : 'Summoner name'}
          </span>
          {isTyping && <span className="ml-0.5 inline-block w-[2px] h-[13px] bg-[#DC143C] animate-pulse" />}
        </div>
        <motion.span
          animate={pressing === role.key ? { scale: 0.9 } : { scale: 1 }}
          transition={{ duration: 0.12 }}
          className={`font-slogan text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login ${
            pressing === role.key ? 'shadow-[0_0_18px_rgba(220,20,60,0.7)]' : ''
          }`}
        >
          Add
        </motion.span>
      </div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center px-4 py-8 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative my-auto w-full max-w-lg rounded-2xl bg-[rgba(10,10,10,0.92)] border border-[rgba(102,0,0,0.35)] px-7 py-7 backdrop-blur-md shadow-[0_0_60px_rgba(102,0,0,0.35),inset_0_0_24px_rgba(102,0,0,0.06)]"
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

        {/* Where to find it on the site */}
        <div className="flex items-center gap-2 mb-4 rounded-lg border border-[rgba(102,0,0,0.3)] bg-black/30 px-3 py-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-[#DC143C]" />
          <span className="flex items-center font-slogan text-[11px] tracking-wider">
            <span className="text-neutral-400">Profile</span>
            <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-neutral-600" />
            <span className="text-[#DC143C]">Your Squad</span>
          </span>
          <span className="ml-auto font-slogan text-[9px] font-bold uppercase tracking-[1.5px] text-neutral-600">
            top-right menu
          </span>
        </div>

        {/* Mock "blank" profile page so it's clear where the roster lives */}
        <div className="rounded-xl border border-[rgba(102,0,0,0.3)] bg-black/30 p-4 flex flex-col gap-4">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 rounded-full grid place-items-center bg-[linear-gradient(135deg,#2a0a0a,#7B1A1A)] border border-[rgba(220,20,60,0.4)] shadow-[0_0_18px_rgba(139,0,0,0.4)]">
              <User className="w-6 h-6 text-[#DC143C]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-white text-[20px] leading-none tracking-wide">{CAPTAIN.username}</p>
              <div className="mt-2.5 flex gap-2">
                <span className="h-2.5 w-24 rounded bg-white/[0.06] animate-pulse" />
                <span className="h-2.5 w-16 rounded bg-white/[0.06] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Skeleton stats — stands in for your op.gg-style profile */}
          <div>
            <p className="font-slogan text-[9px] font-bold uppercase tracking-[2px] text-neutral-600 mb-2">
              Rank · Mastery · Match history
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-white/[0.03] border border-[rgba(102,0,0,0.2)] animate-pulse" />
              ))}
            </div>
          </div>

          {/* The roster — highlighted so the eye lands on it */}
          <div className="relative mt-1 rounded-xl border-2 border-dashed border-[rgba(220,20,60,0.55)] bg-[rgba(220,20,60,0.04)] p-3.5 pt-4 shadow-[0_0_24px_rgba(220,20,60,0.12)]">
            <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded bg-[#150404] border border-[rgba(220,20,60,0.5)] font-slogan text-[9px] font-bold uppercase tracking-[1.5px] text-[#DC143C]">
              ← Add your teammates here
            </span>

            <div className="flex items-end justify-between mb-3 mt-1">
              <div>
                <p className="font-slogan text-[10px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-0.5">Roster</p>
                <h4 className="font-heading text-white text-[20px] leading-none tracking-wide">Your Squad</h4>
              </div>
              <p className="font-slogan text-[10px] uppercase tracking-wider text-neutral-500">
                {filledCount} / 5 lanes filled
              </p>
            </div>

            <div className="flex flex-col gap-2">{ROLES.map(renderRow)}</div>
          </div>
        </div>

        <p className="font-body text-[12px] text-neutral-500 mt-4">
          Each lane can be filled by one player. The captain's lane is locked. Solo players skip this.
        </p>
      </motion.div>
    </motion.div>
  );
}
