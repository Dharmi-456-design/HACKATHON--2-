import { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Trophy, Flame, Zap, Target, Clock, CheckCircle2, 
  ChevronRight, Play, Plus, Trash2, X, Wand2, Compass, MapPin, Award, 
  RotateCcw, ArrowLeft, Check, Layers, AlertCircle, BarChart2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Mission Control Universe
const MISSION_TRANSLATIONS = {
  en: {
    heroTag: 'AI MISSION CONTROL CENTER',
    heroTitle: 'Your Ecological Adventure Path',
    heroSubtitle: 'Complete personalized AI challenges, earn XP, build daily streaks, and master urban biodiversity.',
    createMissionBtn: 'Create Custom Mission',
    generateAIBtn: '✨ Generate AI Challenge',
    tabPath: '🗺️ Mission Path',
    tabActive: '⚡ Active Missions',
    tabCompleted: '🏆 Completed',
    tabCreate: '✍️ Custom Creator',
    catLearning: '📚 Learning',
    catProductivity: '⚡ Productivity',
    catCreativity: '🎨 Creativity',
    catExploration: '🌍 Exploration',
    catGoals: '🎯 Personal Goals',
    catAI: '🤖 AI Challenges',
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
    xpLabel: 'Total Mission XP',
    streakLabel: 'Active Streak',
    aiAssistantHint: 'Need a hint or breakdown for this step?',
  },
  gu: {
    heroTag: 'એઆઈ મિશન કંટ્રોલ સેન્ટર',
    heroTitle: 'તમારો ઇકોલોજીકલ એડવેન્ચર પાથ',
    heroSubtitle: 'વ્યક્તિગત એઆઈ પડકારો પૂર્ણ કરો, XP કમાઓ, દૈનિક શ્રેણી બનાવો અને શહેરી જૈવવિવિધતામાં પ્રાવીણ્ય મેળવો.',
    createMissionBtn: 'કસ્ટમ મિશન બનાવો',
    generateAIBtn: '✨ એઆઈ મિશન બનાવો',
    tabPath: '🗺️ મિશન પાથ',
    tabActive: '⚡ સક્રિય મિશનો',
    tabCompleted: '🏆 પૂર્ણ કરેલ',
    tabCreate: '✍️ કસ્ટમ ક્રિએટર',
    catLearning: '📚 શિક્ષણ',
    catProductivity: '⚡ ઉત્પાકતા',
    catCreativity: '🎨 સર્જનાત્મકતા',
    catExploration: '🌍 સંશોધન',
    catGoals: '🎯 લક્ષ્યો',
    catAI: '🤖 એઆઈ પડકારો',
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
    xpLabel: 'કુલ મિશન XP',
    streakLabel: 'સક્રિય શ્રેણી',
    aiAssistantHint: 'આ પગલા માટે સંકેત જોઈએ છે?',
  },
  hi: {
    heroTag: 'एआई मिशन कंट्रोल सेंटर',
    heroTitle: 'आपका पारिस्थितिक साहसिक पथ',
    heroSubtitle: 'व्यक्तिगत एआई चुनौतियों को पूरा करें, XP कमाएं, दैनिक स्ट्रीक बनाएं और शहरी जैव विविधता में महारत हासिल करें।',
    createMissionBtn: 'कस्टम मिशन बनाएं',
    generateAIBtn: '✨ एआई मिशन बनाएं',
    tabPath: '🗺️ मिशन पथ',
    tabActive: '⚡ सक्रिय मिशन',
    tabCompleted: '🏆 पूरा किया गया',
    tabCreate: '✍️ कस्टम क्रिएटर',
    catLearning: '📚 सीखना',
    catProductivity: '⚡ उत्पादकता',
    catCreativity: '🎨 रचनात्मकता',
    catExploration: '🌍 खोज',
    catGoals: '🎯 व्यक्तिगत लक्ष्य',
    catAI: '🤖 एआई चुनौतियां',
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
    xpLabel: 'कुल मिशन XP',
    streakLabel: 'सक्रिय स्ट्रीक',
    aiAssistantHint: 'इस चरण के लिए संकेत चाहिए?',
  },
};

// Seed Missions with Detailed Action Steps & Dynamic XP
const SEED_MISSIONS = [
  {
    id: 'm-101',
    title: 'Listen to Tree Canopy at Dawn',
    category: 'Exploration',
    difficulty: '🟢 Easy',
    duration: '10 min',
    xpReward: 100,
    status: 'in_progress', // not_started, in_progress, completed
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
    category: 'AI Challenges',
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
      return saved ? parseInt(saved, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  const [streakDays, setStreakDays] = useState(7);
  const [activeTab, setActiveTab] = useState('path'); // path, active, completed, create
  const [selectedMission, setSelectedMission] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom Mission Creator State
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Exploration');
  const [customDifficulty, setCustomDifficulty] = useState('🟢 Easy');
  const [customDuration, setCustomDuration] = useState('15 min');

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

        // Add XP reward if completed just now
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
        category: 'AI Challenges',
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

  // Create Custom Mission
  const handleCreateCustomMission = (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newMission = {
      id: `m-${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      difficulty: customDifficulty,
      duration: customDuration,
      xpReward: customDifficulty === '🔴 Hard' ? 250 : customDifficulty === '🟡 Medium' ? 180 : 100,
      status: 'in_progress',
      steps: [
        { id: `cs-1`, text: 'Prepare observation area and tools', done: false },
        { id: `cs-2`, text: 'Execute main mission objective', done: false },
        { id: `cs-3`, text: 'Record final reflection note', done: false },
      ],
      aiHint: 'Stay observant of micro-climate shifts near foliage.',
      hintOpened: false,
    };

    setMissions([newMission, ...missions]);
    setCustomTitle('');
    setActiveTab('path');
    setSelectedMission(newMission);
  };

  // Toggle AI Hint
  const toggleAIHint = (missionId) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, hintOpened: !m.hintOpened } : m))
    );
    if (selectedMission?.id === missionId) {
      setSelectedMission((prev) => ({ ...prev, hintOpened: !prev.hintOpened }));
    }
  };

  // Delete Mission
  const handleDeleteMission = (missionId) => {
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    if (selectedMission?.id === missionId) setSelectedMission(null);
  };

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── GENERATE AI MISSION MODAL ──────────────── */}
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
                  <Wand2 className="w-5 h-5 text-[#4ADE80]" />
                  <span>Generate AI Challenge</span>
                </h3>
                <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white">
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
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'Synthesizing Mission…' : 'Generate Mission'}</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── HERO BANNER ──────────────── */}
        <div className="relative bg-gradient-to-r from-[#0E2316] via-[#112D1B] to-[#0A1A10] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold uppercase tracking-widest">
                <Target className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
                {t.heroTag}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGenerateModal(true)}
                className="px-5 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>{t.generateAIBtn}</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ──────────────── XP REACTOR & STREAK STATUS BAR ──────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-[#0E2015] border border-[#20422E] p-5 rounded-3xl flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-bold text-[#4ADE80] uppercase tracking-wider">{t.levelTitle}</p>
              <h3 className="font-display text-2xl font-extrabold text-white mt-0.5">{totalXP} XP</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#1A3827] border border-[#4ADE80]/50 flex items-center justify-center text-xl">
              🏆
            </div>
          </div>

          <div className="bg-[#0E2015] border border-[#20422E] p-5 rounded-3xl flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">{t.streakLabel}</p>
              <h3 className="font-display text-2xl font-extrabold text-white mt-0.5">{streakDays} Days 🔥</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#2A1F13] border border-amber-400/50 flex items-center justify-center text-xl">
              🔥
            </div>
          </div>

          <div className="bg-[#0E2015] border border-[#20422E] p-5 rounded-3xl flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Completed Missions</p>
              <h3 className="font-display text-2xl font-extrabold text-white mt-0.5">
                {missions.filter((m) => m.status === 'completed').length} / {missions.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#132738] border border-blue-400/50 flex items-center justify-center text-xl">
              🎯
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

            {/* Checkpoint Path Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {missions.map((mission, idx) => {
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

        {/* ──────────────── SELECTED MISSION STEP READER DRAWER ──────────────── */}
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#112318] border border-[#4ADE80]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-start border-b border-[#20452F] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80]">
                    {selectedMission.category}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">+{selectedMission.xpReward} XP Reward</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">{selectedMission.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteMission(selectedMission.id)}
                  className="p-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                  title="Delete Mission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedMission(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mission Action Steps Checklist */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Action Steps & Checklist</p>

              {selectedMission.steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => toggleStep(selectedMission.id, step.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    step.done
                      ? 'bg-[#1A3827] border-[#4ADE80] text-slate-200'
                      : 'bg-[#0E2015] border-[#20422E] text-white hover:border-[#4ADE80]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                      step.done ? 'bg-[#4ADE80] border-[#4ADE80] text-[#07130B]' : 'border-slate-500'
                    }`}>
                      {step.done && '✓'}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${step.done ? 'line-through opacity-75' : ''}`}>
                      {step.text}
                    </span>
                  </div>

                  <span className="text-[11px] text-[#4ADE80] font-semibold">{step.done ? 'Done' : 'Tap to complete'}</span>
                </div>
              ))}
            </div>

            {/* AI Assistant Hint Box */}
            <div className="bg-[#0E2015] border border-[#20422E] p-4 rounded-2xl space-y-2">
              <button
                onClick={() => toggleAIHint(selectedMission.id)}
                className="text-xs font-bold text-[#4ADE80] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>{t.aiAssistantHint}</span>
              </button>

              {selectedMission.hintOpened && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-slate-300 italic pt-1 leading-relaxed"
                >
                  💡 AI Tip: "{selectedMission.aiHint}"
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {/* ──────────────── TAB 4: CUSTOM MISSION CREATOR ──────────────── */}
        {activeTab === 'create' && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-display text-2xl font-bold text-white">Create Custom Mission</h3>

            <form onSubmit={handleCreateCustomMission} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                  Mission Title
                </label>
                <input
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Build a native plant seed jar"
                  className="w-full bg-[#13271C] border border-[#20422E] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-[#13271C] border border-[#20422E] rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                  >
                    <option value="Learning">📚 Learning</option>
                    <option value="Productivity">⚡ Productivity</option>
                    <option value="Creativity">🎨 Creativity</option>
                    <option value="Exploration">🌍 Exploration</option>
                    <option value="Personal Goals">🎯 Personal Goals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Difficulty
                  </label>
                  <select
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value)}
                    className="w-full bg-[#13271C] border border-[#20422E] rounded-2xl px-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                  >
                    <option value="🟢 Easy">🟢 Easy (+100 XP)</option>
                    <option value="🟡 Medium">🟡 Medium (+180 XP)</option>
                    <option value="🔴 Hard">🔴 Hard (+250 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                    Duration
                  </label>
                  <input
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="15 min"
                    className="w-full bg-[#13271C] border border-[#20422E] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] cursor-pointer shadow-lg"
              >
                Save Custom Mission
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
