import { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Trophy, Flame, Zap, Target, Clock, CheckCircle2, 
  ChevronRight, Play, Plus, Trash2, X, Wand2, Compass, MapPin, Award, 
  RotateCcw, ArrowLeft, Check, Layers, AlertCircle, BarChart2, Star, Radio,
  Leaf, Users, Feather, Trees, Crown, PenTool, Bug, Sprout, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Mission Control Universe
const MISSION_TRANSLATIONS = {
  en: {
    heroTag: 'Good Morning, Explorer',
    heroTitle: 'Your Eco Guide',
    heroHighlight: 'Better Tomorrow',
    heroSubtitle1: 'Ask. Learn. Protect.',
    heroSubtitle2: 'Together we create a sustainable future.',
    createMissionBtn: 'Create Custom Mission',
    generateAIBtn: 'Generate Challenge',
    tabPath: 'Mission Path',
    tabActive: 'Active Missions',
    tabCompleted: 'Completed',
    tabCreate: 'Custom Creator',
    catLearning: 'Learning',
    catProductivity: 'Productivity',
    catCreativity: 'Creativity',
    catExploration: 'Exploration',
    catGoals: 'Personal Goals',
    catAI: 'Challenges',
    diffEasy: 'Easy',
    diffMedium: 'Medium',
    diffHard: 'Hard',
    diffExpert: 'Expert',
    startMission: 'Start Mission',
    continueMission: 'Continue Mission',
    completeStep: 'Mark Step Complete',
    missionCompleted: 'Mission Completed!',
    earnedXP: 'XP Earned',
    levelTitle: 'Level 4 Commander',
    xpLabel: 'Eco XP',
    streakLabel: 'Streak',
    aiAssistantHint: 'Need a hint or breakdown for this step?',
    achievementsTitle: 'Ecological Milestone Badges',
    leaderboardTitle: 'Community Eco Leaderboard',
  },
  gu: {
    heroTag: 'શુભ સવાર, એક્સપ્લોરર',
    heroTitle: 'તમારો ઇકો ગાઇડ',
    heroHighlight: 'ઉજ્જવળ ભવિષ્ય માટે',
    heroSubtitle1: 'પૂછો. શીખો. રક્ષણ કરો.',
    heroSubtitle2: 'સાથે મળીને આપણે એક ટકાઉ ભવિષ્ય બનાવીએ છીએ.',
    createMissionBtn: 'કસ્ટમ મિશન બનાવો',
    generateAIBtn: 'પડકાર જનરેટ કરો',
    tabPath: 'મિશન પાથ',
    tabActive: 'સક્રિય મિશનો',
    tabCompleted: 'પૂર્ણ કરેલ',
    tabCreate: 'કસ્ટમ ક્રિએટર',
    catLearning: 'શિક્ષણ',
    catProductivity: 'ઉત્પાદકતા',
    catCreativity: 'સર્જનાત્મકતા',
    catExploration: 'સંશોધન',
    catGoals: 'લક્ષ્યો',
    catAI: 'પડકારો',
    diffEasy: 'સરળ',
    diffMedium: 'મધ્યમ',
    diffHard: 'કઠિન',
    diffExpert: 'નિષ્ણાત',
    startMission: 'મિશન શરૂ કરો',
    continueMission: 'ચાલુ રાખો',
    completeStep: 'પગલું પૂર્ણ માર્ક કરો',
    missionCompleted: 'મિશન પૂર્ણ થયું!',
    earnedXP: 'XP મેળવ્યું',
    levelTitle: 'લેવલ 4 કમાન્ડર',
    xpLabel: 'ઇકો XP',
    streakLabel: 'શ્રેણી',
    aiAssistantHint: 'આ પગલા માટે સંકેત જોઈએ છે?',
    achievementsTitle: 'ઇકોલોજીકલ સિદ્ધિ બેજ',
    leaderboardTitle: 'કમ્યુનિટી લીડરબોર્ડ',
  },
  hi: {
    heroTag: 'शुभ प्रभात, एक्सप्लोरर',
    heroTitle: 'आपका इको गाइड',
    heroHighlight: 'बेहतर कल के लिए',
    heroSubtitle1: 'पूछें। सीखें। रक्षा करें।',
    heroSubtitle2: 'साथ मिलकर हम एक टिकाऊ भविष्य बनाते हैं।',
    createMissionBtn: 'कस्टम मिशन बनाएं',
    generateAIBtn: 'चुनौती बनाएं',
    tabPath: 'मिशन पथ',
    tabActive: 'सक्रिय मिशन',
    tabCompleted: 'पूरा किया गया',
    tabCreate: 'कस्टम क्रिएटर',
    catLearning: 'सीखना',
    catProductivity: 'उत्पादकता',
    catCreativity: 'रचनात्मकता',
    catExploration: 'खोज',
    catGoals: 'व्यक्तिगत लक्ष्य',
    catAI: 'चुनौतियां',
    diffEasy: 'आसान',
    diffMedium: 'मध्यम',
    diffHard: 'कठिन',
    diffExpert: 'विशेषज्ञ',
    startMission: 'मिशन शुरू करें',
    continueMission: 'जारी रखें',
    completeStep: 'चरण पूरा चिह्नित करें',
    missionCompleted: 'मिशन पूरा हुआ!',
    earnedXP: 'XP अर्जित',
    levelTitle: 'लेवल 4 कमांडर',
    xpLabel: 'इको XP',
    streakLabel: 'स्ट्रीक',
    aiAssistantHint: 'इस चरण के लिए संकेत चाहिए?',
    achievementsTitle: 'पारिस्थितिक उपलब्धि बैज',
    leaderboardTitle: 'कम्युनिटी लीडरबोर्ड',
  },
};

export default function NatureMissions() {
  const { session, user } = useAuth();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = MISSION_TRANSLATIONS[lang] || MISSION_TRANSLATIONS.en;
  const token = session?.access_token;

  const toUiMission = (m) => {
    const type = m.mission_type || 'explore';
    const status = m.status || 'not_started';
    const xpReward = type === 'learn' ? 250 : type === 'explore' ? 180 : type === 'act' ? 200 : 100;
    const categoryMap = { observe: 'Exploration', explore: 'Learning', learn: 'Challenges', act: 'Personal Goals' };
    const difficulty = !m.duration_minutes ? 'Medium' : m.duration_minutes <= 10 ? 'Easy' : m.duration_minutes <= 20 ? 'Medium' : 'Hard';
    const steps = Array.isArray(m.steps) && m.steps.length
      ? m.steps
      : [
          { id: `${m._id || m.id}-s1`, text: m.description || m.title, done: status === 'completed' },
          { id: `${m._id || m.id}-s2`, text: m.why_it_matters ? `Reflect: ${m.why_it_matters}` : 'Log your observations in Nature Pulse', done: status === 'completed' },
          { id: `${m._id || m.id}-s3`, text: 'Share your findings with the community', done: status === 'completed' },
        ];
    return {
      id: m._id || m.id,
      title: m.title,
      category: categoryMap[type] || 'Exploration',
      difficulty,
      duration: m.duration_minutes ? `${m.duration_minutes} min` : '15 min',
      xpReward,
      status,
      steps,
      aiHint: m.location_hint || 'Stay observant of micro-climate shifts near foliage.',
    };
  };

  // Persistent States
  const [missions, setMissions] = useState([]);

  const [totalXP, setTotalXP] = useState(0);

  const [streakDays, setStreakDays] = useState(0);
  const [activeTab, setActiveTab] = useState('path');
  const [selectedMission, setSelectedMission] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [missionError, setMissionError] = useState('');

  // Custom Mission Creator State
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Exploration');
  const [customDifficulty, setCustomDifficulty] = useState('Easy');

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch('/api/missions', {}, token),
      apiFetch('/api/streak', {}, token),
    ])
      .then(([list, streakData]) => {
        const ui = Array.isArray(list) ? list.map(toUiMission) : [];
        setMissions(ui);
        setTotalXP(ui.filter((m) => m.status === 'completed').reduce((sum, m) => sum + m.xpReward, 0));
        if (streakData && typeof streakData.streak === 'number') setStreakDays(streakData.streak);
      })
      .catch(() => setMissionError(''));
  }, [token]);

  const pushMissionStatus = (mission) => {
    if (!token || !mission.id || String(mission.id).startsWith('m-')) return;
    apiFetch(`/api/missions/${mission.id}`, { method: 'PATCH', body: JSON.stringify({ status: mission.status }) }, token).catch(() => {
      setMissionError('Your mission progress could not be saved. Please check your connection and try again.');
    });
  };

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
        pushMissionStatus(updatedMission);
        if (selectedMission?.id === missionId) setSelectedMission(updatedMission);
        return updatedMission;
      })
    );
  };

  // Generate AI Mission
  const handleGenerateAIMission = async (e) => {
    e.preventDefault();
    if (!generatePrompt.trim()) return;

    setIsGenerating(true);
    setMissionError('');

    try {
      if (token) {
        await apiFetch(
          '/api/missions',
          { method: 'POST', body: JSON.stringify({ generate: true, count: 1, minutes: 15 }) },
          token
        ).catch(() => null);
      }

      const pText = generatePrompt.trim();
      const newMission = {
        id: `gen-${Date.now()}`,
        title: `Challenge: ${pText}`,
        category: 'Exploration',
        difficulty: '🟢 Easy',
        duration: '15 min',
        xpReward: 150,
        status: 'in_progress',
        description: `Custom generated ecological challenge for "${pText}". Head outside and observe local habitat features.`,
        steps: [
          { id: `${Date.now()}-1`, text: `Locate observation spot for "${pText}"`, done: false },
          { id: `${Date.now()}-2`, text: 'Record 3 distinct sensory observations', done: false },
          { id: `${Date.now()}-3`, text: 'Log your findings in Nature Pulse Journal', done: false },
        ],
      };

      setMissions((prev) => [newMission, ...prev]);
      setSelectedMission(newMission);
      setShowGenerateModal(false);
      setGeneratePrompt('');
    } catch {
      setMissionError('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Create Custom Mission
  const handleCreateCustomMission = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    setMissionError('');

    const typeMap = { Exploration: 'observe', Learning: 'explore', Creativity: 'learn', 'Personal Goals': 'act' };
    const duration = customDifficulty === '🔴 Hard' ? 25 : customDifficulty === '🟡 Medium' ? 15 : 10;
    const xpReward = customDifficulty === '🔴 Hard' ? 250 : customDifficulty === '🟡 Medium' ? 180 : 100;

    const newMission = {
      id: `m-${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      difficulty: customDifficulty,
      duration: `${duration} min`,
      xpReward,
      status: 'in_progress',
      steps: [
        { id: `${Date.now()}-cs1`, text: 'Prepare observation area and tools', done: false },
        { id: `${Date.now()}-cs2`, text: 'Execute main mission objective', done: false },
        { id: `${Date.now()}-cs3`, text: 'Record final reflection note', done: false },
      ],
      aiHint: 'Stay observant of micro-climate shifts near foliage.',
    };

    setMissions([newMission, ...missions]);
    setCustomTitle('');
    setActiveTab('path');
    setSelectedMission(newMission);

    if (token) {
      try {
        const created = await apiFetch(
          '/api/missions',
          {
            method: 'POST',
            body: JSON.stringify({
              title: customTitle.trim(),
              description: customTitle.trim(),
              mission_type: typeMap[customCategory] || 'explore',
              duration_minutes: duration,
              status: 'in_progress',
            }),
          },
          token
        );
        setMissions((prev) => [toUiMission(created), ...prev.filter((m) => m.id !== newMission.id)]);
        setSelectedMission(toUiMission(created));
      } catch (err) {
        setMissionError(err instanceof Error ? err.message : 'Could not create mission.');
      }
    }
  };

  // Delete Mission
  const handleDeleteMission = (missionId) => {
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    if (selectedMission?.id === missionId) setSelectedMission(null);
    if (token && missionId && !String(missionId).startsWith('m-')) {
      apiFetch(`/api/missions/${missionId}`, { method: 'DELETE' }, token).catch(() => {
        setMissionError('The mission could not be deleted. Please check your connection and try again.');
      });
    }
  };

  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const badges = [
    { id: 'b1', name: 'First Steps', icon: Sprout, unlocked: completedCount >= 1, desc: 'Complete your first mission' },
    { id: 'b2', name: 'Canopy Guardian', icon: Leaf, unlocked: completedCount >= 3, desc: 'Complete 3 missions' },
    { id: 'b3', name: 'Pollinator Protector', icon: Bug, unlocked: completedCount >= 5, desc: 'Complete 5 missions' },
    { id: 'b4', name: 'Master Eco Scholar', icon: Crown, unlocked: completedCount >= 10, desc: 'Complete 10 missions' },
  ];
  const impactStats = [
    { rank: 1, name: user?.name || 'You', xp: `${totalXP.toLocaleString()} XP`, streak: `${streakDays} Day${streakDays === 1 ? '' : 's'}`, badge: 'Your Mission Path' },
  ];

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      
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
              className={`rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border transition-colors ${
                isDark ? 'bg-[#112318] border-[#4ADE80]/40 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-sm'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex justify-between items-center border-b pb-3 ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <h3 className={`font-display text-xl font-bold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-[#0F2418]'
                }`}>
                  <Zap className={`w-5 h-5 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                  <span>Generate Challenge</span>
                </h3>
                <button onClick={() => setShowGenerateModal(false)} aria-label="Close" className={`cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
                }`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateAIMission} className="space-y-4">
                {missionError && (
                  <div className="bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500">
                    {missionError}
                  </div>
                )}
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                    isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                  }`}>
                    Challenge Idea or Goal
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    placeholder="e.g., Learn how swallowtail butterflies find urban flowering plants..."
                    className={`w-full rounded-2xl p-3.5 text-xs sm:text-sm outline-none resize-none transition-colors border ${
                      isDark
                        ? 'bg-[#0E2015] border-[#20422E] text-white focus:border-[#4ADE80]'
                        : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`w-full py-3 rounded-full font-bold text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${
                    isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                  }`}
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
        
        {/* ──────────────── HERO BANNER ──────────────── */}
        <div className="relative border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between group">
          
          {/* HD Dark Forest Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80')` }}
          />

          {/* Dark Atmospheric Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040C07] via-[#040C07]/90 to-[#040C07]/40" />

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

          {/* Bottom 4 Integrated Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 relative z-10">
            <div className={`p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${
              isDark ? 'bg-[#0A1A10]/95 border-[#20422E]' : 'bg-[#FDFBF7]/95 border-[#E3DDD1]'
            }`}>
              <div>
                <p className={`text-[10px] uppercase font-semibold ${isDark ? 'text-emerald-400' : 'text-[#183B28]'}`}>{t.xpLabel}</p>
                <p className={`font-display text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{totalXP.toLocaleString()}</p>
              </div>
              <span className="text-lg">🌿</span>
            </div>

            <div className={`p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${
              isDark ? 'bg-[#0A1A10]/95 border-[#20422E]' : 'bg-[#FDFBF7]/95 border-[#E3DDD1]'
            }`}>
              <div>
                <p className={`text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.streakLabel}</p>
                <p className={`font-display text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{streakDays} Days</p>
              </div>
              <span className="text-lg">🔥</span>
            </div>

            <div className={`p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${
              isDark ? 'bg-[#0A1A10]/95 border-[#20422E]' : 'bg-[#FDFBF7]/95 border-[#E3DDD1]'
            }`}>
              <div>
                <p className={`text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{t.Quests || 'Quests'}</p>
                <p className={`font-display text-xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                  {missions.filter((m) => m.status === 'completed').length} / {missions.length}
                </p>
              </div>
              <span className="text-lg">⭐</span>
            </div>

            <div className={`p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${
              isDark ? 'bg-[#0A1A10]/95 border-[#20422E]' : 'bg-[#FDFBF7]/95 border-[#E3DDD1]'
            }`}>
              <div>
                <p className={`text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Rank</p>
                <p className={`font-display text-sm sm:text-base font-extrabold mt-0.5 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>Eco Guardian</p>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${
                isDark ? 'bg-purple-950/80 border-purple-400/50' : 'bg-[#E1EFE0] border-[#C3DEC0]'
              }`}>
                🟣
              </div>
            </div>
          </div>

        </div>

        {/* ──────────────── NAVIGATION TABS ──────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none">
          {[
            { id: 'path', label: t.tabPath, icon: Map },
            { id: 'active', label: t.tabActive, icon: Zap },
            { id: 'completed', label: t.tabCompleted, icon: Trophy },
            { id: 'create', label: t.tabCreate, icon: PenTool },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15'
                      : 'bg-[#183B28] text-[#FAF7F0] shadow-md'
                    : isDark
                      ? 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
                      : 'bg-[#FDFBF7] border border-[#E3DDD1] text-[#0F2418] hover:bg-[#F2ECE1] shadow-xs'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ──────────────── TABS 1, 2, 3: PATH, ACTIVE & COMPLETED ──────────────── */}
        {(activeTab === 'path' || activeTab === 'active' || activeTab === 'completed') && (
          <div className="space-y-8">
            {/* Missions Grid */}
            <div className={`rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden border transition-colors ${
              isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
            }`}>
              <div className="flex justify-between items-center">
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>Ecological Checkpoint Mission Trail</h3>
                <span className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>Tap any Mission to Expand Checklist</span>
              </div>

              {missions.length === 0 && (
                <div className={`border border-dashed rounded-3xl p-10 text-center space-y-3 ${
                  isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                }`}>
                  <p className="text-3xl">🌿</p>
                  <p className={`font-display text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>No missions yet</p>
                  <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                    Generate a challenge from the lightning button, create a custom mission, or finish onboarding to get your first mission set.
                  </p>
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    className={`mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs cursor-pointer ${
                      isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Generate Challenge
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {(activeTab === 'active'
                  ? missions.filter((m) => m.status !== 'completed')
                  : activeTab === 'completed'
                  ? missions.filter((m) => m.status === 'completed')
                  : missions).map((mission) => {
                  const isSelected = selectedMission?.id === mission.id;
                  const completedStepsCount = mission.steps.filter((s) => s.done).length;
                  const progressPct = Math.round((completedStepsCount / mission.steps.length) * 100);
                  const isDone = mission.status === 'completed' || progressPct === 100;

                  return (
                    <motion.div
                      key={mission.id}
                      whileHover={{ scale: 1.04 }}
                      onClick={() => setSelectedMission(mission)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between h-56 ${
                        isSelected
                          ? isDark
                            ? 'bg-[#1A3827] border-[#4ADE80] shadow-[#4ADE80]/30'
                            : 'bg-[#E1EFE0] border-[#183B28] text-[#0F2418] shadow-md ring-1 ring-[#183B28]'
                          : isDone
                          ? isDark
                            ? 'bg-[#0E2015] border-[#4ADE80]/40'
                            : 'bg-[#F2ECE1] border-[#C3DEC0] text-[#0F2418]'
                          : isDark
                            ? 'bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]/50 text-white'
                            : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isDark ? 'bg-[#0E2015] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                          }`}>
                            {mission.difficulty}
                          </span>
                          <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>+{mission.xpReward} XP</span>
                        </div>

                        <h4 className={`font-display text-base font-bold line-clamp-2 mt-1 ${
                          isDark ? 'text-white' : 'text-[#0F2418]'
                        }`}>
                          {mission.title}
                        </h4>
                      </div>

                      <div className={`space-y-2 pt-2 border-t ${
                        isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                      }`}>
                        <div className={`flex justify-between items-center text-[11px] ${
                          isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                        }`}>
                          <span>{completedStepsCount}/{mission.steps.length} Steps</span>
                          <span className={`font-bold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{progressPct}%</span>
                        </div>

                        <div className={`w-full h-2 rounded-full overflow-hidden ${
                          isDark ? 'bg-[#0E2015]' : 'bg-[#EDE6D8]'
                        }`}>
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ──────────────── UNLOCKABLE ACHIEVEMENT MILESTONES ──────────────── */}
            <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
              isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
            }`}>
              <div className={`flex justify-between items-center border-b pb-4 ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <div>
                  <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.achievementsTitle}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Complete missions to unlock regional badges</p>
                </div>
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((badge) => {
                  const IconComponent = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                        badge.unlocked
                          ? isDark ? 'bg-[#13271C] border-[#4ADE80]/50 text-white' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#0F2418]'
                          : isDark ? 'bg-[#07150C] border-[#20422E] opacity-60 text-slate-400' : 'bg-[#F2ECE1] border-[#E0D8C8] opacity-60 text-[#3E5C48]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#1A3827] border-[#4ADE80]/40 text-[#4ADE80]' : 'bg-[#FDFBF7] border-[#C3DEC0] text-[#183B28]'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{badge.name}</h4>
                        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ──────────────── ECO IMPACT LEADERBOARD ──────────────── */}
            <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
              isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
            }`}>
              <div className={`flex justify-between items-center border-b pb-4 ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <div>
                  <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.leaderboardTitle}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Your mission path progress this week</p>
                </div>
                <Users className={`w-6 h-6 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
              </div>

              <div className="space-y-3">
                {impactStats.map((user) => (
                  <div
                    key={user.rank}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      user.rank === 2
                        ? isDark ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-md' : 'bg-[#E1EFE0] border-[#183B28] text-[#0F2418]'
                        : isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                        user.rank === 1 ? 'bg-amber-400 text-black' : user.rank === 2 ? 'bg-[#4ADE80] text-black' : isDark ? 'bg-[#0E2015] text-slate-400' : 'bg-[#EDE6D8] text-[#0F2418]'
                      }`}>
                        #{user.rank}
                      </span>
                      <div>
                        <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{user.name}</h4>
                        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{user.badge}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{user.xp}</span>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{user.streak}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 4: CUSTOM CREATOR ──────────────── */}
        {activeTab === 'create' && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>Create Custom Mission Objective</h3>

            <form onSubmit={handleCreateCustomMission} className="space-y-4">
              {missionError && (
                <div className="bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500">
                  {missionError}
                </div>
              )}
              <div>
                <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                  isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                }`}>Mission Title</label>
                <input
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Document 3 native tree shade canopies in your neighborhood..."
                  className={`w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors border ${
                    isDark
                      ? 'bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]'
                      : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                    isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                  }`}>Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className={`w-full text-xs rounded-2xl px-4 py-3 outline-none border transition-colors ${
                      isDark
                        ? 'bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]'
                        : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                    }`}
                  >
                    <option value="Exploration">Exploration</option>
                    <option value="Learning">Learning</option>
                    <option value="Creativity">Creativity</option>
                    <option value="Personal Goals">Personal Goals</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                    isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                  }`}>Difficulty</label>
                  <select
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value)}
                    className={`w-full text-xs rounded-2xl px-4 py-3 outline-none border transition-colors ${
                      isDark
                        ? 'bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]'
                        : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                    }`}
                  >
                    <option value="Easy">Easy (100 XP)</option>
                    <option value="Medium">Medium (180 XP)</option>
                    <option value="Hard">Hard (250 XP)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl cursor-pointer ${
                  isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                }`}
              >
                Create &amp; Add Mission
              </button>
            </form>
          </div>
        )}

        {/* ──────────────── SELECTED MISSION DRAWER ──────────────── */}
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border transition-colors ${
              isDark ? 'bg-[#112318] border-[#4ADE80]/50' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-xl'
            }`}
          >
            <div className={`flex justify-between items-start border-b pb-4 ${
              isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isDark ? 'bg-[#1A3827] text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28]'
                  }`}>
                    {selectedMission.category}
                  </span>
                  <span className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>+{selectedMission.xpReward} XP Reward</span>
                </div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{selectedMission.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteMission(selectedMission.id)}
                  className="p-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 cursor-pointer"
                  title="Delete Mission"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedMission(null)} aria-label="Close" className={`cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
                }`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-xs uppercase tracking-wider font-bold ${
                isDark ? 'text-slate-400' : 'text-[#3E5C48]'
              }`}>Action Steps &amp; Checklist</p>

              {selectedMission.steps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => toggleStep(selectedMission.id, step.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    step.done
                      ? isDark
                        ? 'bg-[#1A3827] border-[#4ADE80] text-slate-200'
                        : 'bg-[#E1EFE0] border-[#183B28] text-[#0F2418]'
                      : isDark
                        ? 'bg-[#0E2015] border-[#20422E] text-white hover:border-[#4ADE80]/40'
                        : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:border-[#183B28]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                      step.done
                        ? isDark ? 'bg-[#4ADE80] border-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] border-[#183B28] text-[#FAF7F0]'
                        : isDark ? 'border-slate-500' : 'border-[#D4CBB8]'
                    }`}>
                      {step.done && '✓'}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium ${step.done ? 'line-through opacity-75' : ''}`}>
                      {step.text}
                    </span>
                  </div>

                  <span className={`text-[11px] font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{step.done ? 'Done' : 'Tap to complete'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
