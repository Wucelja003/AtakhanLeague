import { useState } from 'react';
import { api } from '../api';

// Placeholder topics — final list to be decided later
const topics = [
  'Tournament Registration',
  'Account Issue',
  'Technical Support',
  'Partnership / Sponsorship',
  'Report a Player',
  'Other',
];

export default function ContactUs() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    topic: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic) {
      setError('Please select a topic.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Hook this to your backend endpoint when ready
      const res = await fetch(api('/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message || 'Failed to send. Please try again.');
        return;
      }
      setSuccess(true);
      setFormData({ email: '', username: '', topic: '', message: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]';
  const labelClass =
    'block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2';

  return (
    <section className="relative z-[2] min-h-[calc(100vh-200px)] px-5 py-20 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Heading */}
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Get In Touch
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            Contact Us
          </h1>
          <p className="font-body text-base text-neutral-400 mt-4 max-w-md mx-auto">
            Send us a message — pick a topic, drop your details, and we'll get back to you.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-10 py-10 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Topic chips */}
            <div className="animate-field-slide-in" style={{ animationDelay: '0.15s' }}>
              <label className={labelClass}>What's this about?</label>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => {
                  const active = formData.topic === t;
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFormData({ ...formData, topic: t })}
                      className={`font-slogan text-[12px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-full border transition-all duration-200 ${
                        active
                          ? 'bg-[rgba(220,20,60,0.18)] border-[#DC143C] text-white shadow-[0_0_12px_rgba(220,20,60,0.35)]'
                          : 'bg-black/40 border-[rgba(102,0,0,0.3)] text-neutral-400 hover:border-[#660000] hover:text-neutral-200'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summoner Name */}
            <div className="animate-field-slide-in" style={{ animationDelay: '0.25s' }}>
              <label htmlFor="username" className={labelClass}>
                Summoner Name
              </label>
              <input
                type="text"
                id="username"
                required
                placeholder="YourSummonerName"
                value={formData.username}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="animate-field-slide-in" style={{ animationDelay: '0.35s' }}>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div className="animate-field-slide-in" style={{ animationDelay: '0.45s' }}>
              <label htmlFor="message" className={labelClass}>
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                placeholder="Tell us what's on your mind..."
                value={formData.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Feedback */}
            {error && (
              <p className="flex items-center gap-2 font-body text-sm px-4 py-3 rounded-xl bg-[rgba(220,20,60,0.08)] border border-[rgba(220,20,60,0.3)] text-[#DC143C]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {error}
              </p>
            )}
            {success && (
              <p className="flex items-center gap-2 font-body text-sm px-4 py-3 rounded-xl bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.3)] text-[#4ade80]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Message sent. We'll get back to you soon.
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-ripple mt-2 relative overflow-hidden w-full font-slogan text-[12px] font-bold uppercase tracking-[3px] text-white border-0 rounded-xl py-3.5 cursor-pointer bg-[length:300%_300%] bg-[linear-gradient(270deg,#660000,#8B0000,#DC143C,#8B0000,#660000)] animate-wind-flow-login transition-all duration-300 hover:-translate-y-0.5 hover:animate-wind-flow-fast hover:shadow-[0_0_24px_rgba(220,20,60,0.6)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
