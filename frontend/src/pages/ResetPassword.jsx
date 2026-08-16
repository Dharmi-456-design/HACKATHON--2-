import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import supabase from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const query = new URLSearchParams(window.location.search);
    const code = hash.get('code') || query.get('code');
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    const type = hash.get('type') || query.get('type');

    (async () => {
      try {
        if (code && type === 'recovery') {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        }
      } catch (err) {
        setError('This reset link is invalid or has expired. Request a new one from the sign-in page.');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err?.message || 'Could not update your password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-ink">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
          <img src="/logo.png" alt="NaturePulse Logo" className="w-9 h-9 rounded-xl object-cover shadow-lg" />
          <span style={{ fontFamily: 'Georgia, serif' }} className="text-xl font-semibold text-ink tracking-tight">
            NaturePulse
          </span>
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold mb-2">Account recovery</p>
          <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-[2rem] font-bold text-ink leading-tight">
            Choose a new password
          </h1>
        </div>

        {done && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={16} /> Password updated. Redirecting to sign in…
          </div>
        )}

        {!ready && (
          <div className="py-10 flex justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-moss/30 border-t-moss animate-spin" />
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <span className="mt-0.5 text-red-500">⚠</span> {error}
          </div>
        )}

        {ready && !done && (
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest/70 mb-1.5">
                New password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={busy}
                className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-3.5 pr-11 text-sm text-ink placeholder:text-forest/30 outline-none focus:border-ink focus:ring-3 focus:ring-ink/10 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 bottom-3.5 text-forest/50 hover:text-ink transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest/70 mb-1.5">
                Confirm new password
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={busy}
                className="w-full bg-paper border border-ink/10 rounded-xl px-4 py-3.5 text-sm text-ink placeholder:text-forest/30 outline-none focus:border-ink focus:ring-3 focus:ring-ink/10 transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 bg-ink text-paper rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-forest active:scale-[0.98] transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : <>Update password <ArrowRight size={15} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
