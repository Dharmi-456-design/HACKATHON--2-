import { useState, useEffect } from 'react';
import { 
  Sparkles, Award, Compass, MapPin, Globe, BookOpen, Layers, Search, 
  ChevronRight, ChevronLeft, Lock, CheckCircle2, Shield, User, Download, 
  Share2, Eye, EyeOff, Plus, Trash2, Wand2, Star, Zap, Flame, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Digital Journey Passport
const PASSPORT_TRANSLATIONS = {
  en: {
    heroTag: 'FUTURISTIC DIGITAL JOURNEY PASSPORT',
    heroTitle: 'My AI Knowledge Passport',
    heroSubtitle: 'Flip through your digital passport of achievements, completed missions, interactive stories, and learning milestones.',
    passportLevel: 'Level 4 Knowledge Seeker',
    issueDate: 'ISSUED: AUG 2026',
    passportStatus: 'STATUS: ACTIVE EXPLORER',
    tabCover: '📘 Passport Cover',
    tabOverview: '📊 Overview',
    tabStamps: '🎖️ Digital Stamps',
    tabTimeline: '🗺️ Journey Trail',
    tabGuide: '🔮 Passport Guide',
    searchPlaceholder: 'Search passport stamps, milestones, stories…',
    exportPassport: 'Export Digital Passport',
    privacyTitle: 'Passport Privacy Controls',
    allowShare: 'Publicly Shareable Achievement',
    nextDestination: 'Choose Next Destination',
    startExploration: 'Start Journey',
    aiGuidePrompt: 'Ask AI Passport Guide about your progress…',
  },
  gu: {
    heroTag: 'ફ્યુચ્યુરિસ્ટિક ડિજિટલ જર્ની પાસપોર્ટ',
    heroTitle: 'મારો એઆઈ નોલેજ પાસપોર્ટ',
    heroSubtitle: 'તમારી સિદ્ધિઓ, પૂર્ણ કરેલા મિશનો, ઇન્ટરેક્ટિવ વાર્તાઓ અને શીખવાના તબક્કાનો ડિજિટલ પાસપોર્ટ.',
    passportLevel: 'લેવલ 4 જ્ઞાન શોધક',
    issueDate: 'ઇશ્યુ તારીખ: ઓગસ્ટ 2026',
    passportStatus: 'સ્થિતિ: સક્રિય સંશોધક',
    tabCover: '📘 પાસપોર્ટ કવર',
    tabOverview: '📊 વિહંગાવલોકન',
    tabStamps: '🎖️ ડિજિટલ સ્ટેમ્પ્સ',
    tabTimeline: '🗺️ યાત્રા પાથ',
    tabGuide: '🔮 પાસપોર્ટ ગાઇડ',
    searchPlaceholder: 'પાસપોર્ટ સ્ટેમ્પ્સ, સિદ્ધિઓ શોધો…',
    exportPassport: 'પાસપોર્ટ નિકાસ કરો',
    privacyTitle: 'ગોપનીયતા નિયંત્રણો',
    allowShare: 'જાહેર રીતે શેર કરી શકાય તેવું',
    nextDestination: 'આગળનું સ્થળ પસંદ કરો',
    startExploration: 'યાત્રા શરૂ કરો',
    aiGuidePrompt: 'તમારી પ્રગતિ વિશે એઆઈ ગાઇડને પૂછો…',
  },
  hi: {
    heroTag: 'फ्यूचरिस्टिक डिजिटल यात्रा पासपोर्ट',
    heroTitle: 'मेरा एआई ज्ञान पासपोर्ट',
    heroSubtitle: 'अपनी उपलब्धियों, पूरे किए गए मिशनों, इंटरैक्टिव कहानियों और सीखने के मील के पत्थरों का डिजिटल पासपोर्ट।',
    passportLevel: 'लेवल 4 ज्ञान साधक',
    issueDate: 'जारी: अगस्त 2026',
    passportStatus: 'स्थिति: सक्रिय अन्वेषक',
    tabCover: '📘 पासपोर्ट कवर',
    tabOverview: '📊 अवलोकन',
    tabStamps: '🎖️ डिजिटल स्टैम्प',
    tabTimeline: '🗺️ यात्रा पथ',
    tabGuide: '🔮 पासपोर्ट गाइड',
    searchPlaceholder: 'पासपोर्ट स्टैम्प, मील के पत्थर खोजें…',
    exportPassport: 'पासपोर्ट निर्यात करें',
    privacyTitle: 'गोपनीयता नियंत्रण',
    allowShare: 'सार्वजनिक रूप से साझा करने योग्य',
    nextDestination: 'अगला गंतव्य चुनें',
    startExploration: 'यात्रा शुरू करें',
    aiGuidePrompt: 'अपनी प्रगति के बारे में एआई गाइड से पूछें…',
  },
};

// Digital Stamps Seed
const SEED_STAMPS = [
  { id: 'st-1', title: 'FIRST AI CHAT 💬', date: 'Aug 10, 2026', category: 'Milestones', xp: 100, desc: 'Initiated first AI conversation on Urban Peepal Canopy.', icon: '💬', unlocked: true },
  { id: 'st-2', title: 'MISSION MASTER ⚡', date: 'Aug 12, 2026', category: 'Missions', xp: 250, desc: 'Completed Peepal dawn listening challenge.', icon: '⚡', unlocked: true },
  { id: 'st-3', title: 'STORY TRAVELER 📚', date: 'Aug 14, 2026', category: 'Stories', xp: 200, desc: 'Explored 3D decision story in Ancient Cedar Forest.', icon: '📚', unlocked: true },
  { id: 'st-4', title: '7-DAY EXPLORER STREAK 🔥', date: 'Aug 15, 2026', category: 'Streaks', xp: 300, desc: 'Active every single day this week across Nature Lens and Pulse.', icon: '🔥', unlocked: true },
  { id: 'st-5', title: 'MULTILINGUAL EXPERT 🌐', date: 'Aug 16, 2026', category: 'Language', xp: 150, desc: 'Switched fluently between English, Gujarati and Hindi.', icon: '🌐', unlocked: true },
  { id: 'st-6', title: 'ECO DISCOVERY SPHERE 🌿', date: 'Aug 16, 2026', category: 'Discoveries', xp: 220, desc: 'Saved 5 micro-climate observations to Bio Map.', icon: '🌿', unlocked: true },
];

export default function BiodiversityPassport() {
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = PASSPORT_TRANSLATIONS[lang] || PASSPORT_TRANSLATIONS.en;

  // Passport Pages State (0: Cover, 1: Overview, 2: Digital Stamps, 3: Journey Trail, 4: AI Guide)
  const [currentPage, setCurrentPage] = useState(0);
  const [stamps, setStamps] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_passport_stamps_v1');
      return saved ? JSON.parse(saved) : SEED_STAMPS;
    } catch {
      return SEED_STAMPS;
    }
  });

  const [flippedStampId, setFlippedStampId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // AI Guide Chat State
  const [guideInput, setGuideInput] = useState('');
  const [guideMessages, setGuideMessages] = useState([
    { id: 1, sender: 'ai', text: 'Welcome to your Digital AI Passport! You have unlocked 6 stamps and reached Level 4 Knowledge Seeker.' },
  ]);

  useEffect(() => {
    localStorage.setItem('pulse_passport_stamps_v1', JSON.stringify(stamps));
  }, [stamps]);

  // Handle Page Turn
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, 4));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));

  // Export Passport
  const handleExportPassport = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert('Digital Journey Passport exported successfully as summary card!');
      setIsExporting(false);
    }, 1000);
  };

  // AI Guide Send Message
  const handleSendGuideMsg = (e) => {
    e.preventDefault();
    if (!guideInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: guideInput.trim() };
    setGuideMessages((prev) => [...prev, userMsg]);
    const inputVal = guideInput.trim();
    setGuideInput('');

    setTimeout(() => {
      const reply = `Based on your Passport history: You completed 4 missions, 3 interactive stories, and maintain a 7-Day active streak in Gujarati & English. Next recommended destination: "Micro-climate Root Research".`;
      setGuideMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── HERO BANNER ──────────────── */}
        <div className="relative bg-gradient-to-r from-[#0E2316] via-[#112D1B] to-[#0A1A10] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
                {t.heroTag}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPassport}
              disabled={isExporting}
              className="px-6 py-3.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting…' : t.exportPassport}</span>
            </motion.button>
          </div>
        </div>

        {/* ──────────────── 3D FLIPPING PASSPORT BOOKLET ──────────────── */}
        <div className="relative max-w-4xl mx-auto">
          
          {/* Passport Page Controls Bar */}
          <div className="flex items-center justify-between bg-[#112318] border border-[#20452F] rounded-2xl px-5 py-3 mb-4 text-xs font-semibold text-slate-300">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-1 hover:text-[#4ADE80] disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            <span className="text-[#4ADE80] font-bold">
              Page {currentPage + 1} of 5
            </span>

            <button
              onClick={nextPage}
              disabled={currentPage === 4}
              className="flex items-center gap-1 hover:text-[#4ADE80] disabled:opacity-30 cursor-pointer"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            
            {/* 📘 PAGE 0: HOLOGRAPHIC PASSPORT COVER */}
            {currentPage === 0 && (
              <motion.div
                key="p0"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-gradient-to-br from-[#0B1E13] via-[#112D1B] to-[#061209] border-2 border-[#4ADE80]/60 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden space-y-8"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-[#4ADE80] uppercase tracking-widest">
                      {t.passportStatus}
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                      DIGITAL EXPLORER PASSPORT
                    </h2>
                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-[#1A3827] border-2 border-[#4ADE80] flex items-center justify-center text-2xl shadow-xl">
                    🛡️
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#06140B] border border-[#20422E] p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#1A3827] border border-[#4ADE80] flex items-center justify-center text-xl font-bold text-white">
                      👤
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Passport Holder</p>
                      <h4 className="font-display text-lg font-bold text-white">Nature Pulse Explorer</h4>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-400">{t.passportLevel}</p>
                    <p className="text-slate-400">{t.issueDate}</p>
                    <p className="text-[#4ADE80] font-bold">6 Unlocked Digital Stamps</p>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={nextPage}
                    className="px-8 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] cursor-pointer shadow-xl flex items-center gap-2"
                  >
                    <span>Open Passport Pages</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 📊 PAGE 1: JOURNEY OVERVIEW */}
            {currentPage === 1 && (
              <motion.div
                key="p1"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <h3 className="font-display text-2xl font-bold text-white border-b border-[#20452F] pb-3">
                  Page 1 — Journey Milestone Overview
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total XP', val: '1,250 XP', icon: '🏆' },
                    { label: 'Active Streak', val: '7 Days 🔥', icon: '🔥' },
                    { label: 'Completed Missions', val: '4 Finished', icon: '🎯' },
                    { label: 'Interactive Stories', val: '3 Read', icon: '📚' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#13271C] border border-[#20422E] p-4 rounded-2xl text-center space-y-1">
                      <span className="text-xl">{stat.icon}</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <h4 className="font-display text-base font-bold text-white">{stat.val}</h4>
                    </div>
                  ))}
                </div>

                <div className="bg-[#13271C] border border-[#4ADE80]/30 p-5 rounded-2xl space-y-2">
                  <h4 className="font-display text-sm font-bold text-[#4ADE80]">Overall Passport Progress</h4>
                  <div className="w-full bg-[#0E2015] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#4ADE80] h-full rounded-full" style={{ width: '68%' }} />
                  </div>
                  <p className="text-xs text-slate-400 text-right">68% Journey Documented</p>
                </div>
              </motion.div>
            )}

            {/* 🎖️ PAGE 2: DIGITAL STAMPS & FLIP CARDS */}
            {currentPage === 2 && (
              <motion.div
                key="p2"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <h3 className="font-display text-2xl font-bold text-white border-b border-[#20452F] pb-3">
                  Page 2 — Unlocked Digital Journey Stamps
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stamps.map((st) => {
                    const isFlipped = flippedStampId === st.id;
                    return (
                      <div
                        key={st.id}
                        className="perspective-1000 h-40 cursor-pointer"
                        onMouseEnter={() => setFlippedStampId(st.id)}
                        onMouseLeave={() => setFlippedStampId(null)}
                      >
                        <motion.div
                          className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-xl rounded-2xl"
                          animate={{ rotateY: isFlipped ? 180 : 0 }}
                        >
                          {/* FRONT STAMP */}
                          <div className="absolute inset-0 backface-hidden bg-[#13271C] border border-[#4ADE80]/40 rounded-2xl p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <span className="text-2xl">{st.icon}</span>
                              <span className="text-[10px] font-bold text-amber-400">+{st.xp} XP</span>
                            </div>
                            <div>
                              <h4 className="font-display text-sm font-bold text-white">{st.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{st.date}</p>
                            </div>
                          </div>

                          {/* BACK STAMP */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#1A3827] border border-[#4ADE80] rounded-2xl p-4 flex flex-col justify-between text-slate-200">
                            <div>
                              <h5 className="font-display text-xs font-bold text-[#4ADE80]">{st.category}</h5>
                              <p className="text-xs text-slate-300 mt-1 leading-snug">{st.desc}</p>
                            </div>
                            <span className="text-[10px] text-[#4ADE80] font-bold">Verified Achievement</span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 🗺️ PAGE 3: JOURNEY TRAIL */}
            {currentPage === 3 && (
              <motion.div
                key="p3"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <h3 className="font-display text-2xl font-bold text-white border-b border-[#20452F] pb-3">
                  Page 3 — Interactive Journey Trail
                </h3>

                <div className="space-y-4">
                  {[
                    { title: 'First Conversation', desc: 'Discussed Peepal canopy cooling effect on Monday.', date: 'Aug 10' },
                    { title: 'Completed First Mission', desc: 'Finished dawn listening challenge (+100 XP).', date: 'Aug 12' },
                    { title: 'Read Interactive Story', desc: 'Explored 3D choice paths in Cedar Forest.', date: 'Aug 14' },
                    { title: 'Bio Map Unlocked', desc: 'Saved 6 micro-climate observation nodes.', date: 'Aug 16' },
                  ].map((tr, i) => (
                    <div key={i} className="flex items-center gap-4 bg-[#13271C] border border-[#20422E] p-4 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-[#1A3827] border border-[#4ADE80] flex items-center justify-center text-xs font-bold text-[#4ADE80]">
                        0{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm font-bold text-white">{tr.title}</h4>
                        <p className="text-xs text-slate-300 truncate">{tr.desc}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">{tr.date}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 🔮 PAGE 4: AI PASSPORT GUIDE */}
            {currentPage === 4 && (
              <motion.div
                key="p4"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6"
              >
                <h3 className="font-display text-2xl font-bold text-white border-b border-[#20452F] pb-3 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#4ADE80]" />
                  <span>Page 4 — AI Passport Guide Assistant</span>
                </h3>

                <div className="bg-[#13271C] border border-[#20422E] p-4 rounded-2xl space-y-3 h-60 overflow-y-auto custom-chat-scroll">
                  {guideMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-2xl text-xs sm:text-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#4ADE80] text-[#07130B] font-semibold'
                            : 'bg-[#0E2015] border border-[#20422E] text-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendGuideMsg} className="flex items-center gap-2">
                  <input
                    value={guideInput}
                    onChange={(e) => setGuideInput(e.target.value)}
                    placeholder={t.aiGuidePrompt}
                    className="flex-1 bg-[#13271C] border border-[#20422E] rounded-2xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[#4ADE80] text-[#07130B] font-bold text-xs cursor-pointer shrink-0"
                  >
                    Ask Guide
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
