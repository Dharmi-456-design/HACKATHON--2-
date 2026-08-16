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
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
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
  const [recap, setRecap] = useState(null);
  const [dayCounts, setDayCounts] = useState({});

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/weekly-recap', {}, token)
      .then(setRecap)
      .catch(() => setRecapError('Could not load your weekly recap. Please check your connection and try again.'));
    apiFetch('/api/discoveries', {}, token)
      .then((list) => {
        if (!Array.isArray(list)) return;
        const counts = {};
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - 6);
        const startKey = start.toISOString().slice(0, 10);
        for (const d of list) {
          const key = new Date(d.createdAt || d.created_at).toISOString().slice(0, 10);
          if (key >= startKey) counts[key] = (counts[key] || 0) + 1;
        }
        setDayCounts(counts);
      })
      .catch(() => setRecapError('Could not load this week\u2019s activity. Please check your connection and try again.'));
    apiFetch('/api/profile', {}, token)
      .then((p) => {
        if (Array.isArray(p?.weekly_goals)) {
          setGoals(p.weekly_goals);
        }
        goalsLoadedRef.current = true;
      })
      .catch(() => setRecapError('Could not load your weekly goals. Please check your connection and try again.'));
  }, [token]);

  useEffect(() => {
    if (!goalsLoadedRef.current) return;
    setGoalsError('');
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ weekly_goals: goals }) }, token).catch(() => {
      setGoalsError('Your goals could not be saved. Please check your connection and try again.');
    });
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
• Top Species: ${speciesNames.slice(0, 3).join(', ') || 'None yet'}`;

      navigator.clipboard.writeText(summaryText2);
      alert('Weekly Recap Summary copied to clipboard!');
      setIsExporting(false);
    }, 300);
  };

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white' : 'bg-[#F8F9FA] text-slate-800 selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 relative z-10">

        {(recapError || goalsError) && (
          <div className="space-y-3">
            {recapError && <ErrorBanner message={recapError} />}
            {goalsError && <ErrorBanner message={goalsError} />}
          </div>
        )}
        
        {/* ──────────────── RADICAL NEW CONCEPT: CELESTIAL ORBITAL HOLOGRAM SPHERE HEADER ──────────────── */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 py-6 px-4 sm:px-8 border-b border-[#20452F]/60">
          
          {/* Left Orbital Text */}
          <div className="space-y-3 text-center md:text-left max-w-lg z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0E2618] text-[#4ADE80] border border-[#4ADE80]/40 text-xs font-bold uppercase tracking-widest shadow-md">
              <Radio className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
              {t.heroTag}
            </span>
            
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-[#4ADE80] tracking-tight leading-tight">
              {t.heroTitle}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap justify-center md:justify-start items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportRecap}
                disabled={isExporting}
                className="px-6 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer"
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
              className="absolute inset-0 rounded-full border-2 border-dashed border-[#4ADE80]/40"
            />
            
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-4 rounded-full bg-[#4ADE80]/20 blur-xl"
            />

            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#1A3827] via-[#0E2015] to-[#040B06] border-2 border-[#4ADE80] flex flex-col items-center justify-center text-center shadow-2xl relative z-10 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Eco Score</span>
              <span className="font-display text-4xl font-extrabold text-[#4ADE80] tracking-tight">{ecoScore}</span>
              <span className="text-[10px] text-emerald-300 font-semibold">{ecoSubtitle}</span>
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
                      ? 'bg-[#4ADE80] text-[#07130B] border-white shadow-lg shadow-[#4ADE80]/40 scale-125'
                      : 'bg-[#13271C] text-slate-200 border-[#20422E] hover:border-[#4ADE80]'
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
        <div className="bg-[#0E2015] border border-[#4ADE80]/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4ADE80] animate-pulse" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-white">{summaryTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 italic font-normal leading-relaxed">
              "{summaryText}"
            </p>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-[#1A3827] text-xs font-semibold text-[#4ADE80] border border-[#4ADE80]/40 shrink-0">
            {weekLabel}
          </span>
        </div>

        {/* ──────────────── ASYMMETRIC FLOATING CAPSULE METRICS (No standard 4-grid) ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Capsule 1: Wide Active Day Highlight */}
          <div className="md:col-span-2 bg-[#0E2015] border border-[#20422E] hover:border-[#4ADE80]/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-[#4ADE80] uppercase tracking-wider">{t.mostActiveDay}</p>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-1">{mostActiveDay}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs text-[#4ADE80] border border-[#4ADE80]/30 font-bold">
                {mostActiveCount > 0 ? `${mostActiveCount} Observation${mostActiveCount === 1 ? '' : 's'}` : 'No activity yet'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {mostActiveDay !== '—'
                ? `Most of this week's observations were recorded on ${mostActiveDay}.`
                : 'No observations recorded yet this week.'}
            </p>
          </div>

          {/* Capsule 2: Vertical Interaction Velocity */}
          <div className="bg-[#0E2015] border border-[#20422E] hover:border-[#4ADE80]/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all">
            <div>
              <p className="text-xs font-semibold text-[#4ADE80] uppercase tracking-wider">Species Logged</p>
              <h3 className="font-display text-3xl font-extrabold text-white mt-1">{totalChatsCount} Species</h3>
            </div>
            <div className="border-t border-[#20422E] pt-3 text-[11px] text-slate-400">
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
                  ? 'bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15'
                  : 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ──────────────── TAB 1: S-CURVE INTERACTIVE TIMELINE ──────────────── */}
        {activeTab === 'timeline' && (
          <div className="bg-[#0E2015] border border-[#20422E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-white">S-Curve Weekly Timeline Journey</h3>

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
                        ? 'bg-[#1A3827] border-[#4ADE80] shadow-lg shadow-[#4ADE80]/20'
                        : 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]/40'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">{node.day}</span>
                    <div className="w-7 h-7 rounded-full bg-[#1A3827] border border-[#4ADE80] flex items-center justify-center text-[10px] font-bold text-white">
                      {node.chats}
                    </div>
                    <span className="text-[10px] text-slate-400">{node.obs} obs</span>
                  </motion.button>
                );
              })}
            </div>

            {activeNode && (
              <motion.div
                key={activeNode.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#13271C] border border-[#4ADE80]/40 rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between items-center border-b border-[#20422E] pb-3">
                  <div>
                    <h4 className="font-display text-lg font-bold text-white">{activeNode.fullDay} Activity Breakdown</h4>
                    <p className="text-xs text-slate-400">Focus: {activeNode.topTopic || 'Field observations'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80] border border-[#4ADE80]/30">
                    {activeNode.intensity}% Intensity
                  </span>
                </div>

                <p className="text-sm text-slate-200 font-medium">💡 Highlight: {activeNode.highlight}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 2: CONSTELLATION GALAXY ──────────────── */}
        {activeTab === 'topics' && (
          <div className="bg-[#0E2015] border border-[#20422E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-white">Topic Constellation Galaxy</h3>

            {topicNodes.length === 0 ? (
              <p className="text-xs text-slate-400 bg-[#13271C] border border-dashed border-[#20422E] rounded-2xl p-6 text-center">
                Record a few observations this week and the species you find will appear here.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topicNodes.map((tNode) => (
                <motion.div
                  key={tNode.id}
                  whileHover={{ scale: 1.04 }}
                  className="bg-[#13271C] border border-[#20422E] hover:border-[#4ADE80] p-5 rounded-2xl space-y-3 transition-all cursor-pointer shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80]">
                      {tNode.percent}% Activity
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{tNode.count} Threads</span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-white">{tNode.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{tNode.desc}</p>
                </motion.div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 3: WEEKLY GOALS PLANNER ──────────────── */}
        {activeTab === 'goals' && (
          <div className="bg-[#0E2015] border border-[#20422E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#20422E] pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">{t.goalsTitle}</h3>
                <p className="text-xs text-slate-400">Set and track your personal weekly learning milestones.</p>
              </div>

              <button
                onClick={() => setShowGoalInput((v) => !v)}
                className="px-4 py-2 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] cursor-pointer"
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
                  className="flex-1 bg-[#13271C] border border-[#20422E] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-[#4ADE80] text-[#07130B] font-bold text-xs cursor-pointer shrink-0"
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
                    g.done ? 'bg-[#1A3827] border-[#4ADE80]/60 text-slate-300' : 'bg-[#13271C] border-[#20422E] text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                      g.done ? 'bg-[#4ADE80] border-[#4ADE80] text-[#07130B] font-bold' : 'border-slate-500'
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
                    className="p-1 text-slate-400 hover:text-red-400"
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
          <div className="bg-[#0E2015] border border-[#20422E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-white">Recap Vault Archive</h3>

            {archiveItems.length === 0 ? (
              <p className="text-xs text-slate-400 bg-[#13271C] border border-dashed border-[#20422E] rounded-2xl p-6 text-center">
                Weekly recaps are generated from your real observations. Your archive will appear here after your first week with Nature Pulse.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {archiveItems.map((arc, idx) => (
                <div key={idx} className="bg-[#13271C] border border-[#20422E] p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#4ADE80]">{arc.week}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1A3827] text-[10px] text-slate-300 font-semibold">
                      {arc.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{arc.chats}</p>
                  <p className="text-xs text-slate-400">Primary Focus: {arc.top}</p>
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
