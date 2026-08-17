import { useState, useEffect } from 'react';
import { 
  Sparkles, Award, Compass, MapPin, Globe, BookOpen, Layers, Search, 
  ChevronRight, ChevronLeft, Lock, CheckCircle2, Shield, User, Download, 
  Share2, Eye, EyeOff, Plus, Trash2, Wand2, Star, Zap, Flame, RotateCcw,
  Bookmark, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Leather & Gold Passport
const PASSPORT_TRANSLATIONS = {
  en: {
    heroTag: 'GOLD EMBOSSED DUAL-PAGE PASSPORT',
    heroTitle: 'My AI Knowledge Passport',
    heroSubtitle: 'Flip through your digital booklet of achievements, completed missions, and learning milestones.',
    passportLevel: 'Level 4 Knowledge Seeker',
    issueDate: 'ISSUED: AUG 2026',
    passportStatus: 'STATUS: ACTIVE EXPLORER',
    exportPassport: 'Export Passport',
    nextPageBtn: 'Next Spread →',
    prevPageBtn: '← Previous Spread',
    leftPageTitle: 'OFFICIAL EXPEDITION RECORD',
    rightPageTitle: 'DIGITAL STAMPS & MILESTONES',
  },
  gu: {
    heroTag: 'ગોલ્ડ એમ્બોસ્ડ ડ્યુઅલ-પેજ પાસપોર્ટ',
    heroTitle: 'મારો એઆઈ નોલેજ પાસપોર્ટ',
    heroSubtitle: 'તમારી સિદ્ધિઓ, પૂર્ણ કરેલા મિશનો અને શીખવાના તબક્કાની ડિજિટલ બુકલેટ.',
    passportLevel: 'લેવલ 4 જ્ઞાન શોધક',
    issueDate: 'ઇશ્યુ તારીખ: ઓગસ્ટ 2026',
    passportStatus: 'સ્થિતિ: સક્રિય સંશોધક',
    exportPassport: 'પાસપોર્ટ નિકાસ કરો',
    nextPageBtn: 'આગળનું પાનું →',
    prevPageBtn: '← પાછળનું પાનું',
    leftPageTitle: 'સત્તાવાર એક્સપિડિશન રેકોર્ડ',
    rightPageTitle: 'ડિજિટલ સ્ટેમ્પ્સ અને સિદ્ધિઓ',
  },
  hi: {
    heroTag: 'गोल्ड एम्बोस्ड डुअल-पेज पासपोर्ट',
    heroTitle: 'मेरा एआई ज्ञान पासपोर्ट',
    heroSubtitle: 'आपकी उपलब्धियों, पूरे किए गए मिशनों और सीखने के मील के पत्थरों की डिजिटल बुकलेट।',
    passportLevel: 'लेवल 4 ज्ञान साधक',
    issueDate: 'जारी: अगस्त 2026',
    passportStatus: 'स्थिति: सक्रिय अन्वेषक',
    exportPassport: 'पासपोर्ट निर्यात करें',
    nextPageBtn: 'अगला पृष्ठ →',
    prevPageBtn: '← पिछला पृष्ठ',
    leftPageTitle: 'आधिकारिक अभियान रिकॉर्ड',
    rightPageTitle: 'डिजिटल स्टैम्प और उपलब्धियां',
  },
};

export default function BiodiversityPassport() {
  const { session, user } = useAuth();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = PASSPORT_TRANSLATIONS[lang] || PASSPORT_TRANSLATIONS.en;
  const token = session?.access_token;

  // Book Spread State (0: Cover & Overview, 1: Stamps & Trail, 2: AI Guide)
  const [spreadIndex, setSpreadIndex] = useState(0);

  const [flippedStampId, setFlippedStampId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Real achievement data
  const [profile, setProfile] = useState(null);
  const [discoveries, setDiscoveries] = useState([]);
  const [missions, setMissions] = useState([]);
  const [entries, setEntries] = useState([]);
  const [actions, setActions] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch('/api/profile', {}, token),
      apiFetch('/api/discoveries', {}, token),
      apiFetch('/api/missions', {}, token),
      apiFetch('/api/journal', {}, token),
      apiFetch('/api/actions', {}, token),
      apiFetch('/api/streak', {}, token),
      apiFetch('/api/connection', {}, token),
    ])
      .then(([p, d, m, j, a, s, c]) => {
        setProfile(p);
        setDiscoveries(Array.isArray(d) ? d : []);
        setMissions(Array.isArray(m) ? m : []);
        setEntries(Array.isArray(j) ? j : []);
        setActions(Array.isArray(a) ? a : []);
        setStreakData(s);
        setConnection(c);
      })
      .catch(() => {});
  }, [token]);

  const completedMissions = missions.filter((m) => m.status === 'completed');
  const actionsDone = actions.filter((a) => a.status === 'done' || a.status === 'completed');
  const streakDays = streakData?.streak || 0;
  const xp = completedMissions.length * 150 + actionsDone.length * 25;
  const score = connection?.overall || 0;

  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const issueDate = `ISSUED: ${fmtDate(profile?.createdAt || new Date().toISOString()).toUpperCase()}`;

  const displayStamps = [
        discoveries.length > 0 && { id: 'st-d', title: 'ECO DISCOVERY 🌿', date: fmtDate(discoveries[discoveries.length - 1]?.createdAt), category: 'Discoveries', xp: 220, desc: `${discoveries.length} field observation${discoveries.length === 1 ? '' : 's'} recorded with the Lens.`, icon: '🌿' },
        completedMissions.length > 0 && { id: 'st-m', title: 'MISSION MASTER ⚡', date: fmtDate(completedMissions[completedMissions.length - 1]?.completed_at || completedMissions[completedMissions.length - 1]?.createdAt), category: 'Missions', xp: 250, desc: `Completed ${completedMissions.length} challenge${completedMissions.length === 1 ? '' : 's'}.`, icon: '⚡' },
        entries.length > 0 && { id: 'st-j', title: 'FIELD NOTES 📖', date: fmtDate(entries[entries.length - 1]?.createdAt), category: 'Journal', xp: 150, desc: `${entries.length} private reflection${entries.length === 1 ? '' : 's'} written.`, icon: '📖' },
        actionsDone.length > 0 && { id: 'st-a', title: 'ACTIVE GUARDIAN 🛡️', date: fmtDate(actionsDone[actionsDone.length - 1]?.updatedAt || actionsDone[actionsDone.length - 1]?.createdAt), category: 'Actions', xp: 200, desc: `${actionsDone.length} eco action${actionsDone.length === 1 ? '' : 's'} logged.`, icon: '🛡️' },
        streakDays > 0 && { id: 'st-k', title: `${Math.min(streakDays, 7)}-DAY STREAK 🔥`, date: 'Current', category: 'Streaks', xp: 300, desc: `Active ${streakDays} day${streakDays === 1 ? '' : 's'} in a row.`, icon: '🔥' },
      ].filter(Boolean);

  const level = score >= 80
      ? 'Eco Guardian'
      : score >= 50
        ? 'Level 3 Explorer'
        : score > 0
          ? 'Level 1 Beginner'
          : 'Ready to Begin';

  const journeyItems = [
        discoveries.length > 0 && { title: 'First Observation', desc: `${discoveries[discoveries.length - 1]?.common_name || 'Field observation'} recorded with Nature Lens.`, date: fmtDate(discoveries[discoveries.length - 1]?.createdAt) },
        completedMissions.length > 0 && { title: 'First Completed Mission', desc: `Completed "${completedMissions[completedMissions.length - 1]?.title}".`, date: fmtDate(completedMissions[completedMissions.length - 1]?.completed_at || completedMissions[completedMissions.length - 1]?.createdAt) },
        entries.length > 0 && { title: 'First Field Note', desc: 'Wrote your first private reflection.', date: fmtDate(entries[entries.length - 1]?.createdAt) },
        actionsDone.length > 0 && { title: 'First Eco Action', desc: `Logged "${actionsDone[actionsDone.length - 1]?.title}".`, date: fmtDate(actionsDone[actionsDone.length - 1]?.updatedAt || actionsDone[actionsDone.length - 1]?.createdAt) },
      ].filter(Boolean);

  const progressPct = Math.min(100, displayStamps.length * 15 + (score > 0 ? 10 : 0));

  // Export Passport Handler
  const handleExportPassport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const text = `🌍 Nature Pulse Biodiversity Passport (${new Date().toLocaleDateString()})
• Explorer: ${profile?.display_name || user?.name || 'Explorer'}
• Stamps: ${displayStamps.length}
• Missions Completed: ${completedMissions.length}
• Active Streak: ${streakDays} days
• Eco Score: ${score}%`;
      navigator.clipboard.writeText(text);
      alert('Gold Embossed Passport Summary exported cleanly!');
      setIsExporting(false);
    }, 300);
  };

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#060D09] text-slate-100 selection:bg-[#E6C176]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-amber-200 selection:text-amber-950'
    }`}>
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── LEATHER & GOLD EMBOSSED HEADER ──────────────── */}
        <div className={`relative rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-2 transition-all ${
          isDark
            ? 'bg-gradient-to-r from-[#14261B] via-[#1D3828] to-[#122419] border-[#E6C176]/50'
            : 'bg-gradient-to-r from-[#173A25] via-[#204E33] to-[#173A25] border-amber-400/60 shadow-xl'
        }`}>
          
          <div className="space-y-2 max-w-xl z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#2A4B36] text-[#E6C176] border border-[#E6C176]/40 text-xs font-extrabold uppercase tracking-widest shadow-md">
              <Crown className="w-3.5 h-3.5 text-[#E6C176]" />
              {t.heroTag}
            </span>
            <h1 className="font-display text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8DE] via-[#E6C176] to-[#B89240] tracking-tight drop-shadow-md">
              {t.heroTitle}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 font-normal leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Right Holographic Gold Seal Button */}
          <div className="flex items-center gap-4 z-10 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPassport}
              disabled={isExporting}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#E6C176] to-[#B89240] text-[#0A160F] font-black text-xs sm:text-sm hover:brightness-110 transition-all shadow-xl shadow-[#E6C176]/20 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isExporting ? 'Exporting…' : t.exportPassport}</span>
            </motion.button>
          </div>

        </div>

        {/* ──────────────── SPREAD NAVIGATION CONTROLS ──────────────── */}
        <div className={`flex items-center justify-between rounded-2xl px-6 py-3 text-xs font-bold border transition-colors ${
          isDark
            ? 'bg-[#112318] border-[#E6C176]/30 text-[#E6C176]'
            : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#916B25] shadow-md'
        }`}>
          <button
            onClick={() => setSpreadIndex((s) => Math.max(s - 1, 0))}
            disabled={spreadIndex === 0}
            className={`flex items-center gap-1.5 disabled:opacity-30 cursor-pointer ${
              isDark ? 'hover:text-white text-[#E6C176]' : 'hover:text-[#183B28] text-[#916B25]'
            }`}
          >
            <span>{t.prevPageBtn}</span>
          </button>

          <span className={`font-mono text-sm tracking-widest font-bold ${
            isDark ? 'text-white' : 'text-[#0F2418]'
          }`}>
            SPREAD 0{spreadIndex + 1} / 03
          </span>

          <button
            onClick={() => setSpreadIndex((s) => Math.min(s + 1, 2))}
            disabled={spreadIndex === 2}
            className={`flex items-center gap-1.5 disabled:opacity-30 cursor-pointer ${
              isDark ? 'hover:text-white text-[#E6C176]' : 'hover:text-[#183B28] text-[#916B25]'
            }`}
          >
            <span>{t.nextPageBtn}</span>
          </button>
        </div>

        {/* ──────────────── REALISTIC DUAL-PAGE BOOKLET SPREAD ──────────────── */}
        <div className={`rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden border-4 transition-colors ${
          isDark ? 'bg-[#0E2015] border-[#254532]' : 'bg-[#EDE6D8] border-[#D4CBB8]'
        }`}>
          
          <AnimatePresence mode="wait">
            
            {/* 📖 SPREAD 01: LEFT (IDENTITY & OVERVIEW) + RIGHT (SUMMARY & XP) */}
            {spreadIndex === 0 && (
              <motion.div
                key="sp0"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
              >
                {/* LEFT PAGE: PASSPORT HOLDER IDENTITY CARD */}
                <div className={`rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl relative border transition-colors ${
                  isDark ? 'bg-[#12271C] border-[#E6C176]/40' : 'bg-[#FDFBF7] border-[#E3DDD1]'
                }`}>
                  <div className={`border-b pb-4 flex justify-between items-center ${
                    isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                  }`}>
                    <span className="text-[10px] font-black text-[#B89240] dark:text-[#E6C176] uppercase tracking-widest">
                      {t.leftPageTitle}
                    </span>
                    <span className="text-xs text-[#916B25] dark:text-amber-300 font-bold">OFFICIAL #84920</span>
                  </div>

                  <div className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isDark ? 'bg-[#0A1A10] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                  }`}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D3828] to-[#14261B] border-2 border-[#E6C176] flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0">
                      👤
                    </div>
                    <div>
                      <h3 className={`font-display text-xl font-black ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{profile?.display_name || user?.name || 'Nature Pulse Explorer'}</h3>
                      <p className="text-xs text-[#916B25] dark:text-[#E6C176] font-semibold">{level}</p>
                      <p className="text-[10px] text-[#3E5C48] dark:text-slate-400 mt-1">{issueDate}</p>
                    </div>
                  </div>

                  <div className={`space-y-2 text-xs ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>
                    <div className={`flex justify-between py-1 border-b ${isDark ? 'border-[#20422E]' : 'border-[#E0D8C8]'}`}>
                      <span>Primary Language:</span>
                      <span className="text-[#183B28] dark:text-[#E6C176] font-bold">English, ગુજરાતી & Hindi</span>
                    </div>
                    <div className={`flex justify-between py-1 border-b ${isDark ? 'border-[#20422E]' : 'border-[#E0D8C8]'}`}>
                      <span>Active Streak:</span>
                      <span className="text-[#183B28] dark:text-emerald-400 font-bold">{streakDays} Day{streakDays === 1 ? '' : 's'} 🔥</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Total Earned XP:</span>
                      <span className="text-[#916B25] dark:text-amber-400 font-bold">{xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT PAGE: PASSPORT MILESTONES SUMMARY */}
                <div className={`rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl relative border transition-colors ${
                  isDark ? 'bg-[#12271C] border-[#E6C176]/40' : 'bg-[#FDFBF7] border-[#E3DDD1]'
                }`}>
                  <div className={`border-b pb-4 flex justify-between items-center ${
                    isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                  }`}>
                    <span className="text-[10px] font-black text-[#B89240] dark:text-[#E6C176] uppercase tracking-widest">
                      {t.rightPageTitle}
                    </span>
                    <span className="text-xs text-[#183B28] dark:text-emerald-400 font-bold">VERIFIED</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { title: 'Stamps Earned', val: `${displayStamps.length} Stamps`, icon: '🎖️' },
                      { title: 'Missions Completed', val: `${completedMissions.length} Missions`, icon: '⚡' },
                      { title: 'Field Notes', val: `${entries.length} Notes`, icon: '📚' },
                      { title: 'Eco Score', val: `${score}% Connection`, icon: '🌿' },
                    ].map((m, i) => (
                      <div key={i} className={`p-3.5 rounded-xl space-y-1 border ${
                        isDark ? 'bg-[#0A1A10] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                      }`}>
                        <span className="text-lg">{m.icon}</span>
                        <p className="text-[10px] text-[#3E5C48] uppercase font-semibold">{m.title}</p>
                        <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{m.val}</h4>
                      </div>
                    ))}
                  </div>

                  <div className={`p-4 rounded-xl space-y-2 border ${
                    isDark ? 'bg-[#0A1A10] border-[#E6C176]/30' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                  }`}>
                    <div className="flex justify-between text-xs text-[#916B25] dark:text-[#E6C176] font-bold">
                      <span>Passport Document Progress</span>
                      <span>{progressPct}% Complete</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-[#12271C]' : 'bg-[#EDE6D8]'
                    }`}>
                      <div className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full rounded-full" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 📖 SPREAD 02: STAMPS GALLERY (LEFT & RIGHT) */}
            {spreadIndex === 1 && (
              <motion.div
                key="sp1"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className={`border-b pb-3 flex justify-between items-center ${
                  isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                }`}>
                  <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>Digital Journey Stamps Collection</h3>
                  <span className="text-xs text-[#916B25] dark:text-[#E6C176] font-bold">Hover Card to 3D Flip</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayStamps.length === 0 ? (
                    <p className={`text-xs rounded-2xl p-6 text-center col-span-full border border-dashed ${
                      isDark ? 'text-slate-400 bg-[#12271C] border-[#E6C176]/30' : 'text-[#3E5C48] bg-[#FDFBF7] border-[#E3DDD1]'
                    }`}>
                      Your achievement stamps appear here as you record observations, finish missions, write journal notes, and log eco actions.
                    </p>
                  ) : (
                  displayStamps.map((st) => {
                    const isFlipped = flippedStampId === st.id;
                    return (
                      <div
                        key={st.id}
                        className="perspective-1000 h-44 cursor-pointer"
                        onMouseEnter={() => setFlippedStampId(st.id)}
                        onMouseLeave={() => setFlippedStampId(null)}
                      >
                        <motion.div
                          className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-xl rounded-2xl"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                        >
                          {/* FRONT SIDE */}
                          <div className={`absolute inset-0 backface-hidden rounded-2xl p-5 flex flex-col justify-between border ${
                            isDark ? 'bg-[#12271C] border-[#E6C176]/50 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-md'
                          }`}>
                            <div className="flex justify-between items-start">
                              <span className="text-3xl">{st.icon}</span>
                              <span className="text-xs font-black text-[#916B25] dark:text-[#E6C176]">+{st.xp} XP</span>
                            </div>
                            <div>
                              <h4 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{st.title}</h4>
                              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{st.date}</p>
                            </div>
                          </div>

                          {/* BACK SIDE */}
                          <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-5 flex flex-col justify-between border ${
                            isDark ? 'bg-[#1D3828] border-[#E6C176] text-slate-200' : 'bg-[#FAF2E4] border-[#D4A359] text-[#0F2418] shadow-md'
                          }`}>
                            <div>
                              <h5 className="font-display text-xs font-bold text-[#916B25] dark:text-[#E6C176]">{st.category}</h5>
                              <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>{st.desc}</p>
                            </div>
                            <span className="text-[10px] text-[#183B28] dark:text-emerald-400 font-bold">Verified Achievement</span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  }))}
                </div>
              </motion.div>
            )}

            {/* 📖 SPREAD 03: JOURNEY TRAIL TIMELINE */}
            {spreadIndex === 2 && (
              <motion.div
                key="sp2"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className={`font-display text-2xl font-bold border-b pb-3 ${
                  isDark ? 'text-white border-[#20452F]' : 'text-[#0F2418] border-[#E3DDD1]'
                }`}>
                  Chronological Journey Trail
                </h3>

                <div className="space-y-3">
                  {journeyItems.length === 0 ? (
                    <p className={`text-xs rounded-2xl p-6 text-center border border-dashed ${
                      isDark ? 'text-slate-400 bg-[#12271C] border-[#E6C176]/30' : 'text-[#3E5C48] bg-[#FDFBF7] border-[#E3DDD1]'
                    }`}>
                      Your journey trail begins with your first observation.
                    </p>
                  ) : (
                  journeyItems.map((tr, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${
                      isDark ? 'bg-[#12271C] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
                    }`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3828] to-[#14261B] border border-[#E6C176] flex items-center justify-center text-xs font-bold text-[#E6C176] shrink-0">
                        0{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{tr.title}</h4>
                        <p className={`text-xs truncate ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{tr.desc}</p>
                      </div>
                      <span className="text-[10px] text-[#916B25] dark:text-[#E6C176] font-bold">{tr.date}</span>
                    </div>
                  ))
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
