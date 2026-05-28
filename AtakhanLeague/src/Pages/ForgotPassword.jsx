import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message || 'Something went wrong.');
        return;
      }
      setSuccess(true);
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
              Account Recovery
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            Forgot Password?
          </h1>
          <p className="font-body text-base text-neutral-400 mt-4 max-w-sm mx-auto">
            Enter your email and we'll send you a link to reset your password.
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
                Check your email
              </h3>
              <p className="font-body text-[14px] leading-7 text-neutral-400 mb-6">
                If an account exists for <span className="text-white">{email}</span>,
                you'll receive a reset link shortly.
              </p>
              <Link
                to="/sign-in"
                className="font-slogan text-[11px] font-bold uppercase tracking-[2px] text-secondary hover:text-[#DC143C] transition-colors"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="animate-field-slide-in" style={{ animationDelay: '0.15s' }}>
                <label
                  htmlFor="email"
                  className="block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
                />
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
                disabled={loading}
                className="btn-ripple animate-field-slide-in mt-3 relative overflow-hidden w-full font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white border-0 rounded-xl py-3.5 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_0_24px_rgba(220,20,60,0.6)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ animationDelay: '0.25s' }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <p className="text-center font-body text-sm mt-2 text-neutral-400">
                Remember your password?{' '}
                <Link to="/sign-in" className="font-bold text-secondary hover:text-[#DC143C] transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
