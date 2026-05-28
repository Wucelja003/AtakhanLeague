import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const passwordRules = [
  { test: (v) => v.length >= 6, label: 'At least 6 characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase letter' },
  { test: (v) => /[a-z]/.test(v), label: 'One lowercase letter' },
  { test: (v) => /\d/.test(v), label: 'One number' },
];

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const allRulesPassed = passwordRules.every((r) => r.test(password));
  const passwordsMatch = password === confirm && password.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesPassed) return setError('Password does not meet all requirements.');
    if (!passwordsMatch) return setError('Passwords do not match.');

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message || 'Token expired or invalid. Request a new link.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/sign-in'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Set New Password
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            Reset Password
          </h1>
          <p className="font-body text-base text-neutral-400 mt-4 max-w-sm mx-auto">
            Choose a new password for your Atakhan League account.
          </p>
        </div>

        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-10 py-10 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in">
          {success ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.3)] mb-5">
                <svg className="w-6 h-6 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-heading text-white text-[24px] leading-none tracking-wide mb-3">
                Password updated
              </h3>
              <p className="font-body text-[14px] text-neutral-400">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* New password */}
              <div className="animate-field-slide-in" style={{ animationDelay: '0.15s' }}>
                <label
                  htmlFor="password"
                  className="block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-neutral-500 hover:text-[#DC143C] transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password checklist */}
                {password.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {passwordRules.map((rule, i) => {
                      const passed = rule.test(password);
                      return (
                        <li
                          key={i}
                          className={`flex items-center gap-2 font-slogan text-[11px] tracking-wider transition-colors duration-200 ${
                            passed ? 'text-[#4ade80]' : 'text-neutral-500'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors duration-200 ${
                              passed
                                ? 'bg-[rgba(74,222,128,0.15)] border-[#4ade80]'
                                : 'bg-transparent border-neutral-600'
                            }`}
                          >
                            {passed && (
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Confirm password */}
              <div className="animate-field-slide-in" style={{ animationDelay: '0.3s' }}>
                <label
                  htmlFor="confirm"
                  className="block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm"
                  required
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-black/50 border text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] ${
                    confirm.length > 0 && !passwordsMatch
                      ? 'border-[#DC143C]'
                      : 'border-[rgba(102,0,0,0.3)] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]'
                  }`}
                />
                {confirm.length > 0 && !passwordsMatch && (
                  <p className="mt-2 font-slogan text-[11px] tracking-wider text-[#DC143C]">
                    Passwords do not match
                  </p>
                )}
              </div>

              {error && (
                <p className="flex items-center gap-2 font-body text-sm px-4 py-3 rounded-xl bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.3)] text-[#DC143C]">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !allRulesPassed || !passwordsMatch}
                className="btn-ripple animate-field-slide-in mt-3 relative overflow-hidden w-full font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white border-0 rounded-xl py-3.5 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_0_24px_rgba(220,20,60,0.6)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                style={{ animationDelay: '0.4s' }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>

              <p className="text-center font-body text-sm mt-2 text-neutral-400">
                <Link to="/sign-in" className="font-bold text-secondary hover:text-[#DC143C] transition-colors">
                  ← Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
