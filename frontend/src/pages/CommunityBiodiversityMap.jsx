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
import { isDemoMode } from '../utils/demoMode';

// Multilingual UI Translations for Community Bio Map
const COMMUNITY_MAP_TRANSLATIONS = {
  en: {
    heroTag: 'COMMUNITY BIODIVERSITY NETWORK',
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
    heroTag: 'કમ્યુનિટી બાયોડાઇવર્સિટી નેટવર્ક',
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
    heroTag: 'कम्युनिटी बायोडायवर्सिटी नेटवर्क',
    heroTitle: 'साझा पारिस्थितिक नक्षत्र',
    heroSubtitle: 'अपने समुदाय के शहर-स्तरीय अवलोकनों, प्रजातियों के नेटवर्क और प्रकृति के स्थानों की खोज करें।',
    searchPlaceholder: 'प्रजातियां, स्थान, अवलोकन खोजें…',
    filterAll: 'सभी प्रजातियां',
    catBirds: 'किस चिड़िया',
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
  const demoMode = isDemoMode();

  const categoryToKey = (cat) => {
    const c = String(cat || '').toLowerCase();
    if (c.includes('bird')) return 'birds';
    if (c.includes('tree')) return 'trees';
    if (c.includes('plant') || c.includes('flower')) return 'flowers';
    if (c.includes('insect') || c.includes('butterfly') || c.includes('moth')) return 'insects';
    if (c.includes('fung')) return 'fungi';
    if (c.includes('moss') || c.includes('lichen')) return 'moss';
    return 'other';
  };
  const catEmoji = { birds: '🐦', trees: '🌳', flowers: '🌸', insects: '🦋', fungi: '🍄', moss: '🌿', other: '🌱' };
  const catLabel = { birds: 'Birds', trees: 'Trees', flowers: 'Flowers', insects: 'Insects', fungi: 'Fungi', moss: 'Moss', other: 'Other' };

  const toPin = (p, i) => {
    const cat = categoryToKey(p.category || p.common_name);
    const angle = i * 2.4;
    const ring = 55 + (i % 5) * 52;
    return {
      id: p._id || `pin-${i}`,
      name: p.common_name || 'Community observation',
      category: cat,
      city: p.city || 'Shared Field',
      x: Math.round(350 + Math.cos(angle) * ring),
      y: Math.round(230 + Math.sin(angle) * ring * 0.9),
      confidence: p.confidence_pct ? `${p.confidence_pct}% High` : 'Community Verified',
      emoji: catEmoji[cat],
      note: p.note || p.description || '',
    };
  };

  const [pins, setPins] = useState(() => (demoMode ? SEED_PINS : []));
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapViewMode, setMapViewMode] = useState('constellation'); // 'constellation' | 'google_maps'

  useEffect(() => {
    if (demoMode) return;
    apiFetch('/api/community', {}, null)
      .then((list) => setPins(Array.isArray(list) ? list.map(toPin) : []))
      .catch(() => {});
  }, [demoMode]);

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
        
        {/* ──────────────── RADICAL UNIQUE HEADER 1: FLOATING GLASS SPHERE HEADER (NO GREEN RECTANGLE) ──────────────── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 px-4 border-b border-[#4ADE80]/30">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] animate-ping" />
              <span className="text-xs font-bold text-[#4ADE80] uppercase tracking-widest">
                {t.heroTag}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-black text-white tracking-tight">
              {t.heroTitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
              {t.heroSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#1A3827]/80 backdrop-blur-md border border-[#4ADE80]/40 px-4 py-2.5 rounded-full text-xs font-semibold text-[#4ADE80] shadow-lg shrink-0">
            <Globe className="w-4 h-4 text-[#4ADE80] animate-spin" style={{ animationDuration: '12s' }} />
            <span>{t.verifiedAnonymous}</span>
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
                className="p-3 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
                className="p-3 rounded-2xl bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white cursor-pointer"
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

        {/* ──────────────── INTERACTIVE COMMUNITY MAP CANVAS / GOOGLE MAPS ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[480px]">
          {/* View Mode Toggle Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#20422E] mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#4ADE80]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {mapViewMode === 'constellation' ? 'Species Constellation Network' : 'Live Google Biodiversity Map'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#07150C] border border-[#20422E] p-1 rounded-full text-xs">
              <button
                onClick={() => setMapViewMode('constellation')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  mapViewMode === 'constellation'
                    ? 'bg-[#4ADE80] text-[#07130B]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ Constellation
              </button>
              <button
                onClick={() => setMapViewMode('google_maps')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  mapViewMode === 'google_maps'
                    ? 'bg-[#4ADE80] text-[#07130B]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🗺️ Google Maps
              </button>
            </div>
          </div>

          {mapViewMode === 'google_maps' ? (
            <div className="relative w-full h-[440px] rounded-2xl overflow-hidden border border-[#20422E] shadow-inner bg-[#13271C]">
              <iframe
                title="Google Maps Biodiversity Observations"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedPin ? (`${selectedPin.name}, ${selectedPin.city}`) : 'parks and nature reserves, Ahmedabad, Gujarat')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          ) : (
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
              {filteredPins.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-[#0E2015]/90 border border-dashed border-[#4ADE80]/30 rounded-2xl px-6 py-4 text-xs text-slate-300 max-w-sm text-center">
                    No observations on the map yet. When community members log sightings, they appear here as constellation nodes.
                  </div>
                </div>
              )}
            </div>
          )}
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

              <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-white cursor-pointer">
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
