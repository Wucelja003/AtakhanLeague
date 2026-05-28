import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserStart, deleteUserSuccess, deleteUserFailure,
  signOutUserStart, signOutUserSuccess, signOutUserFailure,
} from '../redux/user/userSlice';

const roleIcons = {
  top: '/Icons/Top_icon.png',
  jungle: '/Icons/Jungle_icon.png',
  mid: '/Icons/Middle_icon.png',
  adc: '/Icons/Bottom_icon.png',
  support: '/Icons/Support_icon.png',
};

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [registration, setRegistration] = useState({ team: null, individual: null });
  const [regLoading, setRegLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch current user's registration on mount
  useEffect(() => {
    if (!currentUser) return;
    fetch('/api/registration/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setRegistration(data))
      .catch(() => setRegistration({ team: null, individual: null }));
  }, [currentUser]);

  const handleCancelRegistration = async (type) => {
    if (!confirm(`Cancel your ${type} registration?`)) return;
    setRegLoading(true);
    try {
      const res = await fetch(`/api/registration/${type}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || data.success === false) return;
      setRegistration((prev) => ({ ...prev, [type]: null }));
    } finally {
      setRegLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to permanently delete your account?')) return;
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess());
      navigate('/');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' });
      dispatch(signOutUserSuccess());
      navigate('/');
    } catch (err) {
      dispatch(signOutUserFailure(err.message));
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative min-h-screen px-5 py-12">
      <div className="mx-auto max-w-xl">
        {/* Eyebrow + heading */}
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-5 border border-[rgba(220,20,60,0.4)] bg-[rgba(220,20,60,0.12)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
            <span className="font-slogan text-xs font-bold uppercase tracking-[3px] text-[#DC143C]">
              Your Profile
            </span>
          </div>
          <h1 className="font-heading text-white text-[clamp(2.5rem,5vw,3.5rem)] leading-none tracking-wide [text-shadow:0_0_18px_rgba(139,0,0,0.8),0_0_40px_rgba(102,0,0,0.4)]">
            {currentUser.username}
          </h1>
          <p className="font-body text-base text-neutral-400 mt-3">
            {currentUser.email}
          </p>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] px-10 py-10 backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)] animate-form-fade-in">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                onClick={() => fileRef.current?.click()}
                src={
                  currentUser.avatar ||
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.username)}&backgroundColor=8B0000&textColor=ffffff`
                }
                alt="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(currentUser.username || 'U')}&backgroundColor=8B0000&textColor=ffffff`;
                }}
                className="w-28 h-28 rounded-2xl object-cover cursor-pointer transition-all duration-200 border-[3px] border-[#DC143C] shadow-[0_0_24px_rgba(220,20,60,0.4)] hover:shadow-[0_0_32px_rgba(220,20,60,0.7)] hover:scale-105"
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer bg-[#DC143C] shadow-[0_0_12px_rgba(220,20,60,0.6)]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <input type="file" ref={fileRef} hidden accept="image/*" />
            </div>
            <p className="font-slogan text-[10px] tracking-[2px] uppercase text-neutral-500 mt-4">
              Tap avatar to change
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="username"
                className="block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2"
              >
                Summoner Name
              </label>
              <input
                type="text"
                id="username"
                defaultValue={currentUser.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                defaultValue={currentUser.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-slogan text-[11px] font-bold uppercase tracking-[2px] text-neutral-400 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Leave empty to keep current"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-[rgba(102,0,0,0.3)] text-white font-slogan text-sm outline-none transition-all duration-300 placeholder:text-[#666] focus:border-[#DC143C] focus:shadow-[0_0_10px_rgba(220,20,60,0.3)]"
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
            {updateSuccess && (
              <p className="flex items-center gap-2 font-body text-sm px-4 py-3 rounded-xl bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.3)] text-[#4ade80]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Profile updated successfully.
              </p>
            )}

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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>

          {/* Tournament Registration Card */}
          <div className="mt-8 pt-8 border-t border-[rgba(102,0,0,0.3)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-slogan text-[11px] font-bold uppercase tracking-[3px] text-[#DC143C] mb-1">
                  Tournament
                </p>
                <h3 className="font-heading text-white text-[22px] leading-none tracking-wide">
                  Your Registration
                </h3>
              </div>
            </div>

            {/* Individual registration */}
            {registration.individual && (
              <div className="rounded-xl bg-[rgba(220,20,60,0.06)] border border-[rgba(220,20,60,0.3)] px-5 py-5 mb-3">
                <div className="flex items-center gap-4">
                  <img
                    src={roleIcons[registration.individual.role]}
                    alt={registration.individual.role}
                    className="w-12 h-12 object-contain shrink-0 [filter:drop-shadow(0_0_8px_rgba(220,20,60,0.5))]"
                  />
                  <div className="flex-1">
                    <p className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] mb-1">
                      Individual — Solo Player
                    </p>
                    <p className="font-heading text-white text-[20px] leading-tight tracking-wide capitalize">
                      {registration.individual.role}
                      <span className="text-neutral-400 text-[14px] ml-2">
                        • {registration.individual.division}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelRegistration('individual')}
                    disabled={regLoading}
                    className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Team registration */}
            {registration.team && (
              <div className="rounded-xl bg-[rgba(220,20,60,0.06)] border border-[rgba(220,20,60,0.3)] px-5 py-5 mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[rgba(220,20,60,0.15)] border border-[rgba(220,20,60,0.4)] shrink-0">
                    <svg className="w-6 h-6 text-[#DC143C]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-slogan text-[10px] font-bold uppercase tracking-[2px] text-[#DC143C] mb-1">
                      Team Captain
                    </p>
                    <p className="font-heading text-white text-[20px] leading-tight tracking-wide">
                      {registration.team.name}
                      <span className="text-neutral-400 text-[14px] ml-2">
                        • {registration.team.division}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelRegistration('team')}
                    disabled={regLoading}
                    className="font-slogan text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!registration.individual && !registration.team && (
              <div className="rounded-xl bg-black/30 border border-dashed border-[rgba(102,0,0,0.4)] px-5 py-7 text-center">
                <p className="font-body text-[14px] text-neutral-400 mb-4">
                  You are not registered for any tournament yet.
                </p>
                <Link
                  to="/"
                  className="inline-block font-slogan text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 rounded-lg text-secondary border border-[rgba(102,0,0,0.4)] bg-black/40 hover:text-white hover:border-[#DC143C] transition-colors"
                >
                  Sign up for next tournament →
                </Link>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="mt-6 pt-5 border-t border-[rgba(102,0,0,0.3)] flex items-center justify-between">
            <button
              onClick={handleDeleteUser}
              className="font-slogan text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-[#ef4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.15)] transition-colors"
            >
              Delete account
            </button>
            <button
              onClick={handleSignOut}
              className="font-slogan text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg text-neutral-300 bg-black/40 border border-[rgba(102,0,0,0.3)] hover:bg-black/60 hover:text-white hover:border-[rgba(102,0,0,0.6)] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
