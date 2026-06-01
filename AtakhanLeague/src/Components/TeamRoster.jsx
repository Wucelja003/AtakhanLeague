import { useEffect, useState } from 'react';
import { api } from '../api';

const ROLES = [
  { key: 'top', label: 'Top', img: '/Icons/Top_icon.png' },
  { key: 'jungle', label: 'Jungle', img: '/Icons/Jungle_icon.png' },
  { key: 'mid', label: 'Mid', img: '/Icons/Middle_icon.png' },
  { key: 'adc', label: 'ADC', img: '/Icons/Bottom_icon.png' },
  { key: 'support', label: 'Support', img: '/Icons/Support_icon.png' },
];

export default function TeamRoster() {
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inputs per role for adding new members
  const [inputs, setInputs] = useState({}); // { top: { username, division }, ... }
  const [busy, setBusy] = useState(null);   // currently submitting role

  const fetchRoster = async () => {
    try {
      const res = await fetch(api('/team/roster'), { credentials: 'include' });
      if (res.status === 404) {
        setRoster(null);
        return;
      }
      const data = await res.json();
      setRoster(data);
    } catch (_) {
      setRoster(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  if (loading) return null;
  if (!roster) return null; // user is not a captain — render nothing

  // Map role → member who plays it (or null if open)
  const memberByRole = roster.members.reduce((acc, m) => {
    acc[m.role] = m;
    return acc;
  }, {});

  const captainRole = roster.captainRole; // may be null if captain didn't pick
  const filledCount = (captainRole ? 1 : 0) + roster.members.length;

  const handleAdd = async (roleKey) => {
    const input = inputs[roleKey] || {};
    if (!input.username || !input.username.trim()) {
      setError('Enter a summoner name');
      return;
    }
    setBusy(roleKey);
    setError(null);
    try {
      const res = await fetch(api('/team/member'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: input.username.trim(),
          role: roleKey,
          division: input.division ? input.division.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setError(data.message || 'Failed to add player');
        return;
      }
      // Reset that input + refresh roster
      setInputs((prev) => ({ ...prev, [roleKey]: { username: '', division: '' } }));
      await fetchRoster();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (memberId) => {
    if (!confirm('Remove this player from the roster?')) return;
    setBusy(memberId);
    setError(null);
    try {
      const res = await fetch(api(`/team/member/${memberId}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setError(data.message || 'Failed to remove player');
        return;
      }
      await fetchRoster();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-[rgba(102,0,0,0.3)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-1">
            Roster
          </p>
          <h3 className="font-heading text-white text-[22px] leading-none tracking-wide">
            Your Squad
          </h3>
          <p className="font-slogan text-[11px] uppercase tracking-wider text-neutral-500 mt-2">
            {filledCount} / 5 lanes filled
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 font-body text-sm px-4 py-3 rounded-xl bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.3)] text-[#DC143C]">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2.5">
        {ROLES.map((role) => {
          const isCaptainLane = captainRole === role.key;
          const member = memberByRole[role.key];

          // 1. Captain's own lane — show captain locked
          if (isCaptainLane) {
            return (
              <div
                key={role.key}
                className="flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.35)]"
              >
                <img src={role.img} alt={role.label} className="w-8 h-8 object-contain shrink-0" />
                <div className="w-20 sm:w-24 font-slogan text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#DC143C]">
                  {role.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-slogan text-[14px] sm:text-[15px] font-bold text-white truncate">
                    {roster.captainUsername}
                  </p>
                  <p className="font-slogan text-[10px] uppercase tracking-wider text-[#d4af37]">
                    Captain
                  </p>
                </div>
              </div>
            );
          }

          // 2. Member exists for this role — show + remove
          if (member) {
            return (
              <div
                key={role.key}
                className="flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl bg-black/40 border border-[rgba(102,0,0,0.3)]"
              >
                <img src={role.img} alt={role.label} className="w-8 h-8 object-contain shrink-0" />
                <div className="w-20 sm:w-24 font-slogan text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-neutral-400">
                  {role.label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-slogan text-[14px] sm:text-[15px] font-semibold text-white truncate">
                    {member.username}
                  </p>
                  {member.division && (
                    <p className="font-slogan text-[10px] uppercase tracking-wider text-neutral-500">
                      {member.division}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(member.id)}
                  disabled={busy === member.id}
                  className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            );
          }

          // 3. Empty slot — input + Add
          const input = inputs[role.key] || {};
          const isBusy = busy === role.key;
          return (
            <div
              key={role.key}
              className="flex flex-wrap items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl bg-black/20 border border-dashed border-[rgba(102,0,0,0.4)]"
            >
              <img src={role.img} alt={role.label} className="w-8 h-8 object-contain shrink-0 opacity-60" />
              <div className="w-20 sm:w-24 font-slogan text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                {role.label}
              </div>
              <input
                type="text"
                placeholder="Summoner name"
                value={input.username || ''}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    [role.key]: { ...prev[role.key], username: e.target.value },
                  }))
                }
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-[13px] outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
              />
              <button
                onClick={() => handleAdd(role.key)}
                disabled={isBusy}
                className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login hover:animate-wind-flow-fast disabled:opacity-50 transition-all"
              >
                {isBusy ? 'Adding...' : 'Add'}
              </button>
            </div>
          );
        })}
      </div>

      <p className="font-body text-[12px] text-neutral-500 mt-4">
        Each lane can be filled by one player. Captain's lane is locked.
      </p>
    </div>
  );
}
