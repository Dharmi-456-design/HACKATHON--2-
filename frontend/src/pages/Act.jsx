import { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Check, RefreshCw, Clock, Leaf, Shield, Flame, Globe, 
  Droplets, Bird, Compass, Heart, Share2, Award, Zap, ArrowRight, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Act Page
const ACT_TRANSLATIONS = {
  en: {
    heroTag: 'ENVIRONMENTAL ACTION ENGINE',
    heroTitle: 'Do What Fits Your Time',
    heroSubtitle: 'Modest, local, high-impact actions. Scale suggestions to your window — two minutes to sixty minutes.',
    sliderLabel: 'Available Time Window',
    minutesSuffix: 'Minutes',
    generateBtn: '✨ Generate Eco Actions',
    tabSuggested: '🌱 Suggested Actions',
    tabCompleted: '🏆 Field Actions Log',
    completeActionBtn: '✓ I Did This Action',
    completedBadge: 'Completed & Logged ✓',
    impactTotal: 'Total Impact Contributed',
    actionsDoneCount: 'Eco Actions Done',
    minutesContributed: 'Minutes Given to Nature',
  },
  gu: {
    heroTag: 'પર્યાવરણીય ક્રિયા એન્જિન',
    heroTitle: 'તમારા સમય અનુસાર કાર્ય કરો',
    heroSubtitle: 'સ્થાનિક અને ઉચ્ચ-અસરકારક પર્યાવરણીય કાર્યો. ૨ મિનિટથી ૬૦ મિનિટના ગાળામાં સૂચનો મેળવો.',
    sliderLabel: 'ઉપલબ્ધ સમય ગાળો',
    minutesSuffix: 'મિનિટ',
    generateBtn: '✨ ક્રિયાઓ જનરેટ કરો',
    tabSuggested: '🌱 સૂચવેલ ક્રિયાઓ',
    tabCompleted: '🏆 પૂર્ણ કરેલ કાર્યો',
    completeActionBtn: '✓ મેં આ કાર્ય પૂર્ણ કર્યું',
    completedBadge: 'પૂર્ણ કર્યું ✓',
    impactTotal: 'કુલ યોગદાન અસર',
    actionsDoneCount: 'પૂર્ણ કરેલ કાર્યો',
    minutesContributed: 'પ્રકૃતિને આપેલી મિનિટો',
  },
  hi: {
    heroTag: 'पर्यावरण कार्रवाई इंजन',
    heroTitle: 'अपने समय के अनुसार कार्य करें',
    heroSubtitle: 'स्थानीय और उच्च-प्रभाव वाले पर्यावरणीय कार्य। 2 मिनट से 60 मिनट की अवधि में सुझाव प्राप्त करें।',
    sliderLabel: 'उपलब्ध समय सीमा',
    minutesSuffix: 'मिनट',
    generateBtn: '✨ कार्रवाइयां उत्पन्न करें',
    tabSuggested: '🌱 सुझाए गए कार्य',
    tabCompleted: '🏆 पूर्ण किए गए कार्य',
    completeActionBtn: '✓ मैंने यह कार्य पूरा किया',
    completedBadge: 'पूर्ण किया गया ✓',
    impactTotal: 'कुल योगदान प्रभाव',
    actionsDoneCount: 'पूरे किए गए कार्य',
    minutesContributed: 'प्रकृति को दिए गए मिनट',
  },
};

// Seed HD Nature Actions with High-Quality Unsplash Imagery
const SEED_ACTIONS = [
  {
    id: 'act-1',
    title: 'Install Bird Water Dish in Canopy Shade',
    category: 'Wildlife',
    minutes: 15,
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80',
    description: 'Place a shallow clay water dish in garden shade to aid urban birds and pollinators.',
    impactNote: 'Saves up to 12 birds daily from heat dehydration in summer.',
  },
  {
    id: 'act-2',
    title: 'Plant Native Wildflower Seeds',
    category: 'Habitat',
    minutes: 30,
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80',
    description: 'Scatter indigenous wildflower seeds in moist soil patches to support swallowtail butterflies.',
    impactNote: 'Restores 4 sq meters of urban micro-pollinator corridor.',
  },
  {
    id: 'act-3',
    title: 'Leave Leaf Pile for Hibernating Insects',
    category: 'Soil',
    minutes: 10,
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'Gather dry banyan leaves in a damp shaded garden corner for soil organisms.',
    impactNote: 'Protects soil biodiversity and increases humic organic content.',
  },
  {
    id: 'act-4',
    title: 'Inspect Tree Root Dampness & Mulch',
    category: 'Canopy',
    minutes: 20,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    description: 'Cover exposed tree roots with organic bark mulch to prevent soil evaporation.',
    impactNote: 'Reduces soil water loss by 40% under direct sun.',
  },
];

export default function Act() {
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = ACT_TRANSLATIONS[lang] || ACT_TRANSLATIONS.en;

  // Persistent States
  const [actions, setActions] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_act_actions_v1');
      return saved ? JSON.parse(saved) : SEED_ACTIONS;
    } catch {
      return SEED_ACTIONS;
    }
  });

  const [minutes, setMinutes] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [activeTab, setActiveTab] = useState('suggested'); // suggested, completed

  useEffect(() => {
    localStorage.setItem('pulse_act_actions_v1', JSON.stringify(actions));
  }, [actions]);

  // Complete Action
  const completeAction = (id) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'completed' } : a))
    );
  };

  // Generate New Actions
  const handleGenerateActions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newAction = {
        id: `act-${Date.now()}`,
        title: `Explore ${minutes}-Min Eco Observation`,
        category: 'Habitat',
        minutes: minutes,
        status: 'pending',
        image: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=800&q=80',
        description: `Dedicated ${minutes} minutes of field observation to document local shade canopy patterns.`,
        impactNote: 'Helps map urban biodiversity corridors.',
      };
      setActions([newAction, ...actions]);
      setIsGenerating(false);
    }, 1000);
  };

  const pendingActions = actions.filter((a) => a.status !== 'completed');
  const completedActions = actions.filter((a) => a.status === 'completed');
  const totalMinutesGiven = completedActions.reduce((acc, b) => acc + b.minutes, 0);

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── HERO BANNER ──────────────── */}
        <div className="relative bg-gradient-to-r from-[#0E2316] via-[#112D1B] to-[#0A1A10] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold uppercase tracking-widest">
                <Leaf className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
                {t.heroTag}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#13271C] border border-[#20422E] px-5 py-3 rounded-2xl">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">{t.actionsDoneCount}</p>
                <p className="font-display text-2xl font-extrabold text-[#4ADE80]">{completedActions.length}</p>
              </div>
              <div className="h-8 w-px bg-[#20422E]" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">{t.minutesContributed}</p>
                <p className="font-display text-2xl font-extrabold text-amber-400">{totalMinutesGiven} Min</p>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────── TIME SLIDER CONTROL CARD ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#4ADE80] uppercase tracking-wider">{t.sliderLabel}</p>
              <h3 className="font-display text-3xl font-extrabold text-white mt-1">
                {minutes} {t.minutesSuffix}
              </h3>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateActions}
              disabled={isGenerating}
              className="px-6 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Composing…' : t.generateBtn}</span>
            </motion.button>
          </div>

          <input
            type="range"
            min={2}
            max={60}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full accent-[#4ADE80] h-2 bg-[#13271C] rounded-lg cursor-pointer"
          />
        </div>

        {/* ──────────────── NAVIGATION TABS ──────────────── */}
        <div className="flex items-center gap-2 border-b border-[#20452F] pb-3">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'suggested'
                ? 'bg-[#4ADE80] text-[#07130B]'
                : 'bg-[#13271C] text-slate-300 hover:text-white'
            }`}
          >
            {t.tabSuggested} ({pendingActions.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#4ADE80] text-[#07130B]'
                : 'bg-[#13271C] text-slate-300 hover:text-white'
            }`}
          >
            {t.tabCompleted} ({completedActions.length})
          </button>
        </div>

        {/* ──────────────── ACTION CARDS GRID WITH REAL HD IMAGES & 3D FLIP ──────────────── */}
        {activeTab === 'suggested' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingActions.map((action) => {
              const isFlipped = flippedCardId === action.id;
              return (
                <div
                  key={action.id}
                  className="perspective-1000 h-96 cursor-pointer"
                  onMouseEnter={() => setFlippedCardId(action.id)}
                  onMouseLeave={() => setFlippedCardId(null)}
                >
                  <motion.div
                    className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                  >
                    {/* FRONT ACTION CARD */}
                    <div className="absolute inset-0 backface-hidden bg-[#0E2015] border border-[#20452F] rounded-3xl overflow-hidden flex flex-col justify-between">
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={action.image}
                          alt={action.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#07130B]/80 backdrop-blur-md text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/40">
                            {action.category}
                          </span>
                        </div>
                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#07130B]/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/40">
                          ⏱️ {action.minutes} min
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-display text-lg font-bold text-white leading-tight">
                            {action.title}
                          </h3>
                          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                            {action.description}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            completeAction(action.id);
                          }}
                          className="w-full py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{t.completeActionBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* BACK ACTION CARD */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#112318] border border-[#4ADE80]/50 rounded-3xl p-6 flex flex-col justify-between text-slate-200">
                      <div className="space-y-3">
                        <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80]">
                          Eco Impact Analysis
                        </span>
                        <h4 className="font-display text-base font-bold text-white">{action.title}</h4>
                        <p className="text-xs text-slate-300 italic leading-relaxed">
                          "{action.impactNote}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#20422E] flex justify-between items-center text-[10px] text-slate-400">
                        <span>Real Field Action</span>
                        <span className="text-[#4ADE80] font-bold">Nature Connection +15</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}

        {/* COMPLETED ACTIONS TAB */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedActions.map((action) => (
              <div
                key={action.id}
                className="bg-[#0E2015] border border-[#4ADE80]/40 p-5 rounded-2xl flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-4">
                  <img src={action.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-display text-base font-bold text-white">{action.title}</h4>
                    <p className="text-xs text-slate-400">{action.category} · {action.minutes} minutes</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80] border border-[#4ADE80]/30">
                  {t.completedBadge}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
