import { useEffect, useRef, useState } from 'react';

// This tournament is EUNE only. The ineligible regions are still listed rather
// than hidden, so a player picks the truth and gets told why they can't enter —
// the backend re-checks the answer against Riot either way.
const SERVERS = [
  { value: 'EUNE', label: 'EUNE', region: 'Europe Nordic & East', eligible: true },
  { value: 'EUW', label: 'EUW', region: 'Europe West', eligible: false },
  { value: 'OTHER', label: 'Other region', region: 'Anywhere else', eligible: false },
];

export default function ServerDropdown({ value, onChange, id }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = SERVERS.find((s) => s.value === value);
  const wrong = selected && !selected.eligible;

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* A real button, not a div: it has to be reachable by keyboard, and
          type="button" keeps it from submitting the form it sits in. */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 rounded-lg border bg-black/50 px-4 py-3 text-left transition-all duration-300 ${
          wrong
            ? 'border-[#DC143C] shadow-[0_0_10px_rgba(220,20,60,0.35)]'
            : open
              ? 'border-[#DC143C] shadow-[0_0_12px_rgba(220,20,60,0.3)]'
              : 'border-[rgba(102,0,0,0.3)] hover:border-[#660000]'
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            !selected
              ? 'bg-neutral-600'
              : selected.eligible
                ? 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.7)]'
                : 'bg-[#DC143C] shadow-[0_0_8px_rgba(220,20,60,0.7)]'
          }`}
        />
        <span className="flex-1 font-slogan text-sm text-white">
          {selected ? selected.label : <span className="text-neutral-500">Select your server</span>}
        </span>
        {selected && (
          <span className="font-body text-[12px] text-neutral-500">{selected.region}</span>
        )}
        <span
          className={`text-[10px] text-[#8B0000] transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-[100] w-full overflow-hidden rounded-lg border border-[rgba(102,0,0,0.45)] bg-[rgba(10,10,10,0.97)] backdrop-blur-md animate-dropdown-open"
        >
          {SERVERS.map((s) => (
            <li key={s.value} role="option" aria-selected={value === s.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgba(102,0,0,0.25)] ${
                  value === s.value ? 'bg-[rgba(102,0,0,0.3)]' : ''
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    s.eligible
                      ? 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.7)]'
                      : 'bg-[#DC143C]'
                  }`}
                />
                <span
                  className={`flex-1 font-slogan text-[13px] ${
                    value === s.value ? 'text-white' : 'text-neutral-300'
                  }`}
                >
                  {s.label}
                </span>
                <span className="font-body text-[11px] text-neutral-500">
                  {s.eligible ? s.region : 'not eligible'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
