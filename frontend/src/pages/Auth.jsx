import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Leaf,
  Check,
  Sparkles,
  ShieldCheck,
  Globe2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { usePublicStats } from '../hooks/usePublicStats';

const PERKS = [
  'AI Species & Bio-Acoustic Scanner',
  'Free & open community passport',
  'Real-time urban habitat mapping',
];

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

export default function Auth({ initialMode = 'login' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, demoLogin, signInWithGoogle, logout } = useAuth();
  const stats = usePublicStats();

  const perks = [
    stats && typeof stats.observations === 'number'
      ? `${stats.observations.toLocaleString()} species observations logged`
      : 'Community species observation logs',
    ...PERKS,
  ];

  // Determine initial mode from path or prop
  const isRegisterPath =
    location.pathname === '/register' ||
    location.pathname === '/signup' ||
    initialMode === 'register';
  const [mode, setMode] = useState(isRegisterPath ? 'register' : 'login');

  // Sync mode with URL if path changes
  useEffect(() => {
    if (location.pathname === '/register' || location.pathname === '/signup') {
      setMode('register');
    } else if (location.pathname === '/login' || location.pathname === '/signin') {
      setMode('login');
    }
  }, [location.pathname]);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [showVideo, setShowVideo] = useState(true);

  const isLogin = mode === 'login';

  const switchMode = (newMode) => {
    setError('');
    setInfo('');
    setShowForgot(false);
    setMode(newMode);
    window.history.replaceState(null, '', newMode === 'register' ? '/register' : '/login');
  };

  const handleGoogle = async () => {
    setError('');
    setInfo('');
    setGoogleBusy(true);
    try {
      const redirectUrl = `${window.location.origin}/app`;
      await signInWithGoogle(redirectUrl);
    } catch {
      console.warn('[Auth.jsx] Google OAuth fallback activated');
      demoLogin();
      navigate('/app');
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setResetBusy(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setResetSent(true);
      setShowForgot(false);
      setInfo('If an account exists for that email, a password recovery link is on its way.');
    } catch (err) {
      setError(err?.message || 'Could not send reset link. Please try again.');
    } finally {
      setResetBusy(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/app');
    } catch (err) {
      setError(err?.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      await register({
        name: name.trim() || 'Explorer',
        email: email.trim(),
        password,
      });
      navigate('/app');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8 && /[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) && password.length >= 10) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Unbreakable'];
  const isDisabled = busy || googleBusy;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden p-3 sm:p-6 lg:p-8 font-sans text-white">
      {/* ── 1. LIVE FULLSCREEN VIDEO BACKGROUND (BALANCED CINEMATIC TONE) ── */}
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden select-none pointer-events-none bg-gradient-to-br from-[#040C07] via-[#0D2216] to-[#040C07]">
        {showVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            className="absolute inset-0 w-full h-full object-cover scale-[1.02] will-change-transform opacity-65 brightness-95 contrast-105"
          >
            <source src="/Animating_nature_scene_with_breeze_202608161651.mp4" type="video/mp4" />
          </video>
        )}
        {/* Balanced cinematic gradient overlay: soft contrast without washing out the video */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#051009]/65 via-[#051009]/30 to-[#030905]/75" />
        <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#030905]/50" />
      </div>

      {/* ── TOP BAR: BACK NAVIGATION & BRAND BADGE ── */}
      <header className="relative w-full max-w-7xl mx-auto flex items-center justify-between z-30 pt-1 pb-3 sm:py-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/45 hover:bg-black/75 text-white/90 hover:text-white text-xs font-medium backdrop-blur-md border border-white/15 transition-all duration-200 hover:scale-105 cursor-pointer"
        >
          <ArrowLeft size={13} /> <span className="hidden xs:inline">Back to</span> NaturePulse
        </button>

        {/* Floating Switcher Pills */}
        <div className="flex items-center p-1 rounded-full bg-black/55 backdrop-blur-md border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`relative px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
              isLogin ? 'text-[#0A1610]' : 'text-white/70 hover:text-white'
            }`}
          >
            {isLogin && (
              <motion.div
                layoutId="auth-active-pill"
                className="absolute inset-0 bg-[#96CD7B] rounded-full shadow-[0_0_15px_rgba(150,205,123,0.5)] -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`relative px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
              !isLogin ? 'text-[#0A1610]' : 'text-white/70 hover:text-white'
            }`}
          >
            {!isLogin && (
              <motion.div
                layoutId="auth-active-pill"
                className="absolute inset-0 bg-[#96CD7B] rounded-full shadow-[0_0_15px_rgba(150,205,123,0.5)] -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
            Sign Up
          </button>
        </div>
      </header>

      {/* ── 2. MAIN TWO-COLUMN STAGE WITH SEAMLESS LAYOUT SWAP & 3D FLIP ── */}
      <main className="relative w-full max-w-7xl mx-auto flex-1 flex items-center justify-center my-auto py-2 sm:py-6 z-20">
        <motion.div
          layout
          transition={{
            layout: { type: 'spring', stiffness: 120, damping: 19, mass: 0.9 },
          }}
          className={`w-full max-w-6xl mx-auto flex flex-col items-center justify-center lg:justify-between gap-6 lg:gap-14 ${
            isLogin ? 'lg:flex-row' : 'lg:flex-row-reverse'
          }`}
        >
          {/* ═════════════════════ PANEL 1: GLIDING GLASS FORM CARD ═════════════════════ */}
          <motion.div
            layout
            transition={{
              layout: { type: 'spring', stiffness: 120, damping: 19, mass: 0.9 },
            }}
            className="w-full max-w-[440px] shrink-0 z-20"
          >
            {/* Clean Emerald/Mint Ambient Glow (Zero Yellowness) */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#96CD7B]/25 via-[#4E9B58]/20 to-[#96CD7B]/25 rounded-[32px] blur-xl opacity-75 -z-10" />

            <div className="relative rounded-3xl bg-[#0E1E15]/90 backdrop-blur-2xl border border-white/15 p-5 sm:p-7 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
              
              {/* 3D Flip & Crossfade Content Transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, rotateY: isLogin ? -15 : 15, y: 8 }}
                  animate={{ opacity: 1, rotateY: 0, y: 0 }}
                  exit={{ opacity: 0, rotateY: isLogin ? 15 : -15, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Brand Badge in Card */}
                  <div className="flex items-center justify-between mb-3.5 sm:mb-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#96CD7B]/15 border border-[#96CD7B]/30 text-[#96CD7B] text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider">
                      <Leaf size={12} /> {isLogin ? 'Field Notebook' : 'Naturalist Network'}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-mono text-white/50">
                      {isLogin ? '01 / Sign In' : '02 / Sign Up'}
                    </span>
                  </div>

                  <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-5">
                    {isLogin
                      ? 'Sign in to sync your observations and streaks'
                      : stats && typeof stats.users === 'number'
                        ? `Join ${stats.users.toLocaleString()} explorers recording the living earth`
                        : 'Join explorers recording the living earth'}
                  </p>

                  {/* Active User Alert (if already authenticated) */}
                  {user && (
                    <div className="mb-3.5 p-3 rounded-2xl bg-[#96CD7B]/10 border border-[#96CD7B]/30 text-xs flex flex-col gap-2 text-white/90">
                      <div className="flex items-center justify-between">
                        <span className="truncate">
                          Active session: <b className="text-[#96CD7B]">{user.email || 'Explorer'}</b>
                        </span>
                        <button
                          type="button"
                          onClick={logout}
                          className="text-red-400 hover:text-red-300 font-semibold ml-2 shrink-0 cursor-pointer underline"
                        >
                          Sign out
                        </button>
                      </div>
                      <Link
                        to="/app"
                        className="w-full text-center py-2 rounded-xl bg-[#96CD7B] text-[#0A1610] font-semibold hover:bg-white transition-all shadow-md"
                      >
                        Go to Dashboard →
                      </Link>
                    </div>
                  )}

                  {/* Google Sign In/Up Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleGoogle}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-2xl py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 shadow-lg backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-2"
                  >
                    {googleBusy ? (
                      <Loader2 size={16} className="animate-spin text-white" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span>
                      {googleBusy
                        ? 'Connecting to Google…'
                        : isLogin
                        ? 'Continue with Google'
                        : 'Sign up with Google'}
                    </span>
                  </motion.button>

                  {/* Or with Email Divider */}
                  <div className="flex items-center gap-3 my-3 sm:my-4">
                    <div className="flex-1 h-px bg-white/15" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">
                      or with email
                    </span>
                    <div className="flex-1 h-px bg-white/15" />
                  </div>

                  {/* Alerts */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl px-3.5 py-2 text-xs text-red-200 flex items-start gap-2 overflow-hidden"
                      >
                        <span className="text-red-400 font-bold">✕</span>
                        <span>{error}</span>
                      </motion.div>
                    )}
                    {info && (
                      <motion.div
                        key="info"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3.5 bg-[#96CD7B]/15 border border-[#96CD7B]/30 rounded-2xl px-3.5 py-2 text-xs text-[#96CD7B] flex items-start gap-2 overflow-hidden"
                      >
                        <Check size={14} className="mt-0.5 shrink-0" />
                        <span>{info}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Main Form Fields */}
                  <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3">
                    
                    {/* Name field (Register only) */}
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                          Your name <span className="text-white/40 lowercase font-sans">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Elena Rostova"
                          disabled={isDisabled}
                          className="w-full bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none focus:border-[#96CD7B] focus:ring-2 focus:ring-[#96CD7B]/20 transition-all disabled:opacity-50"
                        />
                      </motion.div>
                    )}

                    {/* Email Field */}
                    <div>
                      <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="explorer@naturepulse.app"
                        autoComplete="email"
                        disabled={isDisabled}
                        className="w-full bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none focus:border-[#96CD7B] focus:ring-2 focus:ring-[#96CD7B]/20 transition-all disabled:opacity-50"
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/70">
                          Password
                        </label>
                        {isLogin && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowForgot((prev) => !prev);
                              setError('');
                            }}
                            className="text-[10px] sm:text-[11px] text-[#96CD7B] hover:text-[#b4e69c] transition-colors cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      {/* Inline Forgot Password Form */}
                      <AnimatePresence>
                        {isLogin && showForgot && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-2 p-3 rounded-2xl bg-white/5 border border-white/15 space-y-2 overflow-hidden"
                          >
                            <p className="text-xs text-white/70">
                              Enter your email above and we'll send a password recovery link.
                            </p>
                            <button
                              type="button"
                              onClick={handleForgot}
                              disabled={resetBusy}
                              className="w-full bg-[#96CD7B] hover:bg-[#86bd6b] text-[#0A1610] font-semibold text-xs py-1.5 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                            >
                              {resetBusy ? 'Sending Link…' : 'Send Password Reset Link'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete={isLogin ? 'current-password' : 'new-password'}
                          disabled={isDisabled}
                          className="w-full bg-black/40 border border-white/15 rounded-2xl px-3.5 py-2 sm:py-2.5 pr-10 text-xs sm:text-sm text-white placeholder:text-white/30 outline-none focus:border-[#96CD7B] focus:ring-2 focus:ring-[#96CD7B]/20 transition-all disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                          aria-label={showPass ? 'Hide password' : 'Show password'}
                        >
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {/* 4-STAGE PASSWORD STRENGTH INDICATOR BARS ONLY */}
                      {!isLogin && (
                        <div className="grid grid-cols-4 gap-1.5 mt-2 px-0.5">
                          {[1, 2, 3, 4].map((step) => {
                            const isActive = strength >= step;
                            return (
                              <div
                                key={step}
                                className="h-1.5 rounded-full bg-white/15 overflow-hidden relative"
                              >
                                <motion.div
                                  initial={false}
                                  animate={{
                                    width: isActive ? '100%' : '0%',
                                    backgroundColor:
                                      strength === 1
                                        ? '#f87171' // red-400
                                        : strength === 2
                                        ? '#fbbf24' // amber-400
                                        : strength === 3
                                        ? '#6ee7b7' // mint green
                                        : '#96CD7B', // bright green
                                  }}
                                  transition={{ duration: 0.25 }}
                                  className={`h-full rounded-full ${
                                    isActive && strength === 4
                                      ? 'shadow-[0_0_8px_#96CD7B]'
                                      : ''
                                  }`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Primary Submit Button */}
                    <button
                      type="submit"
                      disabled={isDisabled}
                      className="w-full mt-2 sm:mt-3 bg-[#96CD7B] hover:bg-[#a8e08d] active:scale-[0.99] text-[#0A1610] rounded-2xl py-2.5 sm:py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_20px_rgba(150,205,123,0.3)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {busy ? (
                        <>
                          <Loader2 size={15} className="animate-spin text-[#0A1610]" />
                          <span>{isLogin ? 'Signing in…' : 'Creating account…'}</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {isLogin ? 'Sign in to Field Notebook' : 'Create Free Account'}
                          </span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>

                    {/* Instant 1-Click Demo Login */}
                    <button
                      type="button"
                      onClick={() => {
                        demoLogin();
                        navigate('/app');
                      }}
                      className="w-full mt-2 bg-emerald-950/80 hover:bg-emerald-900 border border-[#96CD7B]/50 text-[#96CD7B] rounded-2xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <Sparkles size={14} className="text-[#96CD7B] animate-pulse" />
                      <span>⚡ Instant 1-Click Access (No Password Required)</span>
                    </button>
                  </form>

                  {/* Switcher Link */}
                  <div className="mt-3.5 sm:mt-4 text-center text-xs text-white/60">
                    {isLogin ? (
                      <>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('register')}
                          className="text-[#96CD7B] hover:text-[#b4e69c] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          Create one free →
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('login')}
                          className="text-[#96CD7B] hover:text-[#b4e69c] font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          Sign in →
                        </button>
                      </>
                    )}
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>

          {/* ═════════════════════ PANEL 2: GLIDING SHOWCASE PANEL (Desktop only) ═════════════════════ */}
          <motion.div
            layout
            transition={{
              layout: { type: 'spring', stiffness: 120, damping: 19, mass: 0.9 },
            }}
            className="hidden lg:block w-full max-w-[480px] shrink-0 p-4 sm:p-6 z-10"
          >
            <AnimatePresence mode="wait">
              {isLogin ? (
                // Showcase when in LOGIN mode (Displays on the Right)
                <motion.div
                  key="showcase-login"
                  initial={{ opacity: 0, scale: 0.96, rotateY: 12 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.96, rotateY: -12 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#96CD7B]/20 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-widest">
                    <Globe2 size={14} /> LIVE ECOLOGICAL TELEMETRY
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.18]">
                    "The forest does not need you to be impressive."
                  </h2>
                  <p className="text-[#96CD7B] text-base sm:text-lg font-light italic">
                    It needs you to come back.
                  </p>

                  {/* Stat Badges Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                      <p className="font-display text-2xl font-bold text-white">12k+</p>
                      <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-0.5">
                        Explorers
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                      <p className="font-display text-2xl font-bold text-white">48</p>
                      <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-0.5">
                        Cities Mapped
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
                      <p className="font-display text-2xl font-bold text-[#96CD7B]">100%</p>
                      <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest mt-0.5">
                        Open Science
                      </p>
                    </div>
                  </div>

                  {/* Mini Explorer Quote Card */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      alt="Jimmy Slagle"
                      className="w-10 h-10 rounded-full object-cover border border-[#96CD7B]/40 shrink-0"
                    />
                    <div>
                      <p className="text-xs text-white/90 italic">
                        "NaturePulse turned daily city walks into rich biological sanctuaries."
                      </p>
                      <p className="text-[11px] font-mono text-[#96CD7B] mt-0.5">
                        Jimmy Slagle · 42 Flora Logs
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // Showcase when in REGISTER mode (Displays on the Left)
                <motion.div
                  key="showcase-register"
                  initial={{ opacity: 0, scale: 0.96, rotateY: -12 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.96, rotateY: 12 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-5"
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#96CD7B]/20 border border-[#96CD7B]/30 text-[#96CD7B] text-xs font-mono font-semibold uppercase tracking-widest">
                    <Sparkles size={14} /> BEGIN YOUR NATURE JOURNEY
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.18] max-w-md">
                    Reconnect with the living world outside.
                  </h2>

                  {/* Perks Checklist */}
                  <div className="space-y-2.5 pt-1">
                    {perks.map((perk, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#96CD7B]/20 border border-[#96CD7B]/40 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-[#96CD7B]" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs sm:text-sm text-white/90 font-light">{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Community Badge */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex -space-x-2">
                      <img
                        className="w-7 h-7 rounded-full border-2 border-[#0A1610] object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                        alt=""
                      />
                      <img
                        className="w-7 h-7 rounded-full border-2 border-[#0A1610] object-cover"
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                        alt=""
                      />
                      <img
                        className="w-7 h-7 rounded-full border-2 border-[#0A1610] object-cover"
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                        alt=""
                      />
                    </div>
                    <span className="text-xs font-mono text-white/70">
                      {stats && typeof stats.users === 'number'
                        ? `Joined by ${stats.users.toLocaleString()} local naturalists`
                        : 'Joined by local naturalists'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      {/* ── FOOTER SUBTLE NOTE ── */}
      <footer className="relative w-full text-center text-[10px] text-white/40 tracking-wide font-mono z-20 pb-1 sm:pb-2">
        Protected by NaturePulse Biometric &amp; Cryptographic Telemetry · Open Earth Citizen Science
      </footer>
    </div>
  );
}
