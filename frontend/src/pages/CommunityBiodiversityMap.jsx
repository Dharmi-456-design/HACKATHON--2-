import { useState, useEffect } from 'react';
import { 
  Sparkles, User, Brain, Target, Compass, Plus, Trash2, Edit3, X, 
  HelpCircle, Eye, EyeOff, Search, ZoomIn, ZoomOut, RotateCcw, Check, 
  Globe, Shield, BookOpen, Layers, ArrowRight, Lightbulb, Zap, Info, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Community Bio Map
const COMMUNITY_MAP_TRANSLATIONS = {
  en: {
    heroTag: 'COMMUNITY BIODIVERSITY NEURAL MAP',
    heroTitle: 'Shared Ecological Constellation',
    heroSubtitle: 'Discover anonymous city-level observations, species networks, and urban nature spots across your community.',
    searchPlaceholder: 'Search species, locations, observations…',
    filterAll: 'All Species Categories',
    catBirds: '🐦 Birds',
    catTrees: '🌳 Trees',
    catFlowers: '🌸 Flowers',
    catInsects: '🦋 Insects',
    catFungi: '🍄 Fungi',
    catMoss: '🌿 Moss',
    observationDetail: 'Observation Detail',
    verifiedAnonymous: 'Verified City-Level Observation · Privacy Safe',
    close: 'Close',
  },
  gu: {
    heroTag: 'કમ્યુનિટી બાયોડાઇવર્સિટી ન્યુરલ મેપ',
    heroTitle: 'સહિયારું ઇકોલોજીકલ નક્ષત્ર',
    heroSubtitle: 'તમારા સમુદાયના અનામી શહેર-સ્તરના અવલોકનો, પ્રજાતિ નેટવર્ક અને પ્રકૃતિના સ્થળો શોધો.',
    searchPlaceholder: 'પ્રજાતિઓ, સ્થળો, અવલોકનો શોધો…',
    filterAll: 'બધી પ્રજાતિઓ',
    catBirds: '🐦 પક્ષીઓ',
    catTrees: '🌳 વૃક્ષો',
    catFlowers: '🌸 ફૂલો',
    catInsects: '🦋 જંતુઓ',
    catFungi: '🍄 ફૂગ',
    catMoss: '🌿 શેવાળ',
    observationDetail: 'અવલોકન વિગત',
    verifiedAnonymous: 'ચકાસાયેલ શહેર-સ્તરનું અવલોકન',
    close: 'બંધ કરો',
  },
  hi: {
    heroTag: 'कम्युनिटी बायोडायवर्सिटी न्यूरल मैप',
    heroTitle: 'साझा पारिस्थितिक नक्षत्र',
    heroSubtitle: 'अपने समुदाय के शहर-स्तरीय अवलोकनों, प्रजातियों के नेटवर्क और प्रकृति के स्थानों की खोज करें।',
    searchPlaceholder: 'प्रजातियां, स्थान, अवलोकन खोजें…',
    filterAll: 'सभी प्रजातियां',
    catBirds: '🐦 पक्षी',
    catTrees: '🌳 पेड़',
    catFlowers: '🌸 फूल',
    catInsects: '🦋 कीड़े',
    catFungi: '🍄 कवक',
    catMoss: '🌿 काई',
    observationDetail: 'अवलोकन विवरण',
    verifiedAnonymous: 'सत्यापित शहर-स्तरीय अवलोकन',
    close: 'बंद करें',
  },
};

// Seed Community Pins
const SEED_PINS = [
  { id: 'pin-1', name: 'Indian Myna Foraging', category: 'birds', city: 'Ahmedabad', x: 260, y: 150, confidence: '98% High', emoji: '🐦', note: 'Spotted in dawn canopy near Banyan roots.' },
  { id: 'pin-2', name: 'Ancient Banyan Canopy', category: 'trees', city: 'Ahmedabad', x: 420, y: 120, confidence: '99% High', emoji: '🌳', note: 'Old growth canopy providing micro-climate shade.' },
  { id: 'pin-3', name: 'Champa Flower Bloom', category: 'flowers', city: 'Surat', x: 180, y: 240, confidence: '95% High', emoji: '🌸', note: 'Fragrant morning blossoms visited by swallowtails.' },
  { id: 'pin-4', name: 'Monarch Butterfly', category: 'insects', city: 'Vadodara', x: 480, y: 280, confidence: '94% High', emoji: '🦋', note: 'Feeding on wild nectar near garden pond.' },
  { id: 'pin-5', name: 'Bioluminescent Fungi Spores', category: 'fungi', city: 'Portland', x: 310, y: 350, confidence: '96% High', emoji: '🍄', note: 'Subterranean fungal damp root growth.' },
  { id: 'pin-6', name: 'Cedar Tree Bark Moss', category: 'moss', city: 'Delhi', x: 200, y: 360, confidence: '97% High', emoji: '🌿', note: 'Moisture absorbing micro-ecosystem sponge.' },
];

export default function CommunityBiodiversityMap() {
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = COMMUNITY_MAP_TRANSLATIONS[lang] || COMMUNITY_MAP_TRANSLATIONS.en;

  const [pins, setPins] = useState(SEED_PINS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filtered Pins
  const filteredPins = pins.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchName && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── HERO BANNER ──────────────── */}
        <div className="relative bg-gradient-to-r from-[#0E2316] via-[#112D1B] to-[#0A1A10] border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold uppercase tracking-widest">
                <Radio className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
                {t.heroTag}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#13271C] border border-[#20422E] px-4 py-2.5 rounded-2xl text-xs font-semibold text-[#4ADE80]">
              <span>🛡️ {t.verifiedAnonymous}</span>
            </div>
          </div>
        </div>

        {/* ──────────────── SEARCH & FILTER BAR ──────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-[#12241A] border border-[#234A33] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#4ADE80]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.4))}
                className="p-3 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
                className="p-3 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              t.filterAll,
              t.catBirds,
              t.catTrees,
              t.catFlowers,
              t.catInsects,
              t.catFungi,
              t.catMoss,
            ].map((catLabel, idx) => {
              const val = idx === 0 ? 'All' : ['birds', 'trees', 'flowers', 'insects', 'fungi', 'moss'][idx - 1];
              return (
                <button
                  key={catLabel}
                  onClick={() => setSelectedCategory(val)}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === val
                      ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                      : 'bg-[#0E2015]/60 border-[#20422E] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────────────── INTERACTIVE COMMUNITY MAP CANVAS ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[480px]">
          <div
            className="relative w-full h-[460px] transition-transform duration-300 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* SVG Connecting Web */}
            <svg viewBox="0 0 700 460" className="absolute inset-0 w-full h-full pointer-events-none">
              {filteredPins.map((p) => (
                <g key={p.id}>
                  <line
                    x1={350}
                    y1={230}
                    x2={p.x}
                    y2={p.y}
                    stroke={selectedPin?.id === p.id ? '#4ADE80' : '#20422E'}
                    strokeWidth={selectedPin?.id === p.id ? '2.5' : '1.2'}
                    strokeDasharray={selectedPin?.id === p.id ? 'none' : '4'}
                  />
                </g>
              ))}
            </svg>

            {/* Central City Hub Node */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#2E6141] via-[#1A3827] to-[#040B06] border-2 border-[#4ADE80] flex flex-col items-center justify-center text-center shadow-2xl z-20 cursor-pointer"
              onClick={() => setSelectedPin(null)}
            >
              <Globe className="w-6 h-6 text-[#4ADE80]" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">HUB</span>
            </motion.div>

            {/* Floating Species Nodes */}
            {filteredPins.map((p) => {
              const isSelected = selectedPin?.id === p.id;
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPin(p)}
                  style={{ left: p.x, top: p.y }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl border transition-all cursor-pointer shadow-lg z-20 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-[#4ADE80]/30 scale-110'
                      : 'bg-[#13271C]/90 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/50'
                  }`}
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="text-xs font-bold whitespace-nowrap">{p.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ──────────────── SELECTED PIN DETAIL DRAWER ──────────────── */}
        {selectedPin && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#112318] border border-[#4ADE80]/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-start border-b border-[#20452F] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedPin.emoji}</span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{selectedPin.name}</h3>
                  <p className="text-xs text-[#4ADE80] font-semibold">{selectedPin.city} · {selectedPin.confidence}</p>
                </div>
              </div>

              <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              "{selectedPin.note}"
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
