import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, Leaf } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { useAuth } from '../contexts/AuthContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  const { user, loading, enterDemoMode, exitDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Please fill in both fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) throw err;
    } catch (err) {
      setError(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleBusy(true);
    try { await signInWithGoogle('NaturePulse'); }
    catch (err) { setError(err?.message || 'Google sign-in failed.'); }
    finally { setGoogleBusy(false); }
  };

  const isDisabled = busy || googleBusy;

  return (
    <div className="min-h-screen flex bg-cream">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col overflow-hidden">
        <img
          src="/login_nature.jpg"
          alt="Sunlit birch forest"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* subtle gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest/40 via-transparent to-ink/80" />

        {/* brand badge top-left */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img src="/logo.png" alt="NaturePulse Logo" className="w-9 h-9 rounded-xl object-cover shadow-lg" />
            <span style={{ fontFamily: 'Georgia, serif' }} className="text-xl font-semibold text-white drop-shadow-sm tracking-tight">
              NaturePulse
            </span>
          </Link>
        </div>

        {/* bottom quote */}
        <div className="relative z-10 mt-auto p-10">
          <div className="bg-ink/30 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p style={{ fontFamily: 'Georgia, serif' }} className="text-white text-2xl leading-snug font-medium">
              "The forest does not need you<br />to be impressive."
            </p>
            <p className="text-white/80 text-sm mt-3">It needs you to come back.</p>
            <div className="flex items-center gap-2 mt-5">
              <img src="/logo.png" alt="NaturePulse Logo" className="w-7 h-7 rounded-full object-cover" />
              <span className="text-white/90 text-xs uppercase tracking-widest">NaturePulse · Nature Connection</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative text-ink">
        {/* mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="NaturePulse Logo" className="w-9 h-9 rounded-xl object-cover" />
          <span style={{ fontFamily: 'Georgia, serif' }} className="text-xl font-semibold text-ink">NaturePulse</span>
        </div>

        <div className="w-full max-w-[400px]">
          {/* heading */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-2">Welcome back</p>
            <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-[2.2rem] font-bold text-ink leading-tight">
              Sign in to your<br />field notebook
            </h1>
            <p className="text-forest/70 text-sm mt-2.5">
              Don't have an account?{' '}
              <Link to="/register" className="text-ink font-semibold hover:underline underline-offset-2">
                Create one free →
              </Link>
            </p>
          </div>

          {user && (
            <div className="mb-5 p-4 rounded-xl bg-forest/10 border border-forest/20 text-xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-forest/80 font-medium truncate">Signed in as <b>{user.email || 'Current User'}</b></span>
                <button
                  type="button"
                  onClick={exitDemoMode}
                  className="text-red-600 hover:underline font-semibold ml-2 shrink-0 cursor-pointer"
                >
                  Sign out
                </button>
              </div>
              <Link
                to="/app"
                className="w-full text-center py-2 rounded-lg bg-forest text-cream font-semibold hover:bg-ink transition-colors"
              >
                Go to Dashboard →
              </Link>
            </div>
          )}

          {/* google button */}
          <button
            onClick={handleGoogle}
            disabled={isDisabled}
            className="w-full flex items-center justify-center gap-3 bg-paper border border-ink/10 rounded-xl py-3.5 text-sm font-medium text-ink hover:bg-cream hover:border-ink/20 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            {googleBusy ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            {googleBusy ? 'Connecting…' : 'Continue with Google'}
          </button>

          {/* divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-forest/50 font-medium">or with email</span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>

          {/* error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="mt-0.5 text-red-500">⚠</span> {error}
            </div>
          )}

          {/* form */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest/70 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isDisabled}
                className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-3.5 text-sm text-ink placeholder:text-forest/30 outline-none focus:border-ink focus:ring-3 focus:ring-ink/10 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest/70">
                  Password
                </label>
                <button type="button" className="text-xs text-forest/50 hover:text-ink transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isDisabled}
                  className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-3.5 pr-11 text-sm text-ink placeholder:text-forest/30 outline-none focus:border-ink focus:ring-3 focus:ring-ink/10 transition-all duration-200 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest/50 hover:text-ink transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full mt-2 bg-ink text-paper rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-forest active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-[11px] text-forest/50 mt-8">
            By continuing you agree to our{' '}
            <span className="underline cursor-pointer hover:text-forest/70">Terms</span> &amp;{' '}
            <span className="underline cursor-pointer hover:text-forest/70">Privacy Policy</span>
          </p>

          {/* ── 1-CLICK DEMO LOGIN ── */}
          <div className="mt-6 rounded-2xl border-2 border-dashed border-gold/40 bg-gold/10 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gold font-semibold mb-1 text-center">
              🎭 Hackathon Instant Demo
            </p>
            <p className="text-xs text-forest/70 text-center mb-3">
              One-click entry to explore all features instantly without authentication.
            </p>
            <button
              type="button"
              onClick={enterDemoMode}
              className="w-full rounded-xl bg-forest text-cream text-sm font-semibold py-3 hover:bg-ink transition-all shadow-md flex items-center justify-center gap-2"
            >
              🚀 Launch Demo Mode (1-Click Login) →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
