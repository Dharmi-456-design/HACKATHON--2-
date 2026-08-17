import { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, Calendar, TrendingUp, MessageSquare, Clock, Globe, Award, 
  Target, Download, Share2, CheckCircle2, ChevronRight, Zap, RefreshCw, 
  Flame, BookOpen, User, Star, Plus, Trash2, ArrowUpRight, BarChart2, ShieldCheck,
  Compass, Radio, Disc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Weekly Recap
const RECAP_TRANSLATIONS = {
  en: {
    heroTag: 'HOLOGRAM INTELLIGENCE SPHERE',
    heroTitle: 'Weekly Activity Cosmos',
    heroSubtitle: 'An interactive reflection of your exploration, conversations, topics, and progress over the past 7 days.',
    aiSummaryTitle: 'AI Weekly Memory Synthesis',
    aiSummaryText: 'This week you explored biodiversity patterns, spent peak time learning on Wednesday evening, and engaged in Gujarati & English discussions.',
    tabTimeline: '⚡ S-Curve Timeline',
    tabTopics: '🌌 Constellation Galaxy',
    tabGoals: '🎯 Weekly Goals',
    tabArchive: '📦 Recap Vault',
    mostActiveDay: 'Most Active Day',
    totalChats: 'Total Conversations',
    messagesSent: 'Messages Exchanged',
    topLanguage: 'Primary Language',
    achievementsTitle: 'Unlocked Eco Badges',
    goalsTitle: 'Weekly Exploration Goals',
    addGoalBtn: '+ Add Goal',
    exportRecapBtn: 'Export Summary',
    topicsExplored: 'Topics Explored',
    streakDays: 'Active Day Streak',
  },
  gu: {
    heroTag: 'હોલોગ્રામ ઇન્ટેલિજન્સ સ્ફિયર',
    heroTitle: 'સાપ્તાહિક પ્રવૃત્તિ કોસ્મોસ',
    heroSubtitle: 'છેલ્લા 7 દિવસના તમારા સંશોધન, વાતચીત, વિષયો અને પ્રગતિનું ઇન્ટરેક્ટિવ પ્રતિબિંબ.',
    aiSummaryTitle: 'એઆઈ મેમરી સિન્થેસિસ',
    aiSummaryText: 'આ અઠવાડિયે તમે જૈવવિવિધતાના પ્રશ્નો પૂછ્યા, બુધવારે સાંજે સૌથી વધુ સમય વિતાવ્યો અને ગુજરાતી અને અંગ્રેજીમાં ચર્ચા કરી.',
    tabTimeline: '⚡ એસ-કર્વ ટાઇમલાઇન',
    tabTopics: '🌌 કોન્સ્ટેલેશન ગેલેક્સી',
    tabGoals: '🎯 સાપ્તાહિક લક્ષ્યો',
    tabArchive: '📦 રીકેપ વોલ્ટ',
    mostActiveDay: 'સૌથી સક્રિય દિવસ',
    totalChats: 'કુલ વાતચીત',
    messagesSent: 'સંદેશા મોકલ્યા',
    topLanguage: 'મુખ્ય ભાષા',
    achievementsTitle: 'અનલૉક કરેલ બેજ',
    goalsTitle: 'સાપ્તાહિક લક્ષ્યો',
    addGoalBtn: '+ લક્ષ્ય ઉમેરો',
    exportRecapBtn: 'રીકેપ નિકાસ કરો',
    topicsExplored: 'અભ્યાસ કરેલ વિષયો',
    streakDays: 'સક્રિય દિવસો',
  },
  hi: {
    heroTag: 'होलोग्राम इंटेलिजेंस स्फीयर',
    heroTitle: 'साप्ताहिक गतिविधि कॉसमॉस',
    heroSubtitle: 'पिछले 7 दिनों की आपकी खोज, बातचीत, विषयों और प्रगति का इंटरैक्टिव प्रतिबिंब।',
    aiSummaryTitle: 'एआई मेमोरी सिंथेसिस',
    aiSummaryText: 'इस सप्ताह आपने जैव विविधता के प्रश्न पूछे, बुधवार की शाम को सबसे अधिक समय बिताया और हिंदी व अंग्रेजी में चर्चा की।',
    tabTimeline: '⚡ एस-कर्व टाइमलाइन',
    tabTopics: '🌌 कॉन्स्टिलेशन गैलेक्सी',
    tabGoals: '🎯 साप्ताहिक लक्ष्य',
    tabArchive: '📦 रीकैप वॉल्ट',
    mostActiveDay: 'सबसे सक्रिय दिन',
    totalChats: 'कुल बातचीत',
    messagesSent: 'संदेश भेजे गए',
    topLanguage: 'प्राथमिक भाषा',
    achievementsTitle: 'अनलब्ध बैज',
    goalsTitle: 'साप्ताहिक खोज लक्ष्य',
    addGoalBtn: '+ लक्ष्य जोड़ें',
    exportRecapBtn: 'रीकैप निर्यात करें',
    topicsExplored: 'खोजे गए विषय',
    streakDays: 'सक्रिय दिन',
  },
};

// 7-Day Activity Nodes Data

export default function WeeklyRecap() {
  const { session } = useAuth();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = RECAP_TRANSLATIONS[lang] || RECAP_TRANSLATIONS.en;
  const token = session?.access_token;

  // Active States
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, topics, goals, archive
  const [selectedDayNode, setSelectedDayNode] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Weekly Goals State (persisted to the profile server-side)
  const [goals, setGoals] = useState([]);
  const goalsLoadedRef = useRef(false);
  const [goalsError, setGoalsError] = useState('');
  const [recapError, setRecapError] = useState('');

  const [newGoalText, setNewGoalText] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Real weekly data
  const [recap, setRecap] = useState({
    total_species: 15,
    total_days: 7,
    slides: [
      { title: 'Weekly Summary', text: 'You recorded 15 species across 7 active days.' },
      { title: 'Species List', species_list: ['Banyan Tree', 'Indian Peafowl', 'Golden Shower Tree', 'Asian Koel', 'Tulsi Plant', 'Neem Tree', 'Green Bee-Eater'] },
    ],
  });
  const [dayCounts, setDayCounts] = useState({});

  useEffect(() => {
    apiFetch('/api/weekly-recap', {}, token)
      .then((data) => {
        if (data && data.total_species) setRecap(data);
      })
      .catch(() => {});

    apiFetch('/api/discoveries', {}, token)
      .then((list) => {
        if (!Array.isArray(list) || list.length === 0) return;
        const counts = {};
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - 6);

        // Distribute discoveries across 7 days
        list.forEach((item, idx) => {
          const dateVal = item.createdAt || item.created_at;
          let key = '';
          if (dateVal) {
            key = new Date(dateVal).toISOString().slice(0, 10);
          } else {
            const offsetDay = new Date(d);
            offsetDay.setDate(d.getDate() + (idx % 7));
            key = offsetDay.toISOString().slice(0, 10);
          }
          counts[key] = (counts[key] || 0) + 1;
        });

        // Ensure every day in past 7 days has activity count
        const startDay = new Date();
        startDay.setHours(0, 0, 0, 0);
        startDay.setDate(startDay.getDate() - 6);
        for (let i = 0; i < 7; i++) {
          const k = startDay.toISOString().slice(0, 10);
          if (!counts[k]) counts[k] = 0;
          startDay.setDate(startDay.getDate() + 1);
        }

        setDayCounts(counts);

        const speciesList = [...new Set(list.map((x) => x.common_name).filter(Boolean))];
        setRecap((prev) => ({
          ...prev,
          total_species: speciesList.length || list.length || 15,
          total_days: Object.keys(counts).length || 7,
          slides: [
            { title: 'Weekly Summary', text: `You recorded ${speciesList.length || list.length} species across ${Object.keys(counts).length || 7} active days.` },
            { title: 'Species List', species_list: speciesList.length ? speciesList : ['Banyan Tree', 'Indian Peafowl', 'Golden Shower Tree'] },
          ],
        }));
      })
      .catch(() => {});

    apiFetch('/api/profile', {}, token)
      .then((p) => {
        if (Array.isArray(p?.weekly_goals)) setGoals(p.weekly_goals);
        goalsLoadedRef.current = true;
      })
      .catch(() => {});
  }, [token]);


  useEffect(() => {
    if (!goalsLoadedRef.current) return;
    setGoalsError('');
    const timeout = setTimeout(() => {
      apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ weekly_goals: goals }) }, token).catch(() => {
        setGoalsError('Your goals could not be saved. Please check your connection and try again.');
      });
    }, 800);
    return () => clearTimeout(timeout);
  }, [goals, token]);

  // Build the 7-day nodes from real per-day observation counts
  const weekNodes = (() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const out = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().slice(0, 10);
      const count = dayCounts[key] || 0;
      out.push({
        day: dayNames[d.getDay()],
        fullDay: d.toLocaleDateString('en-US', { weekday: 'long' }),
        chats: count,
        messages: 0,
        obs: count,
        topTopic: '',
        intensity: Math.min(100, count * 30),
        highlight: count ? `${count} observation${count === 1 ? '' : 's'} recorded` : 'No observations recorded',
      });
      d.setDate(d.getDate() + 1);
    }
    return out;
  })();

  const totalSpecies = recap?.total_species || 0;
  const totalDays = recap?.total_days || 0;
  const speciesNames = recap?.slides?.[1]?.species_list || [];

  const totalChatsCount = totalSpecies;
  const totalMessagesCount = totalDays;

  const mostActiveKey = Object.keys(dayCounts).reduce((a, b) => (dayCounts[a] >= dayCounts[b] ? a : b), '');
  const mostActiveDay = mostActiveKey ? new Date(mostActiveKey).toLocaleDateString('en-US', { weekday: 'long' }) : '—';
  const mostActiveCount = mostActiveKey ? dayCounts[mostActiveKey] : 0;

  const summaryTitle = 'Weekly Activity Summary';
  const summaryText = totalSpecies > 0
    ? `You recorded ${totalSpecies} species across ${totalDays} day${totalDays === 1 ? '' : 's'} this week${speciesNames.length ? ', including ' + speciesNames.slice(0, 3).join(', ') : ''}.`
    : 'No observations recorded this week yet. Head out with the Lens to make your first discovery.';

  const weekLabel = (() => {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    const fmt = (x) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Week of ${fmt(start)} – ${fmt(new Date())}`;
  })();

  const ecoScore = `${Math.round((totalDays / 7) * 100)}%`;
  const ecoSubtitle = `${totalDays} Day${totalDays === 1 ? '' : 's'} Active`;

  const topicNodes = speciesNames.map((s, i) => ({
    id: `sp-${i}`,
    name: s,
    count: 1,
    percent: 100,
    color: 'from-[#4ADE80] to-[#254B35]',
    desc: 'Species recorded this week',
  }));

  const archiveItems = [];

  const activeNode = selectedDayNode || weekNodes[weekNodes.length - 1];

  // Toggle Goal Status
  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  };

  // Add Goal
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals([...goals, { id: `g-${Date.now()}`, text: newGoalText.trim(), done: false }]);
    setNewGoalText('');
    setShowGoalInput(false);
  };

  // Delete Goal
  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Export Recap Handler
  const handleExportRecap = () => {
    setIsExporting(true);
    setTimeout(() => {
      const summaryText2 = `🌱 Nature Pulse Weekly Recap (${new Date().toLocaleDateString()})
• Species Logged: ${totalSpecies}
• Active Days: ${totalDays}
${mostActiveDay !== '—' ? `• Most Active Day: ${mostActiveDay} (${mostActiveCount} observations)` : ''}
• Top Species: ${speciesNames.slice(0, 3).join(', ') || 'None yet'}
• Total Observations: ${recap.total_species || 0}`;

      navigator.clipboard.writeText(summaryText2);

      // Trigger text file download
      try {
        const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(summaryText2);
        const link = document.createElement('a');
        link.href = dataStr;
        link.download = `NaturePulse_Weekly_Recap_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {}

      setIsExporting(false);
    }, 300);
  };

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 relative z-10">

        {(recapError || goalsError) && (
          <div className="space-y-3">
            {recapError && <ErrorBanner message={recapError} />}
            {goalsError && <ErrorBanner message={goalsError} />}
          </div>
        )}
        
        {/* ──────────────── CELESTIAL ORBITAL HOLOGRAM SPHERE HEADER ──────────────── */}
        <div className={`relative flex flex-col md:flex-row items-center justify-between gap-8 py-6 px-4 sm:px-8 border-b transition-colors ${
          isDark ? 'border-[#20452F]/60' : 'border-[#E3DDD1]'
        }`}>
          
          {/* Left Orbital Text */}
          <div className="space-y-3 text-center md:text-left max-w-lg z-10">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md border ${
              isDark ? 'bg-[#0E2618] text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
            }`}>
              <Radio className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
              {t.heroTag}
            </span>
            
            <h1 className={`font-display text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text tracking-tight leading-tight ${
              isDark
                ? 'bg-gradient-to-r from-white via-emerald-100 to-[#4ADE80]'
                : 'bg-gradient-to-r from-[#0F2418] via-[#183B28] to-[#255239]'
            }`}>
              {t.heroTitle}
            </h1>
            
            <p className={`text-xs sm:text-sm font-normal leading-relaxed ${
              isDark ? 'text-slate-300/90' : 'text-[#3E5C48]'
            }`}>
              {t.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportRecap}
                disabled={isExporting}
                className={`px-6 py-3 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
                  isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77] shadow-[#4ADE80]/20' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting…' : t.exportRecapBtn}</span>
              </motion.button>
            </div>
          </div>

          {/* Right Holographic Glowing Sphere Ring with 7 Weekday Orbs */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className={`absolute inset-0 rounded-full border-2 border-dashed ${
                isDark ? 'border-[#4ADE80]/40' : 'border-[#183B28]/40'
              }`}
            />
            
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute inset-4 rounded-full blur-xl ${
                isDark ? 'bg-[#4ADE80]/20' : 'bg-[#E1EFE0]/60'
              }`}
            />

            <div className={`w-40 h-40 rounded-full border-2 flex flex-col items-center justify-center text-center shadow-2xl relative z-10 space-y-0.5 ${
              isDark
                ? 'bg-gradient-to-br from-[#1A3827] via-[#0E2015] to-[#040B06] border-[#4ADE80]'
                : 'bg-gradient-to-br from-[#EDE6D8] via-[#FDFBF7] to-[#F2ECE1] border-[#183B28] shadow-xl'
            }`}>
              <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Eco Score</span>
              <span className={`font-display text-4xl font-extrabold tracking-tight ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{ecoScore}</span>
              <span className={`text-[10px] font-semibold ${isDark ? 'text-emerald-300' : 'text-[#183B28]'}`}>{ecoSubtitle}</span>
            </div>

            {/* 7 Orbiting Weekday Satellite Nodes */}
            {weekNodes.map((n, idx) => {
              const angle = (idx * 360) / 7;
              const rad = (angle * Math.PI) / 180;
              const radius = 115; // px from center
              const x = Math.cos(rad) * radius;
              const y = Math.sin(rad) * radius;
              return (
                <button
                  key={n.day}
                  onClick={() => setSelectedDayNode(n)}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className={`absolute w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer z-20 ${
                    activeNode.day === n.day
                      ? isDark
                        ? 'bg-[#4ADE80] text-[#07130B] border-white shadow-lg shadow-[#4ADE80]/40 scale-125'
                        : 'bg-[#183B28] text-[#FAF7F0] border-[#0F2418] shadow-md scale-125'
                      : isDark
                        ? 'bg-[#13271C] text-slate-200 border-[#20422E] hover:border-[#4ADE80]'
                        : 'bg-[#FDFBF7] text-[#0F2418] border-[#D4CBB8] hover:border-[#183B28] shadow-xs'
                  }`}
                  title={`${n.fullDay}: ${n.chats} ${n.chats === 1 ? 'observation' : 'observations'}`}
                >
                  {n.day[0]}
                </button>
              );
            })}
          </div>

        </div>

        {/* ──────────────── AI MEMORY SYNTHESIS BANNER ──────────────── */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border transition-colors ${
          isDark ? 'bg-[#0E2015] border-[#4ADE80]/50 text-white' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#0F2418] shadow-sm'
        }`}>
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-5 h-5 animate-pulse ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
              <h3 className={`font-display text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{summaryTitle}</h3>
            </div>
            <p className={`text-xs sm:text-sm italic font-normal leading-relaxed ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>
              "{summaryText}"
            </p>
          </div>

          <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${
            isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/40' : 'bg-[#FDFBF7] text-[#183B28] border-[#C3DEC0]'
          }`}>
            {weekLabel}
          </span>
        </div>

        {/* ──────────────── ASYMMETRIC FLOATING CAPSULE METRICS ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Capsule 1: Wide Active Day Highlight */}
          <div className={`md:col-span-2 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all border ${
            isDark ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/60 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.mostActiveDay}</p>
                <h3 className={`font-display text-3xl sm:text-4xl font-extrabold mt-1 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{mostActiveDay}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs border font-bold ${
                isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
              }`}>
                {mostActiveCount > 0 ? `${mostActiveCount} Observation${mostActiveCount === 1 ? '' : 's'}` : 'No activity yet'}
              </span>
            </div>
            <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>
              {mostActiveDay !== '—'
                ? `Most of this week's observations were recorded on ${mostActiveDay}.`
                : 'No observations recorded yet this week.'}
            </p>
          </div>

          {/* Capsule 2: Interaction Count */}
          <div className={`rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all border ${
            isDark ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/60 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm'
          }`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>Species Logged</p>
              <h3 className={`font-display text-3xl font-extrabold mt-1 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{totalChatsCount} Species</h3>
            </div>
            <div className={`border-t pt-3 text-[11px] ${isDark ? 'border-[#20422E] text-slate-400' : 'border-[#E0D8C8] text-[#3E5C48]'}`}>
              Field observations logged in the past 7 days.
            </div>
          </div>

        </div>

        {/* ──────────────── NAVIGATION TABS ──────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none">
          {[
            { id: 'timeline', label: t.tabTimeline },
            { id: 'topics', label: t.tabTopics },
            { id: 'goals', label: t.tabGoals },
            { id: 'archive', label: t.tabArchive },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15'
                    : 'bg-[#183B28] text-[#FAF7F0] shadow-md'
                  : isDark
                    ? 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
                    : 'bg-[#FDFBF7] border border-[#E3DDD1] text-[#3E5C48] hover:bg-[#F2ECE1] shadow-xs'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ──────────────── TAB 1: S-CURVE INTERACTIVE TIMELINE ──────────────── */}
        {activeTab === 'timeline' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>S-Curve Weekly Timeline Journey</h3>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-center">
              {weekNodes.map((node) => {
                const isSelected = activeNode.day === node.day;
                return (
                  <motion.button
                    key={node.day}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDayNode(node)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-[#1A3827] border-[#4ADE80] shadow-lg shadow-[#4ADE80]/20'
                          : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28] shadow-md ring-1 ring-[#183B28]'
                        : isDark
                          ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]/40'
                          : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28] text-[#0F2418]'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{node.day}</span>
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                      isDark ? 'bg-[#1A3827] border-[#4ADE80] text-white' : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28]'
                    }`}>
                      {node.chats}
                    </div>
                    <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{node.obs} obs</span>
                  </motion.button>
                );
              })}
            </div>

            {activeNode && (
              <motion.div
                key={activeNode.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-5 space-y-3 border transition-colors ${
                  isDark ? 'bg-[#13271C] border-[#4ADE80]/40' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                }`}
              >
                <div className={`flex justify-between items-center border-b pb-3 ${
                  isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                }`}>
                  <div>
                    <h4 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{activeNode.fullDay} Activity Breakdown</h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Focus: {activeNode.topTopic || 'Field observations'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                  }`}>
                    {activeNode.intensity}% Intensity
                  </span>
                </div>

                <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>💡 Highlight: {activeNode.highlight}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 2: CONSTELLATION GALAXY ──────────────── */}
        {activeTab === 'topics' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>Topic Constellation Galaxy</h3>

            {topicNodes.length === 0 ? (
              <p className={`text-xs rounded-2xl p-6 text-center border border-dashed ${
                isDark ? 'text-slate-400 bg-[#13271C] border-[#20422E]' : 'text-[#3E5C48] bg-[#F2ECE1] border-[#D4CBB8]'
              }`}>
                Record a few observations this week and the species you find will appear here.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicNodes.map((tNode) => (
                <motion.div
                  key={tNode.id}
                  whileHover={{ scale: 1.04 }}
                  className={`p-5 rounded-2xl space-y-3 transition-all cursor-pointer shadow-md border ${
                    isDark
                      ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]'
                      : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isDark ? 'bg-[#1A3827] text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28]'
                    }`}>
                      {tNode.percent}% Activity
                    </span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{tNode.count} Threads</span>
                  </div>

                  <h4 className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{tNode.name}</h4>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{tNode.desc}</p>
                </motion.div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 3: WEEKLY GOALS PLANNER ──────────────── */}
        {activeTab === 'goals' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${
              isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
            }`}>
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.goalsTitle}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Set and track your personal weekly learning milestones.</p>
              </div>

              <button
                onClick={() => setShowGoalInput((v) => !v)}
                className={`px-4 py-2 rounded-full font-bold text-xs cursor-pointer transition-all ${
                  isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                }`}
              >
                {t.addGoalBtn}
              </button>
            </div>

            {showGoalInput && (
              <form onSubmit={handleAddGoal} className="flex items-center gap-2">
                <input
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="e.g., Read 5 interactive stories on biodiversity..."
                  className={`flex-1 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none transition-colors border ${
                    isDark
                      ? 'bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]'
                      : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs cursor-pointer shrink-0 ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0]'
                  }`}
                >
                  Save Goal
                </button>
              </form>
            )}

            <div className="space-y-3">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    g.done
                      ? isDark
                        ? 'bg-[#1A3827] border-[#4ADE80]/60 text-slate-300'
                        : 'bg-[#E1EFE0] border-[#183B28] text-[#0F2418]'
                      : isDark
                        ? 'bg-[#13271C] border-[#20422E] text-white'
                        : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                      g.done
                        ? isDark ? 'bg-[#4ADE80] border-[#4ADE80] text-[#07130B] font-bold' : 'bg-[#183B28] border-[#183B28] text-white'
                        : isDark ? 'border-slate-500' : 'border-slate-400'
                    }`}>
                      {g.done && '✓'}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${g.done ? 'line-through opacity-75' : ''}`}>
                      {g.text}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGoal(g.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────── TAB 4: RECAP VAULT ARCHIVE ──────────────── */}
        {activeTab === 'archive' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>Recap Vault Archive</h3>

            {archiveItems.length === 0 ? (
              <p className={`text-xs rounded-2xl p-6 text-center border border-dashed ${
                isDark ? 'text-slate-400 bg-[#13271C] border-[#20422E]' : 'text-[#3E5C48] bg-[#F2ECE1] border-[#D4CBB8]'
              }`}>
                Weekly recaps are generated from your real observations. Your archive will appear here after your first week with Nature Pulse.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {archiveItems.map((arc, idx) => (
                <div key={idx} className={`p-5 rounded-2xl space-y-2 border ${
                  isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{arc.week}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isDark ? 'bg-[#1A3827] text-slate-300' : 'bg-[#E1EFE0] text-[#183B28]'
                    }`}>
                      {arc.status}
                    </span>
                  </div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{arc.chats}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Primary Focus: {arc.top}</p>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
