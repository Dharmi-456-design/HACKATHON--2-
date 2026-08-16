import { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, Calendar, TrendingUp, MessageSquare, Clock, Globe, Award, 
  Target, Download, Share2, CheckCircle2, ChevronRight, Zap, RefreshCw, 
  Flame, BookOpen, User, Star, Plus, Trash2, ArrowUpRight, BarChart2, ShieldCheck,
  Compass, Radio, Disc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
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
const WEEKLY_TIMELINE_NODES = [
  { day: 'Mon', fullDay: 'Monday', chats: 3, messages: 12, topTopic: 'Photosynthesis & Canopy', intensity: 60, highlight: 'Discussed tree shade cooling effect' },
  { day: 'Tue', fullDay: 'Tuesday', chats: 2, messages: 8, topTopic: 'Migratory Birds', intensity: 45, highlight: 'Learned about Kingfisher feeding times' },
  { day: 'Wed', fullDay: 'Wednesday', chats: 6, messages: 24, topTopic: 'Urban Micro-climate', intensity: 95, highlight: 'Peak activity day with 6 conversations' },
  { day: 'Thu', fullDay: 'Thursday', chats: 4, messages: 15, topTopic: 'AI Neural Vision', intensity: 75, highlight: 'Explored camera sensor confidence' },
  { day: 'Fri', fullDay: 'Friday', chats: 3, messages: 10, topTopic: 'Banyan Canopy Ecology', intensity: 55, highlight: 'Saved 2 observations to library' },
  { day: 'Sat', fullDay: 'Saturday', chats: 5, messages: 19, topTopic: 'Interactive Stories', intensity: 85, highlight: 'Read 3 interactive AI stories' },
  { day: 'Sun', fullDay: 'Sunday', chats: 4, messages: 14, topTopic: 'Community Action', intensity: 70, highlight: 'Shared water dish action proposal' },
];

// Floating Topic Galaxy Orbit Nodes
const TOPIC_NODES = [
  { id: 't1', name: 'Nature & Botany', count: 14, percent: 35, color: 'from-[#4ADE80] to-[#254B35]', desc: 'Photosynthesis, tree shade, banyan canopy' },
  { id: 't2', name: 'AI & Neural Sensing', count: 10, percent: 25, color: 'from-blue-400 to-[#173824]', desc: 'Computer vision, confidence score' },
  { id: 't3', name: 'Bird Life & Waterfowl', count: 8, percent: 20, color: 'from-amber-400 to-[#2A4533]', desc: 'Kingfishers, Egrets, Sunbirds' },
  { id: 't4', name: 'Micro-climates', count: 5, percent: 12, color: 'from-[#E6C176] to-[#1F3E2B]', desc: 'Humidity, root canopy cooling' },
  { id: 't5', name: 'Community Actions', count: 3, percent: 8, color: 'from-purple-400 to-[#1C3627]', desc: 'Bird water dishes, leaf conservation' },
];

// Badges Data
const ACHIEVEMENTS = [
  { id: 'b1', title: '🔥 7-Day Explorer Streak', desc: 'Active every single day this week', unlocked: true },
  { id: 'b2', title: '💡 Knowledge Seeker', desc: 'Explored 5 distinct ecological topics', unlocked: true },
  { id: 'b3', title: '🌐 Multilingual Master', desc: 'Switched fluently between English, Gujarati & Hindi', unlocked: true },
  { id: 'b4', title: '📚 Story Enthusiast', desc: 'Completed 3 interactive decision stories', unlocked: true },
];

export default function WeeklyRecap() {
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = RECAP_TRANSLATIONS[lang] || RECAP_TRANSLATIONS.en;

  // Active States
  const [activeTab, setActiveTab] = useState('timeline'); // timeline, topics, goals, archive
  const [selectedDayNode, setSelectedDayNode] = useState(WEEKLY_TIMELINE_NODES[2]); // Default Wednesday
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Weekly Goals State
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_weekly_goals_v1');
      return saved
        ? JSON.parse(saved)
        : [
            { id: 'g1', text: 'Have 10 AI conversations on local flora', done: true },
            { id: 'g2', text: 'Read 3 Interactive 3D Stories', done: true },
            { id: 'g3', text: 'Document 2 micro-climate observations', done: false },
          ];
    } catch {
      return [];
    }
  });

  const [newGoalText, setNewGoalText] = useState('');
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    localStorage.setItem('pulse_weekly_goals_v1', JSON.stringify(goals));
  }, [goals]);

  // Compute Stats from saved state if available
  const totalMessagesCount = WEEKLY_TIMELINE_NODES.reduce((a, b) => a + b.messages, 0);
  const totalChatsCount = WEEKLY_TIMELINE_NODES.reduce((a, b) => a + b.chats, 0);

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
      const summaryText = `🌱 Nature Pulse Weekly Recap (${new Date().toLocaleDateString()})
• Total Conversations: ${totalChatsCount}
• Messages Exchanged: ${totalMessagesCount}
• Most Active Day: Wednesday (6 chats)
• Top Topic: Nature & Botany
• Active Streak: 7 Days 🔥`;

      navigator.clipboard.writeText(summaryText);
      alert('Weekly Recap Summary copied to clipboard!');
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 relative z-10">
        
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
              <span className="font-display text-4xl font-extrabold text-[#4ADE80] tracking-tight">98%</span>
              <span className="text-[10px] text-emerald-300 font-semibold">7 Days Active 🔥</span>
            </div>

            {/* 7 Orbiting Weekday Satellite Nodes */}
            {WEEKLY_TIMELINE_NODES.map((n, idx) => {
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
                    selectedDayNode.day === n.day
                      ? 'bg-[#4ADE80] text-[#07130B] border-white shadow-lg shadow-[#4ADE80]/40 scale-125'
                      : 'bg-[#13271C] text-slate-200 border-[#20422E] hover:border-[#4ADE80]'
                  }`}
                  title={`${n.fullDay}: ${n.chats} chats`}
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
              <h3 className="font-display text-lg sm:text-xl font-bold text-white">{t.aiSummaryTitle}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 italic font-normal leading-relaxed">
              "{t.aiSummaryText}"
            </p>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-[#1A3827] text-xs font-semibold text-[#4ADE80] border border-[#4ADE80]/40 shrink-0">
            Week of Aug 10 - Aug 16
          </span>
        </div>

        {/* ──────────────── ASYMMETRIC FLOATING CAPSULE METRICS (No standard 4-grid) ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Capsule 1: Wide Active Day Highlight */}
          <div className="md:col-span-2 bg-[#0E2015] border border-[#20422E] hover:border-[#4ADE80]/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-[#4ADE80] uppercase tracking-wider">{t.mostActiveDay}</p>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-1">Wednesday</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs text-[#4ADE80] border border-[#4ADE80]/30 font-bold">
                6 Chats · 24 Messages
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Peak activity recorded between 6:00 PM and 8:30 PM discussing Urban Micro-climates and Canopy Shade.
            </p>
          </div>

          {/* Capsule 2: Vertical Interaction Velocity */}
          <div className="bg-[#0E2015] border border-[#20422E] hover:border-[#4ADE80]/60 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all">
            <div>
              <p className="text-xs font-semibold text-[#4ADE80] uppercase tracking-wider">{t.totalChats}</p>
              <h3 className="font-display text-3xl font-extrabold text-white mt-1">{totalChatsCount} Chats</h3>
              <p className="text-xs text-emerald-400 font-medium mt-1">+18% vs Last Week</p>
            </div>
            <div className="border-t border-[#20422E] pt-3 text-[11px] text-slate-400">
              High interaction across Nature Lens & Pulse Chat.
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
              {WEEKLY_TIMELINE_NODES.map((node) => {
                const isSelected = selectedDayNode.day === node.day;
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
                    <span className="text-[10px] text-slate-400">{node.messages} msgs</span>
                  </motion.button>
                );
              })}
            </div>

            {selectedDayNode && (
              <motion.div
                key={selectedDayNode.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#13271C] border border-[#4ADE80]/40 rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between items-center border-b border-[#20422E] pb-3">
                  <div>
                    <h4 className="font-display text-lg font-bold text-white">{selectedDayNode.fullDay} Activity Breakdown</h4>
                    <p className="text-xs text-slate-400">Focus: {selectedDayNode.topTopic}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80] border border-[#4ADE80]/30">
                    {selectedDayNode.intensity}% Intensity
                  </span>
                </div>

                <p className="text-sm text-slate-200 font-medium">💡 Highlight: {selectedDayNode.highlight}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 2: CONSTELLATION GALAXY ──────────────── */}
        {activeTab === 'topics' && (
          <div className="bg-[#0E2015] border border-[#20422E] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-white">Topic Constellation Galaxy</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPIC_NODES.map((tNode) => (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { week: 'Aug 10 - Aug 16, 2026', chats: '27 Chats', top: 'Photosynthesis & Canopy', status: 'Current Week' },
                { week: 'Aug 03 - Aug 09, 2026', chats: '22 Chats', top: 'Migratory Sunbirds', status: 'Completed' },
                { week: 'Jul 27 - Aug 02, 2026', chats: '19 Chats', top: 'Micro-climate Research', status: 'Completed' },
              ].map((arc, idx) => (
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
          </div>
        )}

      </div>
    </div>
  );
}
