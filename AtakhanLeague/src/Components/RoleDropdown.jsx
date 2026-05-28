import { useState, useRef, useEffect } from 'react';

const roles = [
  { value: 'top', label: 'Top Lane', img: '/Icons/Top_icon.png' },
  { value: 'jungle', label: 'Jungle', img: '/Icons/Jungle_icon.png' },
  { value: 'mid', label: 'Mid Lane', img: '/Icons/Middle_icon.png' },
  { value: 'adc', label: 'ADC', img: '/Icons/Bottom_icon.png' },
  { value: 'support', label: 'Support', img: '/Icons/Support_icon.png' },
];

export default function RoleDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = roles.find((r) => r.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-[200px]">
      <div
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-md bg-black/60 border cursor-pointer transition-colors ${
          open
            ? 'border-[#DC143C] shadow-[0_0_12px_rgba(102,0,0,0.4)]'
            : 'border-[rgba(102,0,0,0.4)] hover:border-[#660000]'
        }`}
      >
        <img
          src={selected ? selected.img : '/Icons/Middle_icon.png'}
          alt="role"
          className="w-6 h-6 object-contain"
        />
        <span className="flex-1 font-slogan text-sm text-neutral-300">
          {selected ? selected.label : 'Select Role'}
        </span>
        <span
          className={`text-[10px] text-[#660000] transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </div>

      {open && (
        <ul className="absolute top-[calc(100%+4px)] left-0 w-full bg-[rgba(10,10,10,0.95)] border border-[rgba(102,0,0,0.4)] rounded-md overflow-hidden z-[100] animate-dropdown-open">
          {roles.map((role) => (
            <li
              key={role.value}
              onClick={() => {
                onChange(role.value);
                setOpen(false);
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors hover:bg-[rgba(102,0,0,0.2)] ${
                value === role.value ? 'bg-[rgba(102,0,0,0.3)]' : ''
              }`}
            >
              <img src={role.img} alt={role.label} className="w-[22px] h-[22px] object-contain" />
              <span
                className={`font-slogan text-[13px] ${
                  value === role.value ? 'text-white' : 'text-neutral-300'
                }`}
              >
                {role.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
