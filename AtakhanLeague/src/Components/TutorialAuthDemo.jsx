import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, Check, ChevronDown } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1];

// Same rules as the real Sign Up form.
const passwordRules = [
  { test: (v) => v.length >= 6, label: '6+ chars' },
  { test: (v) => /[A-Z]/.test(v), label: 'Uppercase' },
  { test: (v) => /[a-z]/.test(v), label: 'Lowercase' },
  { test: (v) => /\d/.test(v), label: 'Number' },
  { test: (v) => /[^A-Za-z0-9]/.test(v), label: 'Special' },
];

// Same roles as the real RoleDropdown.
const roles = [
  { value: 'top', label: 'Top Lane', img: '/Icons/Top_icon.png' },
  { value: 'jungle', label: 'Jungle', img: '/Icons/Jungle_icon.png' },
  { value: 'mid', label: 'Mid Lane', img: '/Icons/Middle_icon.png' },
  { value: 'adc', label: 'ADC', img: '/Icons/Bottom_icon.png' },
  { value: 'support', label: 'Support', img: '/Icons/Support_icon.png' },
];

// Visual-only demo. Fake example values, nothing is submitted anywhere.
const DEMO_PASSWORD = 'Atakhan#7';

const CONFIG = {
  login: {
    badge: 'Welcome Back',
    title: 'The Rift awaits.',
    button: 'Sign In',
    values: ['AtakhanKing', 'summoner@atakhanleague.com', DEMO_PASSWORD],
    masked: [false, false, true],
  },
  signup: {
    badge: 'Join the League',
    title: 'Forge your legacy.',
    button: 'Create Account',
    values: ['AtakhanKing', 'EUNE', 'summoner@atakhanleague.com', DEMO_PASSWORD, DEMO_PASSWORD],
    masked: [false, false, false, true, true],
  },
  team: {
    badge: 'Team Registration',
    title: 'Rally your squad.',
    button: 'Register Team',
    fields: [
      { label: 'Summoner name', placeholder: 'YourSummonerName', value: 'AtakhanKing' },
      { label: 'Team Name', placeholder: 'Demacian Kings', value: 'Crimson Vanguard' },
      { label: 'Ranked Division', placeholder: 'Emerald 2', value: 'Emerald 2' },
      { label: 'Email', placeholder: 'you@example.com', value: 'captain@atakhanleague.com' },
      { label: 'Your Role', kind: 'role', value: 'mid' },
    ],
  },
  individual: {
    badge: 'Solo Registration',
    title: 'Go it alone.',
    button: 'Register',
    fields: [
      { label: 'Game Name', placeholder: 'YourSummonerName', value: 'AtakhanKing' },
      { label: 'Ranked Division', placeholder: 'Emerald 2', value: 'Emerald 2' },
      { label: 'Email', placeholder: 'you@example.com', value: 'solo@atakhanleague.com' },
      { label: 'Your Role', kind: 'role', value: 'jungle' },
    ],
  },
};

// Exact styling of the real inputs — a real (read-only) input so the border
// renders identically. No transition/glow so nothing "slides".
const inputBase =
  'px-4 py-3 rounded-lg bg-black/50 border text-white font-slogan text-sm outline-none placeholder:text-[#666]';

function caretAppend(text, active, caretOn) {
  return active ? text + (caretOn ? '▏' : ' ') : text;
}

function Box({ value, placeholder, active, caretOn, mask = false, center = false, className = '' }) {
  const shown = caretAppend(mask ? '•'.repeat(value.length) : value, active, caretOn);
  return (
    <input
      readOnly
      tabIndex={-1}
      value={shown}
      placeholder={placeholder}
      className={`${inputBase} ${active ? 'border-[#DC143C]' : 'border-[rgba(102,0,0,0.3)]'} ${
        center ? 'text-center' : ''
      } ${className}`}
    />
  );
}

// A role picker that opens and highlights an option (chosen for you in the demo).
function RoleSelect({ value, open, hoverIdx }) {
  const selected = roles.find((r) => r.value === value);
  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2.5 px-4 min-h-[46px] rounded-lg bg-black/50 border ${
          open ? 'border-[#DC143C]' : 'border-[rgba(102,0,0,0.3)]'
        }`}
      >
        {selected && <img src={selected.img} alt="" className="w-5 h-5 object-contain" />}
        <span className={`flex-1 font-slogan text-sm ${selected ? 'text-white' : 'text-[#666]'}`}>
          {selected ? selected.label : 'Select role'}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#DC143C] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
          className="absolute left-0 right-0 top-full mt-2 z-20 rounded-lg border border-[rgba(102,0,0,0.4)] bg-[rgba(12,12,12,0.98)] p-1.5 shadow-[0_16px_44px_rgba(0,0,0,0.65)] backdrop-blur-md"
        >
          {roles.map((r, idx) => (
            <div
              key={r.value}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md font-slogan text-[13px] transition-colors ${
                idx === hoverIdx
                  ? 'bg-[rgba(220,20,60,0.2)] text-white'
                  : value === r.value
                    ? 'bg-[rgba(102,0,0,0.3)] text-white'
                    : 'text-neutral-300'
              }`}
            >
              <img src={r.img} alt="" className="w-[20px] h-[20px] object-contain" />
              {r.label}
              {value === r.value && <Check className="w-4 h-4 ml-auto text-[#DC143C]" />}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <span className="block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2">
        {label}
      </span>
      {children}
    </div>
  );
}

function PasswordRules({ value }) {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {passwordRules.map((rule) => {
        const ok = rule.test(value);
        return (
          <span
            key={rule.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-slogan text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
              ok
                ? 'border-[rgba(74,222,128,0.5)] bg-[rgba(74,222,128,0.12)] text-[#4ade80]'
                : 'border-[rgba(102,0,0,0.35)] bg-black/30 text-neutral-500'
            }`}
          >
            <motion.span
              initial={false}
              animate={{ scale: ok ? 1 : 0.7, opacity: ok ? 1 : 0.45 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="grid place-items-center"
            >
              {ok ? (
                <Check className="w-3 h-3" />
              ) : (
                <span className="inline-block w-3 h-3 rounded-full border border-current" />
              )}
            </motion.span>
            {rule.label}
          </span>
        );
      })}
    </div>
  );
}

export default function TutorialAuthDemo({ mode, onClose }) {
  const reduce = useReducedMotion();
  const cfg = CONFIG[mode];
  const values = cfg.values || cfg.fields.map((f) => f.value);
  const [typed, setTyped] = useState(() => values.map(() => ''));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [pressed, setPressed] = useState(false);
  const [caretOn, setCaretOn] = useState(true);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleHover, setRoleHover] = useState(-1);

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

  // Typewriter engine — fills each field in turn, presses the button, loops.
  useEffect(() => {
    const fields = cfg.fields;
    if (reduce) {
      setTyped(values);
      setActiveIdx(-1);
      return;
    }
    let alive = true;
    const timers = [];
    const wait = (ms) => new Promise((r) => timers.push(setTimeout(r, ms)));

    (async () => {
      while (alive) {
        setTyped(values.map(() => ''));
        setPressed(false);
        setRoleOpen(false);
        setRoleHover(-1);
        await wait(450);

        for (let i = 0; i < values.length && alive; i++) {
          setActiveIdx(i);
          const field = fields && fields[i];

          if (field && field.kind === 'role') {
            // Open the dropdown and let the highlight glide down to the pick.
            setRoleOpen(true);
            await wait(450);
            const targetIdx = roles.findIndex((r) => r.value === field.value);
            for (let h = 0; h <= targetIdx && alive; h++) {
              setRoleHover(h);
              await wait(230);
            }
            await wait(300);
            setTyped((prev) => {
              const next = [...prev];
              next[i] = field.value;
              return next;
            });
            await wait(260);
            setRoleOpen(false);
            setRoleHover(-1);
            await wait(350);
          } else {
            const val = values[i];
            for (let c = 1; c <= val.length && alive; c++) {
              setTyped((prev) => {
                const next = [...prev];
                next[i] = val.slice(0, c);
                return next;
              });
              await wait(55 + Math.random() * 45);
            }
            await wait(320);
          }
        }

        setActiveIdx(-1);
        await wait(350);
        if (!alive) break;
        setPressed(true);
        await wait(950);
        setPressed(false);
        await wait(1100);
      }
    })();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [mode, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

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
        className="relative my-auto w-full max-w-md rounded-2xl bg-[rgba(10,10,10,0.92)] border border-[rgba(102,0,0,0.35)] px-8 py-8 backdrop-blur-md shadow-[0_0_60px_rgba(102,0,0,0.35),inset_0_0_24px_rgba(102,0,0,0.06)]"
      >
        <div className="flex items-center justify-between mb-5">
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

        <h3 className="font-heading text-white text-[28px] tracking-wide leading-none [text-shadow:0_0_18px_rgba(139,0,0,0.7)]">
          {cfg.title}
        </h3>
        <p className="font-body text-sm text-neutral-400 mt-2 mb-6">
          {cfg.badge} — this is just a preview of the form.
        </p>

        <div className="flex flex-col gap-4">
          {mode === 'login' ? (
            <>
              <Field label="Summoner Name">
                <Box value={typed[0]} placeholder="YourSummonerName" active={activeIdx === 0} caretOn={caretOn} className="w-full" />
              </Field>
              <Field label="Email">
                <Box value={typed[1]} placeholder="you@example.com" active={activeIdx === 1} caretOn={caretOn} className="w-full" />
              </Field>
              <Field label="Password">
                <Box value={typed[2]} placeholder="••••••••" active={activeIdx === 2} caretOn={caretOn} mask className="w-full" />
              </Field>
            </>
          ) : mode === 'signup' ? (
            <>
              <Field label="Riot ID">
                <div className="flex gap-2.5">
                  <Box value={typed[0]} placeholder="Summoner Name" active={activeIdx === 0} caretOn={caretOn} className="flex-1 min-w-0" />
                  <Box value={typed[1]} placeholder="Tag" active={activeIdx === 1} caretOn={caretOn} center className="w-24" />
                </div>
              </Field>
              <Field label="Email">
                <Box value={typed[2]} placeholder="you@example.com" active={activeIdx === 2} caretOn={caretOn} className="w-full" />
              </Field>
              <Field label="Password">
                <Box value={typed[3]} placeholder="••••••••" active={activeIdx === 3} caretOn={caretOn} mask className="w-full" />
                <PasswordRules value={typed[3]} />
              </Field>
              <Field label="Confirm Password">
                <Box value={typed[4]} placeholder="••••••••" active={activeIdx === 4} caretOn={caretOn} mask className="w-full" />
              </Field>
            </>
          ) : (
            cfg.fields.map((f, i) => (
              <Field key={f.label} label={f.label}>
                {f.kind === 'role' ? (
                  <RoleSelect value={typed[i]} open={activeIdx === i && roleOpen} hoverIdx={roleHover} />
                ) : (
                  <Box value={typed[i]} placeholder={f.placeholder} active={activeIdx === i} caretOn={caretOn} className="w-full" />
                )}
              </Field>
            ))
          )}

          <motion.div
            animate={pressed ? { scale: 0.97 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
            className={`mt-2 w-full text-center font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white rounded-xl py-3.5 bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login ${
              pressed ? 'shadow-[0_0_28px_rgba(220,20,60,0.75)]' : ''
            }`}
          >
            {cfg.button}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
