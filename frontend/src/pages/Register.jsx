import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, Leaf, Check } from 'lucide-react';
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

const PERKS = [
  'Track your daily nature connection score',
  'Log field observations with AI identification',
  'Discover nearby habitats and green spaces',
  'Get personalised eco-action suggestions',
];

export default function Register() {
  const { user, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  if (!loading && user) return <Navigate to="/app" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: name.trim() || undefined } },
      });
      if (err) throw err;
      setInfo('Account created! Check your email to confirm, or sign in directly if confirmation is disabled.');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setInfo('');
    setGoogleBusy(true);
    try { await signInWithGoogle('NaturePulse'); }
    catch (err) { setError(err?.message || 'Google sign-up failed.'); }
    finally { setGoogleBusy(false); }
  };

  const isDisabled = busy || googleBusy;

  return (
    <div className="min-h-screen flex bg-cream">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col overflow-hidden bg-forest">
        <img
          src="/forest_pond.jpg"
          alt="Forest pond at dawn"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        {/* deep green overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/50 to-ink/90" />

        {/* brand */}
        <div className="relative z-10 p-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center shadow-lg">
              <Leaf size={18} className="text-white" strokeWidth={2} />
            </div>
            <span style={{ fontFamily: 'Georgia, serif' }} className="text-xl font-semibold text-white tracking-tight">
              NaturePulse
            </span>
          </Link>
        </div>

        {/* main copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10">
          <p className="text-gold text-xs font-semibold uppercase tracking-[0.22em] mb-3">Begin your journey</p>
          <h2 style={{ fontFamily: 'Georgia, serif' }} className="text-white text-4xl font-bold leading-tight mb-6">
            Reconnect with<br />the living world
          </h2>
          <div className="space-y-3.5">
            {PERKS.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="text-gold" strokeWidth={2.5} />
                </div>
                <span className="text-white/70 text-sm leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* bottom stat strip */}
        <div className="relative z-10 p-10">
          <div className="grid grid-cols-3 gap-4">
            {[['12k+', 'Members'], ['48', 'Cities'], ['Free', 'Always']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p style={{ fontFamily: 'Georgia, serif' }} className="text-white text-2xl font-bold">{val}</p>
                <p className="text-white/40 text-[11px] uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-ink">
        {/* mobile logo */}
        <div className="lg:hidden mb-8 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center">
            <Leaf size={18} className="text-cream" strokeWidth={2} />
          </div>
          <span style={{ fontFamily: 'Georgia, serif' }} className="text-xl font-semibold text-ink">NaturePulse</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-2">Create account</p>
            <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-[2.1rem] font-bold text-ink leading-tight">
              Start your nature<br />connection today
            </h1>
            <p className="text-forest/70 text-sm mt-2.5">
              Already have an account?{' '}
              <Link to="/login" className="text-ink font-semibold hover:underline underline-offset-2">
                Sign in →
              </Link>
            </p>
          </div>

          {/* google */}
          <button
            onClick={handleGoogle}
            disabled={isDisabled}
            className="w-full flex items-center justify-center gap-3 bg-paper border border-ink/10 rounded-xl py-3.5 text-sm font-medium text-ink hover:bg-cream hover:border-ink/20 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-5"
          >
            {googleBusy ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            {googleBusy ? 'Connecting…' : 'Sign up with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-forest/50 font-medium">or with email</span>
            <div className="flex-1 h-px bg-ink/10" />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="mt-0.5">⚠</span> {error}
            </div>
          )}
          {info && (
            <div className="mb-4 bg-sage/20 border border-sage/40 rounded-xl px-4 py-3 text-sm text-forest flex items-start gap-2">
              <Check size={15} className="text-forest mt-0.5 shrink-0" /> {info}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest/70 mb-1.5">
                Your name <span className="text-forest/40 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How Pulse will address you"
                disabled={isDisabled}
                className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-3.5 text-sm text-ink placeholder:text-forest/30 outline-none focus:border-ink focus:ring-3 focus:ring-ink/10 transition-all duration-200 disabled:opacity-50"
              />
            </div>

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
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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
              {/* password strength */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-forest'
                          : 'bg-ink/10'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full mt-2 bg-ink text-paper rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-forest active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : <>Create free account <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-[11px] text-forest/50 mt-6 leading-relaxed">
            By creating an account you agree to our{' '}
            <span className="underline cursor-pointer hover:text-forest/70">Terms of Service</span>
            {' '}&amp;{' '}
            <span className="underline cursor-pointer hover:text-forest/70">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
