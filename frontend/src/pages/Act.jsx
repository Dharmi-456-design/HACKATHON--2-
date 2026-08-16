import { useState, useEffect } from 'react';
import { 
  Sparkles, Check, RefreshCw, Clock, Leaf, Shield, Flame, Globe, 
  Droplets, Bird, Compass, Heart, Share2, Award, Zap, ArrowRight, Sun, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Act Page
const ACT_TRANSLATIONS = {
  en: {
    heroTag: 'ENVIRONMENTAL ACTION ENGINE',
    heroTitle: 'Do What Fits',
    heroHighlight: 'Your Time 🍃',
    heroSubtitle: 'Modest, local, high-impact actions. Scale suggestions to your window — two minutes to sixty minutes.',
    sliderLabel: 'AVAILABLE TIME WINDOW',
    minutesSuffix: 'Minutes',
    generateBtnTitle: 'Generate Eco Actions',
    generateBtnSub: 'Get personalized actions',
    tabSuggested: 'Suggested Actions',
    tabCompleted: 'Field Actions Log',
    completeActionBtn: '✓ I Did This Action',
    completedBadge: 'Completed & Logged ✓',
    impactTotal: 'Total Impact Contributed',
    actionsDoneCount: 'ECO ACTIONS DONE',
    minutesContributed: 'MINUTES GIVEN TO NATURE',
  },
  gu: {
    heroTag: 'પર્યાવરણીય ક્રિયા એન્જિન',
    heroTitle: 'તમારા સમય અનુસાર',
    heroHighlight: 'કાર્ય કરો 🍃',
    heroSubtitle: 'સ્થાનિક અને ઉચ્ચ-અસરકારક પર્યાવરણીય કાર્યો. ૨ મિનિટથી ૬૦ મિનિટના ગાળામાં સૂચનો મેળવો.',
    sliderLabel: 'ઉપલબ્ધ સમય ગાળો',
    minutesSuffix: 'મિનિટ',
    generateBtnTitle: 'ઇકો ક્રિયાઓ જનરેટ કરો',
    generateBtnSub: 'વ્યક્તિગત સૂચનો મેળવો',
    tabSuggested: 'સૂચવેલ ક્રિયાઓ',
    tabCompleted: 'પૂર્ણ કરેલ કાર્યો',
    completeActionBtn: '✓ મેં આ કાર્ય પૂર્ણ કર્યું',
    completedBadge: 'પૂર્ણ કર્યું ✓',
    impactTotal: 'કુલ યોગદાન અસર',
    actionsDoneCount: 'પૂર્ણ કરેલ કાર્યો',
    minutesContributed: 'પ્રકૃતિને આપેલી મિનિટો',
  },
  hi: {
    heroTag: 'पर्यावरण कार्रवाई इंजन',
    heroTitle: 'अपने समय के अनुसार',
    heroHighlight: 'कार्य करें 🍃',
    heroSubtitle: 'स्थानीय और उच्च-प्रभाव वाले पर्यावरणीय कार्य। 2 मिनट से 60 मिनट की अवधि में सुझाव प्राप्त करें।',
    sliderLabel: 'उपलब्ध समय सीमा',
    minutesSuffix: 'मिनट',
    generateBtnTitle: 'इको कार्रवाइयां उत्पन्न करें',
    generateBtnSub: 'व्यक्तिगत सुझाव प्राप्त करें',
    tabSuggested: 'सुझाए गए कार्य',
    tabCompleted: 'पूर्ण किए गए कार्य',
    completeActionBtn: '✓ मैंने यह कार्य पूरा किया',
    completedBadge: 'पूर्ण किया गया ✓',
    impactTotal: 'कुल योगदान प्रभाव',
    actionsDoneCount: 'पूरे किए गए कार्य',
    minutesContributed: 'प्रकृति को दिए गए मिनट',
  },
};

// Seed HD Nature Actions
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
    image: 'https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=800&q=80',
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
  const [activeTab, setActiveTab] = useState('suggested');

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
        
        {/* ──────────────── LUSH MEDIUM LIGHT-GREEN SUNLIT FOREST CANOPY BACKGROUND (NO BROWN TONES!) COVERING ALL TOP + SLIDER ──────────────── */}
        <div className="relative pt-6 pb-8 space-y-8">
          
          {/* Vibrant Medium Light-Green Sunlit Forest Canopy Backdrop */}
          <div 
            className="absolute -top-12 -left-12 -right-12 bottom-0 bg-cover bg-center pointer-events-none opacity-85"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1600&q=80')`,
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)'
            }}
          />

          {/* Emerald Gradient Blend Overlay */}
          <div className="absolute -top-12 -left-12 -right-12 bottom-0 bg-gradient-to-b from-[#040C07]/75 via-[#040C07]/80 to-[#040B06] pointer-events-none" />

          {/* Top Hero Row */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left Text Content */}
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4ADE80] bg-[#0E2015]/90 px-3.5 py-1 rounded-full border border-[#4ADE80]/40 backdrop-blur-md">
                <Leaf className="w-3.5 h-3.5" />
                {t.heroTag}
              </span>

              <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {t.heroTitle} <br />
                <span className="text-white">{t.heroHighlight.split(' ')[0]} </span>
                <span className="text-[#4ADE80]">{t.heroHighlight.split(' ')[1]}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-md drop-shadow">
                {t.heroSubtitle}
              </p>
            </div>

            {/* Right Side Speedometer Clock HUD */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0 z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full border border-emerald-500/40 flex items-center justify-center"
              >
                <div className="absolute top-1 w-1 h-3 bg-[#4ADE80]" />
                <div className="absolute bottom-1 w-1 h-3 bg-[#4ADE80]/40" />
                <div className="absolute left-1 w-3 h-1 bg-[#4ADE80]/40" />
                <div className="absolute right-1 w-3 h-1 bg-[#4ADE80]/40" />
                <div className="absolute top-6 right-8 w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-[0_0_12px_#4ADE80]" />
              </motion.div>

              <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-[#0E2015]/95 border border-[#4ADE80]/40 flex flex-col items-center justify-center text-center p-4 shadow-2xl backdrop-blur-md z-10 space-y-2">
                <Leaf className="w-5 h-5 text-[#4ADE80]" />
                
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{t.actionsDoneCount}</p>
                  <p className="font-display text-3xl font-black text-white">{completedActions.length}</p>
                </div>

                <div className="w-12 h-px bg-[#20422E]" />

                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{t.minutesContributed}</p>
                  <p className="font-display text-2xl font-black text-white">{totalMinutesGiven} <span className="text-xs font-normal text-slate-400">MIN</span></p>
                </div>
              </div>

              <img
                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80"
                alt=""
                className="absolute right-0 bottom-0 w-36 h-36 object-cover opacity-75 mix-blend-screen pointer-events-none filter drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]"
              />
            </div>

          </div>

          {/* ──────────────── WAVY NEON GREEN ENERGY SLIDER STRIP (SEAMLESS INTEGRATED OVER BACKGROUND) ──────────────── */}
          <div className="relative z-10 pt-4 border-t border-[#20452F]/60 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t.sliderLabel}</p>
                <h3 className="font-display text-4xl sm:text-5xl font-black text-white mt-1">
                  {minutes} <span className="text-[#4ADE80] font-normal text-2xl sm:text-3xl">{t.minutesSuffix}</span>
                </h3>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateActions}
                disabled={isGenerating}
                className="flex items-center gap-3 bg-transparent cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#13271C]/90 border border-[#4ADE80]/50 flex items-center justify-center text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-black transition-all shadow-lg backdrop-blur-md">
                  <RefreshCw className={`w-6 h-6 ${isGenerating ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm text-white group-hover:text-[#4ADE80] transition-colors">{t.generateBtnTitle}</p>
                  <p className="text-[11px] text-slate-400">{t.generateBtnSub}</p>
                </div>
              </motion.button>
            </div>

            <div className="relative w-full py-4">
              <svg viewBox="0 0 800 30" className="w-full h-8 overflow-visible pointer-events-none">
                <path
                  d="M 0 15 Q 200 25, 400 15 T 800 15"
                  fill="none"
                  stroke="#20422E"
                  strokeWidth="3"
                />
                <path
                  d={`M 0 15 Q 200 25, ${minutes * 13} 15`}
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth="3"
                  className="filter drop-shadow-[0_0_8px_#4ADE80]"
                />
              </svg>

              <input
                type="range"
                min={2}
                max={60}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-8"
              />

              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#4ADE80] border-4 border-[#040B06] shadow-[0_0_15px_#4ADE80] pointer-events-none transition-all"
                style={{ left: `calc(${(minutes / 60) * 95}% + 10px)` }}
              />
            </div>
          </div>

        </div>

        {/* ──────────────── UNDERLINE TAB NAVIGATION ──────────────── */}
        <div className="flex items-center gap-8 border-b border-[#20452F] pb-4 relative z-10">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`flex items-center gap-2 text-sm font-bold transition-all relative pb-2 cursor-pointer ${
              activeTab === 'suggested' ? 'text-[#4ADE80]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>{t.tabSuggested} ({pendingActions.length})</span>
            {activeTab === 'suggested' && (
              <motion.div layoutId="actTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4ADE80]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 text-sm font-bold transition-all relative pb-2 cursor-pointer ${
              activeTab === 'completed' ? 'text-[#4ADE80]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.tabCompleted} ({completedActions.length})</span>
            {activeTab === 'completed' && (
              <motion.div layoutId="actTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4ADE80]" />
            )}
          </button>
        </div>

        {/* ──────────────── ACTION CARDS GRID WITH REAL HD IMAGES & 3D FLIP ──────────────── */}
        {activeTab === 'suggested' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
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
          <div className="space-y-4 relative z-10">
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

        {/* ──────────────── BIOLUMINESCENT WAVY ENERGY RIBBON DIVIDER WITH FIREFLY PARTICLES ──────────────── */}
        <div className="relative py-12 overflow-hidden pointer-events-none z-10">
          <div className="relative w-full h-16 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.3, 0.9, 0.3], x: [-20, 20, -20] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/4 top-2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6EE7B7]"
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], x: [15, -15, 15] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute left-1/2 top-8 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_14px_#FCD34D]"
            />
            <motion.div
              animate={{ opacity: [0.2, 0.8, 0.2], x: [-10, 10, -10] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute right-1/4 top-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34D399]"
            />

            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full opacity-80">
              <path
                d="M 0 60 Q 300 10, 600 70 T 1200 40"
                fill="none"
                stroke="url(#waveGrad1)"
                strokeWidth="3"
                className="filter drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]"
              />
              <path
                d="M 0 40 Q 300 90, 600 30 T 1200 80"
                fill="none"
                stroke="url(#waveGrad2)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.7"
              />
              <defs>
                <linearGradient id="waveGrad1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#040B06" stopOpacity="0" />
                  <stop offset="30%" stopColor="#4ADE80" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#22C55E" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#040B06" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="waveGrad2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#040B06" stopOpacity="0" />
                  <stop offset="40%" stopColor="#A7F3D0" stopOpacity="0.7" />
                  <stop offset="80%" stopColor="#4ADE80" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#040B06" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
