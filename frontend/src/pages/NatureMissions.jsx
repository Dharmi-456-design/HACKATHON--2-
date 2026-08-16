import { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Trophy, Flame, Zap, Target, Clock, CheckCircle2, 
  ChevronRight, Play, Plus, Trash2, X, Wand2, Compass, MapPin, Award, 
  RotateCcw, ArrowLeft, Check, Layers, AlertCircle, BarChart2, Star, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Mission Control Universe
const MISSION_TRANSLATIONS = {
  en: {
    heroTag: 'Good Morning, Explorer 🌿',
    heroTitle: 'Your Eco Guide',
    heroHighlight: 'Better Tomorrow',
    heroSubtitle1: 'Ask. Learn. Protect.',
    heroSubtitle2: 'Together we create a sustainable future.',
    createMissionBtn: 'Create Custom Mission',
    generateAIBtn: '✨ Generate Challenge',
    tabPath: '🗺️ Mission Path',
    tabActive: '⚡ Active Missions',
    tabCompleted: '🏆 Completed',
    tabCreate: '✍️ Custom Creator',
    catLearning: '📚 Learning',
    catProductivity: '⚡ Productivity',
    catCreativity: '🎨 Creativity',
    catExploration: '🌍 Exploration',
    catGoals: '🎯 Personal Goals',
    catAI: '🤖 Challenges',
    diffEasy: '🟢 Easy',
    diffMedium: '🟡 Medium',
    diffHard: '🔴 Hard',
    diffExpert: '🟣 Expert',
    startMission: 'Start Mission',
    continueMission: 'Continue Mission',
    completeStep: 'Mark Step Complete',
    missionCompleted: 'Mission Completed! 🎉',
    earnedXP: 'XP Earned',
    levelTitle: 'Level 4 Commander',
    xpLabel: 'Eco XP',
    streakLabel: 'Streak',
    aiAssistantHint: 'Need a hint or breakdown for this step?',
  },
  gu: {
    heroTag: 'શુભ સવાર, એક્સપ્લોરર 🌿',
    heroTitle: 'તમારો ઇકો ગાઇડ',
    heroHighlight: 'ઉજ્જવળ ભવિષ્ય માટે',
    heroSubtitle1: 'પૂછો. શીખો. રક્ષણ કરો.',
    heroSubtitle2: 'સાથે મળીને આપણે એક ટકાઉ ભવિષ્ય બનાવીએ છીએ.',
    createMissionBtn: 'કસ્ટમ મિશન બનાવો',
    generateAIBtn: '✨ પડકાર જનરેટ કરો',
    tabPath: '🗺️ મિશન પાથ',
    tabActive: '⚡ સક્રિય મિશનો',
    tabCompleted: '🏆 પૂર્ણ કરેલ',
    tabCreate: '✍️ કસ્ટમ ક્રિએટર',
    catLearning: '📚 શિક્ષણ',
    catProductivity: '⚡ ઉત્પાદકતા',
    catCreativity: '🎨 સર્જનાત્મકતા',
    catExploration: '🌍 સંશોધન',
    catGoals: '🎯 લક્ષ્યો',
    catAI: '🤖 પડકારો',
    diffEasy: '🟢 સરળ',
    diffMedium: '🟡 મધ્યમ',
    diffHard: '🔴 કઠિન',
    diffExpert: '🟣 નિષ્ણાત',
    startMission: 'મિશન શરૂ કરો',
    continueMission: 'ચાલુ રાખો',
    completeStep: 'પગલું પૂર્ણ માર્ક કરો',
    missionCompleted: 'મિશન પૂર્ણ થયું! 🎉',
    earnedXP: 'XP મેળવ્યું',
    levelTitle: 'લેવલ 4 કમાન્ડર',
    xpLabel: 'ઇકો XP',
    streakLabel: 'શ્રેણી',
    aiAssistantHint: 'આ પગલા માટે સંકેત જોઈએ છે?',
  },
  hi: {
    heroTag: 'शुभ प्रभात, एक्सप्लोरर 🌿',
    heroTitle: 'आपका इको गाइड',
    heroHighlight: 'बेहतर कल के लिए',
    heroSubtitle1: 'पूछें। सीखें। रक्षा करें।',
    heroSubtitle2: 'साथ मिलकर हम एक टिकाऊ भविष्य बनाते हैं।',
    createMissionBtn: 'कस्टम मिशन बनाएं',
    generateAIBtn: '✨ चुनौती बनाएं',
    tabPath: '🗺️ मिशन पथ',
    tabActive: '⚡ सक्रिय मिशन',
    tabCompleted: '🏆 पूरा किया गया',
    tabCreate: '✍️ कस्टम क्रिएटर',
    catLearning: '📚 सीखना',
    catProductivity: '⚡ उत्पादकता',
    catCreativity: '🎨 रचनात्मकता',
    catExploration: '🌍 खोज',
    catGoals: '🎯 व्यक्तिगत लक्ष्य',
    catAI: '🤖 चुनौतियां',
    diffEasy: '🟢 आसान',
    diffMedium: '🟡 मध्यम',
    diffHard: '🔴 कठिन',
    diffExpert: '🟣 विशेषज्ञ',
    startMission: 'मिशन शुरू करें',
    continueMission: 'जारी रखें',
    completeStep: 'चरण पूरा चिह्नित करें',
    missionCompleted: 'मिशन पूरा हुआ! 🎉',
    earnedXP: 'XP अर्जित',
    levelTitle: 'लेवल 4 कमांडर',
    xpLabel: 'इको XP',
    streakLabel: 'स्ट्रीक',
    aiAssistantHint: 'इस चरण के लिए संकेत चाहिए?',
  },
};

// Seed Missions
const SEED_MISSIONS = [
  {
    id: 'm-101',
    title: 'Listen to Tree Canopy at Dawn',
    category: 'Exploration',
    difficulty: '🟢 Easy',
    duration: '10 min',
    xpReward: 100,
    status: 'in_progress',
    steps: [
      { id: 's1', text: 'Find a shaded Banyan or Peepal tree near your location', done: true },
      { id: 's2', text: 'Stand quietly for 5 minutes without phone distractions', done: true },
      { id: 's3', text: 'Log 2 distinct bird sounds or leaf rustles in Nature Pulse', done: false },
    ],
    aiHint: 'Early morning between 6:00 AM and 7:15 AM provides peak birdsong clarity.',
    hintOpened: false,
  },
  {
    id: 'm-102',
    title: 'Discover 3 Distinct Moss & Lichen Textures',
    category: 'Learning',
    difficulty: '🟡 Medium',
    duration: '15 min',
    xpReward: 180,
    status: 'in_progress',
    steps: [
      { id: 's4', text: 'Inspect shaded wall bases or moist tree trunks', done: true },
      { id: 's5', text: 'Touch 3 different patches and observe moisture levels', done: false },
      { id: 's6', text: 'Identify if it is crustose or foliose lichen', done: false },
    ],
    aiHint: 'Mosses act as micro-ecosystem sponges, absorbing urban rainwater.',
    hintOpened: false,
  },
  {
    id: 'm-103',
    title: 'Identify Night Moth Visitors Near Light',
    category: 'Challenges',
    difficulty: '🔴 Hard',
    duration: '20 min',
    xpReward: 250,
    status: 'not_started',
    steps: [
      { id: 's7', text: 'Check an outdoor lamp after dusk near garden plants', done: false },
      { id: 's8', text: 'Use Nature Lens camera stack to scan wing patterns', done: false },
      { id: 's9', text: 'Record observation in Biodiversity Passport', done: false },
    ],
    aiHint: 'Sphinx moths and silk moths are attracted to white LED garden lamps.',
    hintOpened: false,
  },
  {
    id: 'm-104',
    title: 'Install Bird Water Dish Before Summer',
    category: 'Personal Goals',
    difficulty: '🟡 Medium',
    duration: '25 min',
    xpReward: 200,
    status: 'completed',
    steps: [
      { id: 's10', text: 'Select a shallow clay dish for garden or balcony', done: true },
      { id: 's11', text: 'Place in shaded corner away from urban predators', done: true },
      { id: 's12', text: 'Fill with clean water and post Community update', done: true },
    ],
    aiHint: 'Shallow water dishes prevent bird drowning while aiding migratory species.',
    hintOpened: false,
  }
];

export default function NatureMissions() {
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = MISSION_TRANSLATIONS[lang] || MISSION_TRANSLATIONS.en;

  // Persistent States
  const [missions, setMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_missions_v1');
      return saved ? JSON.parse(saved) : SEED_MISSIONS;
    } catch {
      return SEED_MISSIONS;
    }
  });

  const [totalXP, setTotalXP] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_missions_xp_v1');
      return saved ? parseInt(saved, 10) : 2450;
    } catch {
      return 2450;
    }
  });

  const [streakDays, setStreakDays] = useState(7);
  const [activeTab, setActiveTab] = useState('path');
  const [selectedMission, setSelectedMission] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('pulse_missions_v1', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('pulse_missions_xp_v1', totalXP.toString());
  }, [totalXP]);

  // Toggle Step Completion
  const toggleStep = (missionId, stepId) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id !== missionId) return m;
        const updatedSteps = m.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s));
        const allDone = updatedSteps.every((s) => s.done);
        const nextStatus = allDone ? 'completed' : 'in_progress';

        if (allDone && m.status !== 'completed') {
          setTotalXP((xp) => xp + m.xpReward);
        }

        const updatedMission = { ...m, steps: updatedSteps, status: nextStatus };
        if (selectedMission?.id === missionId) setSelectedMission(updatedMission);
        return updatedMission;
      })
    );
  };

  // Generate AI Mission
  const handleGenerateAIMission = (e) => {
    e.preventDefault();
    if (!generatePrompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const newMission = {
        id: `m-${Date.now()}`,
        title: generatePrompt.trim(),
        category: 'Challenges',
        difficulty: '🟡 Medium',
        duration: '15 min',
        xpReward: 150,
        status: 'in_progress',
        steps: [
          { id: `s-${Date.now()}-1`, text: 'Explore core concepts of the challenge', done: false },
          { id: `s-${Date.now()}-2`, text: 'Log your observations in Nature Pulse', done: false },
          { id: `s-${Date.now()}-3`, text: 'Share your findings with the community', done: false },
        ],
        aiHint: 'Focus on observing local variations during golden hour light.',
        hintOpened: false,
      };

      setMissions([newMission, ...missions]);
      setIsGenerating(false);
      setShowGenerateModal(false);
      setGeneratePrompt('');
      setSelectedMission(newMission);
    }, 1500);
  };

  // Delete Mission
  const handleDeleteMission = (missionId) => {
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    if (selectedMission?.id === missionId) setSelectedMission(null);
  };

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── GENERATE MISSION MODAL ──────────────── */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#112318] border border-[#4ADE80]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#20452F] pb-3">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#4ADE80]" />
                  <span>Generate Challenge</span>
                </h3>
                <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateAIMission} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Challenge Idea or Goal
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    placeholder="e.g., Learn how swallowtail butterflies find urban flowering plants..."
                    className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl p-3.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isGenerating ? 'Synthesizing Mission…' : 'Generate Mission'}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── ATMOSPHERIC DARK FOREST LANDSCAPE HERO BANNER (MATCHING SCREENSHOT) ──────────────── */}
        <div className="relative border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between group">
          
          {/* HD Misty Forest Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80')` }}
          />
          
          {/* Dark Forest Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040C07] via-[#040C07]/85 to-[#040C07]/40" />

          {/* Glowing Green Energy Leaf Orb on Right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 pointer-events-none flex items-center justify-center z-10">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-[#4ADE80]/25 blur-2xl"
            />
            
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 border-[#4ADE80]/60 flex items-center justify-center relative shadow-[0_0_50px_rgba(74,222,128,0.35)] backdrop-blur-xs">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-1 rounded-full border border-dashed border-[#4ADE80]/40"
              />

              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#2E6141] to-[#102B1B] border border-[#4ADE80] flex items-center justify-center shadow-xl text-3xl sm:text-4xl"
              >
                🌿
              </motion.div>
            </div>
          </div>

          {/* Left Overlaid Text Content */}
          <div className="space-y-3 max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E2015]/90 text-[#4ADE80] border border-[#4ADE80]/40 text-xs font-semibold backdrop-blur-md">
              {t.heroTag}
            </span>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              {t.heroTitle} <br />
              for a <span className="text-[#4ADE80]">{t.heroHighlight}</span>
            </h1>

            <div className="space-y-0.5 text-xs sm:text-sm text-slate-200">
              <p className="font-semibold text-slate-100">{t.heroSubtitle1}</p>
              <p className="text-slate-300/90">{t.heroSubtitle2}</p>
            </div>
          </div>

          {/* Bottom 4 Integrated Stat Pills Overlaid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 relative z-10">
            <div className="bg-[#0A1A10]/95 border border-[#20422E] p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md">
              <div>
                <p className="text-[10px] uppercase font-semibold text-emerald-400">{t.xpLabel}</p>
                <p className="font-display text-xl font-extrabold text-white mt-0.5">{totalXP.toLocaleString()}</p>
              </div>
              <span className="text-lg">🌿</span>
            </div>

            <div className="bg-[#0A1A10]/95 border border-[#20422E] p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">{t.streakLabel}</p>
                <p className="font-display text-xl font-extrabold text-white mt-0.5">{streakDays} Days</p>
              </div>
              <span className="text-lg">🔥</span>
            </div>

            <div className="bg-[#0A1A10]/95 border border-[#20422E] p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Quests</p>
                <p className="font-display text-xl font-extrabold text-white mt-0.5">
                  {missions.filter((m) => m.status === 'completed').length} / {missions.length}
                </p>
              </div>
              <span className="text-lg">⭐</span>
            </div>

            <div className="bg-[#0A1A10]/95 border border-[#20422E] p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Rank</p>
                <p className="font-display text-sm sm:text-base font-extrabold text-[#4ADE80] mt-0.5">Eco Guardian</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-400/50 flex items-center justify-center text-xs">
                🟣
              </div>
            </div>
          </div>

        </div>

        {/* ──────────────── NAVIGATION TABS ──────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none">
          {[
            { id: 'path', label: t.tabPath },
            { id: 'active', label: t.tabActive },
            { id: 'completed', label: t.tabCompleted },
            { id: 'create', label: t.tabCreate },
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

        {/* ──────────────── TAB 1: CHECKPOINT MISSION PATH ──────────────── */}
        {activeTab === 'path' && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
            <h3 className="font-display text-2xl font-bold text-white">Ecological Checkpoint Mission Trail</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {missions.map((mission) => {
                const isSelected = selectedMission?.id === mission.id;
                const isDone = mission.status === 'completed';
                const completedStepsCount = mission.steps.filter((s) => s.done).length;
                const progressPct = Math.round((completedStepsCount / mission.steps.length) * 100);

                return (
                  <motion.div
                    key={mission.id}
                    whileHover={{ scale: 1.04 }}
                    onClick={() => setSelectedMission(mission)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between h-56 ${
                      isSelected
                        ? 'bg-[#1A3827] border-[#4ADE80] shadow-[#4ADE80]/30'
                        : isDone
                        ? 'bg-[#0E2015] border-[#4ADE80]/40'
                        : 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0E2015] text-[#4ADE80] border border-[#4ADE80]/30">
                          {mission.difficulty}
                        </span>
                        <span className="text-xs text-amber-400 font-bold">+{mission.xpReward} XP</span>
                      </div>

                      <h4 className="font-display text-base font-bold text-white line-clamp-2 mt-1">
                        {mission.title}
                      </h4>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#20422E]">
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{completedStepsCount}/{mission.steps.length} Steps</span>
                        <span className="text-[#4ADE80] font-bold">{progressPct}%</span>
                      </div>

                      <div className="w-full bg-[#0E2015] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#4ADE80] h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
