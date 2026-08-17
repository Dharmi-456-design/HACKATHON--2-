import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Globe, Clock, Sparkles, CheckCircle2, Save, Shield, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, INTERESTS } from '../lib/api';

const DEFAULT_PROFILE = {
  display_name: 'Nature Explorer',
  city: 'Ahmedabad',
  region: 'Gujarat',
  available_minutes: 25,
  bio: 'Exploring urban nature sanctuaries, songbird corridors, and native shade trees in Gujarat.',
  interests: ['birds', 'trees & bark', 'moss & fungi', 'rivers & rain', 'urban wild'],
};

export default function Settings() {
  const { session, user } = useAuth();
  const { isDark } = useTheme();
  const token = session?.access_token;

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch('/api/profile', {}, token)
      .then((data) => {
        if (!mounted) return;
        if (data && typeof data === 'object') {
          setProfile({
            display_name: data.display_name || DEFAULT_PROFILE.display_name,
            city: data.city || DEFAULT_PROFILE.city,
            region: data.region || DEFAULT_PROFILE.region,
            available_minutes: data.available_minutes || DEFAULT_PROFILE.available_minutes,
            bio: data.bio || DEFAULT_PROFILE.bio,
            interests: Array.isArray(data.interests) && data.interests.length > 0 ? data.interests : DEFAULT_PROFILE.interests,
          });
        }
      })
      .catch(() => {
        // Fallback gracefully to default profile
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const toggleInterest = (interest) => {
    setProfile((prev) => {
      const current = prev.interests || [];
      const updated = current.includes(interest)
        ? current.filter((x) => x !== interest)
        : [...current, interest];
      return { ...prev, interests: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.display_name?.trim() || !profile.city?.trim()) {
      setError('Display name and city are required.');
      return;
    }
    setBusy(true);
    setError('');
    setSaved('');
    try {
      if (token) {
        const next = await apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(profile) }, token);
        if (next) {
          setProfile((prev) => ({ ...prev, ...next }));
        }
      }
      setSaved('Profile & Ecological preferences saved successfully! Pulse AI will personalize your field missions.');
      setTimeout(() => setSaved(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile preferences');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-sm text-emerald-400">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 animate-spin text-[#4ADE80]" />
          <span>Opening profile configuration…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full px-4 sm:px-6 py-10 transition-colors duration-300 font-sans selection:bg-[#4ADE80]/30 selection:text-white ${
      isDark ? 'bg-[#07130B] text-slate-100' : 'bg-[#F9F6F0] text-slate-900'
    }`}>
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="space-y-2 text-left">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border ${
            isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            SETTINGS & PREFERENCES
          </span>
          <h1 className={`font-display text-4xl sm:text-5xl font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            How Pulse knows you
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            City and region only. {user?.email || 'dharmipatel.cg@gmail.com'}
          </p>
        </div>

        {/* Main Settings Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-6 sm:p-9 shadow-2xl border backdrop-blur-xl relative overflow-hidden transition-colors ${
            isDark ? 'bg-[#112318]/90 border-[#20452F] text-white shadow-emerald-950/20' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#4ADE80]/15 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Error & Success Feedback Banners */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm px-4 py-3 font-medium flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-2xl text-xs sm:text-sm px-4 py-3 font-medium border flex items-center gap-2.5 shadow-md ${
                    isDark ? 'bg-[#1A3827] border-[#4ADE80]/40 text-[#4ADE80]' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{saved}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Display Name Field */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Display Name
              </label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="e.g. Nature Explorer"
                  className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium border outline-none transition-all ${
                    isDark
                      ? 'bg-[#0A180F] border-[#20422E] text-white placeholder-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
            </div>

            {/* City & Region Grid Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  City
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g. Ahmedabad"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium border outline-none transition-all ${
                      isDark
                        ? 'bg-[#0A180F] border-[#20422E] text-white placeholder-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Region
                </label>
                <div className="relative">
                  <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={profile.region}
                    onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                    placeholder="e.g. Gujarat"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium border outline-none transition-all ${
                      isDark
                        ? 'bg-[#0A180F] border-[#20422E] text-white placeholder-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Usual Time Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <Clock className="w-4 h-4 text-[#4ADE80]" />
                  <span>Usual Exploration Time</span>
                </label>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {profile.available_minutes || 20} MIN
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={90}
                value={profile.available_minutes || 20}
                onChange={(e) => setProfile({ ...profile, available_minutes: Number(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#4ADE80] bg-[#1E3B29]"
              />
            </div>

            {/* Bio / Relationship with Place Textarea */}
            <div className="space-y-2 pt-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                A sentence about your relationship with place
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Write a short sentence about what draws you to local nature, parks, or species..."
                className={`w-full p-4 rounded-2xl text-sm font-medium border outline-none transition-all resize-none ${
                  isDark
                    ? 'bg-[#0A180F] border-[#20422E] text-white placeholder-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
            </div>

            {/* Ecological Interests Chips */}
            <div className="space-y-3 pt-2">
              <label className={`block text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Heart className="w-4 h-4 text-[#4ADE80]" />
                <span>Ecological Interests</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const active = (profile.interests || []).includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                        active
                          ? isDark
                            ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80] shadow-md shadow-[#4ADE80]/20 scale-105'
                            : 'bg-[#183B28] text-white border-[#183B28] shadow-md scale-105'
                          : isDark
                            ? 'bg-[#0A180F]/80 border-[#20422E] text-slate-300 hover:border-[#4ADE80]/50 hover:text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={busy}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${
                  isDark
                    ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77] shadow-[#4ADE80]/20'
                    : 'bg-[#183B28] text-white hover:bg-[#255239] shadow-emerald-900/20'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{busy ? 'Saving preferences…' : 'Save Preferences'}</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}

