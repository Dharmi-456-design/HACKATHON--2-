import { useState, useEffect } from 'react';
import { 
  Sparkles, Compass, MapPin, Search, Clock, Star, Navigation, 
  ChevronRight, Filter, Plus, Trash2, CheckCircle2, Shield, User, 
  Coffee, BookOpen, Trees, Palette, ShoppingBag, Utensils, Landmark, 
  HelpCircle, Eye, EyeOff, X, ArrowRight, Radio, Layers, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual UI Translations for Nearby AI Discovery Engine
const NEARBY_TRANSLATIONS = {
  en: {
    heroTag: 'LIVING LOCAL DISCOVERY RADAR',
    heroTitle: 'Discover What Is Around You',
    heroSubtitle: 'Spatial AI discovery for quiet study spots, nature sanctuaries, local cafés, and cultural places.',
    askNearbyPlaceholder: 'Ask Nearby AI (e.g. Find me a quiet place to study nearby…)',
    searchBtn: 'Search Radar',
    radiusLabel: 'Discovery Radius:',
    openNowFilter: '🟢 Open Now Only',
    comparePlacesBtn: 'Compare Places',
    buildRouteBtn: '✨ Build Afternoon Route',
    tabRadar: '📡 Interactive Radar Map',
    tabCompare: '⚖️ Place Comparison',
    tabSaved: '🔖 Saved Places',
    tabRoute: '🗺️ AI Discovery Route',
    whyAIRecommends: 'Why AI Recommends This',
    getDirectionsBtn: 'Get Directions',
    savePlaceBtn: 'Bookmark Place',
  },
  gu: {
    heroTag: 'લિવિંગ લોકલ ડિસ્કવરી રડાર',
    heroTitle: 'તમારી આસપાસ શું છે તે શોધો',
    heroSubtitle: 'શાંત અભ્યાસ સ્થળો, પ્રકૃતિ સ્થાનો, કેફે અને સાંસ્કૃતિક સ્થળો માટે એઆઈ સ્થાનિક સંશોધન.',
    askNearbyPlaceholder: 'નજીકના એઆઈને પૂછો (દા.ત. નજીકમાં શાંત અભ્યાસ સ્થળ શોધો…)',
    searchBtn: 'રડાર શોધો',
    radiusLabel: 'શોધ ત્રિજ્યા:',
    openNowFilter: '🟢 હાલમાં ખુલ્લું',
    comparePlacesBtn: 'સ્થળોની સરખામણી કરો',
    buildRouteBtn: '✨ બપોરનો રૂટ બનાવો',
    tabRadar: '📡 ઇન્ટરેક્ટિવ રડાર મેપ',
    tabCompare: '⚖️ સરખામણી',
    tabSaved: '🔖 સેવ કરેલા સ્થળો',
    tabRoute: '🗺️ એઆઈ રૂટ',
    whyAIRecommends: 'એઆઈ આની ભલામણ કેમ કરે છે',
    getDirectionsBtn: 'દિશાઓ મેળવો',
    savePlaceBtn: 'સ્થળ સેવ કરો',
  },
  hi: {
    heroTag: 'लिविंग लोकल डिस्कवरी रडार',
    heroTitle: 'अपनी आसपास की चीजें खोजें',
    heroSubtitle: 'शांत अध्ययन स्थलों, प्रकृति स्थानों, कैफे और सांस्कृतिक स्थलों की एआई खोज।',
    askNearbyPlaceholder: 'आसपास के एआई से पूछें (जैसे, अध्ययन के लिए एक शांत जगह खोजें…)',
    searchBtn: 'रडार खोजें',
    radiusLabel: 'खोज त्रिज्या:',
    openNowFilter: '🟢 अभी खुला हुआ',
    comparePlacesBtn: 'स्थानों की तुलना करें',
    buildRouteBtn: '✨ दोपहर का मार्ग बनाएं',
    tabRadar: '📡 इंटरैक्टिव रडार मैप',
    tabCompare: '⚖️ तुलना',
    tabSaved: '🔖 सहेजे गए स्थान',
    tabRoute: '🗺️ एआई मार्ग',
    whyAIRecommends: 'एआई इसकी सिफारिश क्यों करता है',
    getDirectionsBtn: 'दिशा-निर्देश प्राप्त करें',
    savePlaceBtn: 'स्थान सहेजें',
  },
};

// Seed Real Local Discoveries with HD Images & Radar Coordinates
const SEED_NEARBY_PLACES = [
  {
    id: 'p-1',
    name: 'Peepal Canopy Study Sanctuary',
    category: 'Study',
    icon: '📚',
    distance: '450 m',
    walkTime: '6 min walk',
    rating: 4.9,
    isOpen: true,
    hours: '7:00 AM - 9:00 PM',
    address: 'Sabarmati Riverfront Park, Block B',
    mapX: 320,
    mapY: 180,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'High quietness score (94%), shade canopy, open now, within 6 min walk.',
    price: 'Free',
  },
  {
    id: 'p-2',
    name: 'Banyan Tree Botanical Garden Café',
    category: 'Cafés',
    icon: '☕',
    distance: '900 m',
    walkTime: '12 min walk',
    rating: 4.8,
    isOpen: true,
    hours: '8:00 AM - 10:00 PM',
    address: 'Law Garden Road, Opposite Museum',
    mapX: 480,
    mapY: 260,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Organic herbal tea, outdoor seating under banyan shade, strong Wi-Fi.',
    price: '$$',
  },
  {
    id: 'p-3',
    name: 'Urban Wetlands & Bird Deck',
    category: 'Parks',
    icon: '🌳',
    distance: '1.4 km',
    walkTime: '18 min walk',
    rating: 4.9,
    isOpen: true,
    hours: '6:00 AM - 7:00 PM',
    address: 'Kankaria Lake North Eco-Corridor',
    mapX: 210,
    mapY: 340,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Ideal for Kingfisher observation and evening micro-climate walks.',
    price: 'Free',
  },
  {
    id: 'p-4',
    name: 'Heritage Textiles & Art Pavilion',
    category: 'Culture',
    icon: '🎨',
    distance: '2.1 km',
    walkTime: '8 min drive',
    rating: 4.7,
    isOpen: false,
    hours: 'Opens tomorrow 10:00 AM',
    address: 'Old City Cultural Promenade',
    mapX: 520,
    mapY: 140,
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Traditional indigo dye exhibitions and historic architecture.',
    price: '$',
  },
];

export default function Places() {
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = NEARBY_TRANSLATIONS[lang] || NEARBY_TRANSLATIONS.en;

  // Persistent State
  const [places, setPlaces] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_nearby_places_v1');
      return saved ? JSON.parse(saved) : SEED_NEARBY_PLACES;
    } catch {
      return SEED_NEARBY_PLACES;
    }
  });

  const [savedPlaceIds, setSavedPlaceIds] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_saved_places_v1');
      return saved ? JSON.parse(saved) : ['p-1'];
    } catch {
      return ['p-1'];
    }
  });

  // Controls
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusFilter, setRadiusFilter] = useState(5); // 5km
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [activeTab, setActiveTab] = useState('radar'); // radar, compare, saved, route
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [compareIds, setCompareIds] = useState(['p-1', 'p-2']);
  const [isBuildingRoute, setIsBuildingRoute] = useState(false);
  const [builtRoute, setBuiltRoute] = useState(null);

  useEffect(() => {
    localStorage.setItem('pulse_nearby_places_v1', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem('pulse_saved_places_v1', JSON.stringify(savedPlaceIds));
  }, [savedPlaceIds]);

  // Toggle Save Bookmark
  const toggleSavePlace = (id) => {
    setSavedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Build AI Route
  const handleBuildRoute = () => {
    setIsBuildingRoute(true);
    setTimeout(() => {
      setBuiltRoute({
        title: '2-Hour Afternoon Eco-Discovery Route',
        duration: '2 Hours 15 Mins',
        stops: [
          { order: 1, name: 'Peepal Canopy Study Sanctuary', time: '1:00 PM - 1:45 PM', note: 'Start with quiet study under Peepal shade.' },
          { order: 2, name: 'Banyan Tree Botanical Garden Café', time: '1:50 PM - 2:30 PM', note: 'Coffee break & organic herbal tea.' },
          { order: 3, name: 'Urban Wetlands & Bird Deck', time: '2:35 PM - 3:15 PM', note: 'Evening bird flight observation.' },
        ],
      });
      setIsBuildingRoute(false);
      setActiveTab('route');
    }, 1200);
  };

  // Filtered Places
  const filteredPlaces = places.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (onlyOpenNow && !p.isOpen) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchWhy = p.whyRecommend.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchWhy) return false;
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuildRoute}
              disabled={isBuildingRoute}
              className="px-6 py-3.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBuildingRoute ? 'Building Route…' : t.buildRouteBtn}</span>
            </motion.button>
          </div>
        </div>

        {/* ──────────────── SEARCH & RADIUS CONTROLS ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.askNearbyPlaceholder}
                className="w-full bg-[#13271C] border border-[#20422E] rounded-2xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[#4ADE80]"
              />
            </div>

            <button
              onClick={() => setOnlyOpenNow((v) => !v)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                onlyOpenNow
                  ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                  : 'bg-[#13271C] border-[#20422E] text-slate-400'
              }`}
            >
              {t.openNowFilter}
            </button>
          </div>

          {/* Quick Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['All', 'Study', 'Cafés', 'Parks', 'Culture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]'
                    : 'bg-[#13271C] border-[#20422E] text-slate-300 hover:bg-[#1A3827]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ──────────────── NAVIGATION TABS ──────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none">
          {[
            { id: 'radar', label: t.tabRadar },
            { id: 'compare', label: t.tabCompare },
            { id: 'saved', label: `${t.tabSaved} (${savedPlaceIds.length})` },
            { id: 'route', label: t.tabRoute },
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

        {/* ──────────────── TAB 1: INTERACTIVE RADAR DISCOVERY MAP ──────────────── */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            
            {/* SVG Radar Canvas */}
            <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[460px]">
              <div className="relative w-full h-[440px]">
                
                {/* SVG Sonar Radar Rings */}
                <svg viewBox="0 0 700 440" className="absolute inset-0 w-full h-full pointer-events-none">
                  <circle cx="350" cy="220" r="80" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                  <circle cx="350" cy="220" r="150" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                  <circle cx="350" cy="220" r="210" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                  
                  {/* Radar Scanning Line */}
                  <line x1="350" y1="220" x2="600" y2="100" stroke="#4ADE80" strokeWidth="1.5" opacity="0.4" />
                </svg>

                {/* Central Radar Pulse Hub */}
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#2E6141] to-[#040B06] border-2 border-[#4ADE80] flex flex-col items-center justify-center text-center shadow-2xl z-20 cursor-pointer"
                  onClick={() => setSelectedPlace(null)}
                >
                  <Navigation className="w-5 h-5 text-[#4ADE80]" />
                  <span className="text-[9px] font-bold text-white tracking-widest uppercase">YOU</span>
                </motion.div>

                {/* Floating Location Markers */}
                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <motion.div
                      key={place.id}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPlace(place)}
                      style={{ left: place.mapX, top: place.mapY }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl border transition-all cursor-pointer shadow-xl z-20 flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-[#4ADE80]/30 scale-110'
                          : 'bg-[#13271C]/95 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/50'
                      }`}
                    >
                      <span className="text-base">{place.icon}</span>
                      <div>
                        <p className="text-xs font-bold whitespace-nowrap">{place.name}</p>
                        <p className="text-[10px] text-[#4ADE80] font-semibold">{place.distance}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* 3D Flipping Location Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredPlaces.map((place) => {
                const isFlipped = flippedCardId === place.id;
                const isSaved = savedPlaceIds.includes(place.id);

                return (
                  <div
                    key={place.id}
                    className="perspective-1000 h-96 cursor-pointer"
                    onMouseEnter={() => setFlippedCardId(place.id)}
                    onMouseLeave={() => setFlippedCardId(null)}
                  >
                    <motion.div
                      className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                    >
                      {/* FRONT TILE */}
                      <div className="absolute inset-0 backface-hidden bg-[#0E2015] border border-[#20452F] rounded-3xl overflow-hidden flex flex-col justify-between">
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#07130B]/80 backdrop-blur-md text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/40">
                              {place.icon} {place.category}
                            </span>
                          </div>
                          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                            place.isOpen
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40'
                              : 'bg-red-950/80 text-red-300 border-red-400/40'
                          }`}>
                            {place.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-display text-lg font-bold text-white line-clamp-1">{place.name}</h3>
                              <span className="text-xs text-amber-400 font-bold">★ {place.rating}</span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">{place.address}</p>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-[#20422E]">
                            <span className="text-xs text-[#4ADE80] font-semibold">{place.distance} · {place.walkTime}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSavePlace(place.id);
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                isSaved ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]' : 'bg-[#13271C] text-slate-300 border-[#20422E]'
                              }`}
                            >
                              {isSaved ? 'Bookmarked ✓' : 'Bookmark'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* BACK TILE */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#112318] border border-[#4ADE80]/50 rounded-3xl p-6 flex flex-col justify-between text-slate-200">
                        <div className="space-y-3">
                          <span className="px-3 py-1 rounded-full bg-[#1A3827] text-xs font-bold text-[#4ADE80]">
                            {t.whyAIRecommends}
                          </span>
                          <h4 className="font-display text-base font-bold text-white">{place.name}</h4>
                          <p className="text-xs text-slate-300 italic leading-relaxed">
                            "{place.whyRecommend}"
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[#20422E] flex justify-between items-center text-[10px] text-slate-400">
                          <span>Hours: {place.hours}</span>
                          <span className="text-[#4ADE80] font-bold">Price: {place.price}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ──────────────── TAB 4: AI DISCOVERY ROUTE ──────────────── */}
        {activeTab === 'route' && builtRoute && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#20452F] pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">{builtRoute.title}</h3>
                <p className="text-xs text-[#4ADE80] font-semibold">Total Estimated Duration: {builtRoute.duration}</p>
              </div>
            </div>

            <div className="space-y-4">
              {builtRoute.stops.map((stop) => (
                <div key={stop.order} className="bg-[#13271C] border border-[#20422E] p-5 rounded-2xl flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#1A3827] border border-[#4ADE80] flex items-center justify-center text-xs font-bold text-[#4ADE80] shrink-0">
                    0{stop.order}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-base font-bold text-white">{stop.name}</h4>
                      <span className="text-xs text-amber-400 font-semibold">{stop.time}</span>
                    </div>
                    <p className="text-xs text-slate-300">{stop.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
