import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleDropdown from './RoleDropdown';

export default function RegistrationForm({
  title,
  fields,
  attention,
  buttonLabel,
  endpoint,           // '/api/registration/team' or '/api/registration/individual'
  needsRole = false,  // role dropdown shown + required only for individual
  needsServer = true, // server picker — this tournament is EUNE only
}) {
  const [values, setValues] = useState({});
  const [role, setRole] = useState('');
  const [server, setServer] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Matches how the backend compares it, so the field can't disagree with the
  // answer it gets back: trimmed, case-insensitive.
  const typedServer = server.trim().toUpperCase();
  const wrongServer = typedServer !== '' && typedServer !== 'EUNE';

  function inputClass(name) {
    if (errors[name] === true)
      return 'border-[#DC143C] shadow-[0_0_10px_rgba(220,20,60,0.35)] animate-shake';
    if (errors[name] === false)
      return 'border-[#2d6a2d] shadow-[0_0_8px_rgba(45,106,45,0.25)]';
    return 'border-[rgba(102,0,0,0.3)] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    // Field validation
    const next = {};
    let hasErrors = false;
    fields.forEach((f) => {
      const val = (values[f.name] || '').trim();
      const invalid = !val || (f.type === 'email' && !val.includes('@'));
      next[f.name] = invalid;
      if (invalid) hasErrors = true;
    });
    setErrors(next);

    if (needsServer && !typedServer) {
      setServerError('Please enter your server');
      return;
    }
    if (needsServer && wrongServer) {
      setServerError('This tournament is for EUNE only — your account is on another server.');
      return;
    }
    if (needsRole && !role) {
      setServerError('Please select your role');
      return;
    }
    if (hasErrors) return;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...values, role, server: typedServer }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        setServerError(data.message || 'Registration failed');
        return;
      }
      setSuccess(true);
      setValues({});
      setRole('');
      setServer('');
      setErrors({});
      // Send them straight to their profile to pay the entry fee.
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex-1 min-w-[320px] max-w-[560px] rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-[52px] py-12 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in"
    >
      <h3 className="font-slogan text-[15px] tracking-[2px] uppercase text-white mb-9 [text-shadow:0_0_14px_rgba(220,20,60,0.45)]">
        {title}
      </h3>

      {fields.map((f, i) => (
        <div
          key={f.name}
          className="mb-6 animate-field-slide-in"
          style={{ animationDelay: `${0.15 + i * 0.1}s` }}
        >
          <label
            htmlFor={`${title}-${f.name}`}
            className="block font-slogan text-[11px] tracking-wider uppercase text-neutral-300 mb-2"
          >
            {f.label}:
          </label>
          <input
            id={`${title}-${f.name}`}
            type={f.type}
            name={f.name}
            placeholder={f.placeholder}
            value={values[f.name] || ''}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            className={`block w-full px-4 py-3 rounded-lg bg-black/50 border text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] ${inputClass(
              f.name
            )}`}
          />
        </div>
      ))}

      {needsServer && (
        <div className="mb-6 animate-field-slide-in" style={{ animationDelay: `${0.15 + fields.length * 0.1}s` }}>
          <label
            htmlFor={`${title}-server`}
            className="block font-slogan text-[11px] tracking-wider uppercase text-neutral-300 mb-2"
          >
            Server:
          </label>
          <input
            id={`${title}-server`}
            type="text"
            name="server"
            placeholder="EUNE"
            autoComplete="off"
            value={server}
            onChange={(e) => setServer(e.target.value)}
            className={`block w-full px-4 py-3 rounded-lg bg-black/50 border text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] ${
              wrongServer
                ? 'border-[#DC143C] shadow-[0_0_10px_rgba(220,20,60,0.35)]'
                : server.trim()
                  ? 'border-[#2d6a2d] shadow-[0_0_8px_rgba(45,106,45,0.25)]'
                  : 'border-[rgba(102,0,0,0.3)] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]'
            }`}
          />

          {wrongServer && (
            <p className="mt-2 flex items-start gap-2 px-4 py-3 rounded-lg bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.35)] font-body text-[13px] text-[#DC143C] animate-shake">
              <span className="font-bold">This tournament is EUNE only.</span>
              <span className="text-neutral-300">
                Your account is on {typedServer}, so you can&apos;t enter this one.
              </span>
            </p>
          )}
        </div>
      )}

      {needsRole && (
        <div className="mb-6 animate-field-slide-in" style={{ animationDelay: `${0.15 + fields.length * 0.1}s` }}>
          <RoleDropdown value={role} onChange={setRole} />
        </div>
      )}

      <p className="flex items-start gap-3 mt-7 px-[18px] py-3.5 rounded-lg bg-[rgba(220,20,60,0.07)] border border-[rgba(220,20,60,0.25)] border-l-[3px] border-l-[#DC143C] font-slogan text-[15px] leading-[22px] text-neutral-300 shadow-[0_0_16px_rgba(220,20,60,0.08)]">
        <span className="shrink-0 mt-0.5 font-bold tracking-wider uppercase text-[13px] text-[#DC143C] whitespace-nowrap">
          Attention:
        </span>
        {attention}
      </p>

      {serverError && (
        <p className="mt-4 flex items-center gap-2 font-body text-sm px-4 py-3 rounded-xl bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.3)] text-[#DC143C]">
          {serverError}
        </p>
      )}
      {success && (
        <p className="mt-4 flex items-center gap-2 font-body text-sm px-4 py-3 rounded-xl bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.3)] text-[#4ade80]">
          You are registered! Good luck, summoner.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || (needsServer && !!server && server !== 'EUNE')}
        className="btn-ripple block ml-auto mt-5 relative overflow-hidden rounded-[20px] px-6 py-[15px] font-slogan text-[11px] font-bold uppercase tracking-[2px] cursor-pointer border-0 text-white bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_0_20px_rgba(102,0,0,0.8)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : buttonLabel}
      </button>
    </form>
  );
}
