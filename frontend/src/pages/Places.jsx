import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Compass, MapPin, Search, Clock, Star, Navigation, 
  ChevronRight, Filter, Plus, Trash2, CheckCircle2, Shield, User, 
  Coffee, BookOpen, Trees, Palette, ShoppingBag, Utensils, Landmark, 
  HelpCircle, Eye, EyeOff, X, ArrowRight, Radio, Layers, RotateCcw,
  Bookmark, Share2, VolumeX, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { SEED_NEARBY_PLACES } from './PlaceDetails';

// Multilingual UI Translations for Nearby Discovery Engine
const NEARBY_TRANSLATIONS = {
  en: {
    heroTag: 'SPATIAL DISCOVERY COMPASS',
    heroTitle: 'Discover What Is Around You',
    heroSubtitle: 'Spatial discovery for quiet study spots, nature sanctuaries, local cafés, and cultural places.',
    askNearbyPlaceholder: 'Search nearby (e.g. Find a quiet place to study nearby…)',
    searchBtn: 'Search Radar',
    radiusLabel: 'Discovery Radius:',
    openNowFilter: '🟢 Open Now Only',
    comparePlacesBtn: 'Compare Places',
    buildRouteBtn: '✨ Build Afternoon Route',
    tabRadar: '📡 Interactive Radar Map',
    tabCompare: '⚖️ Place Comparison',
    tabSaved: '🔖 Saved Places',
    tabRoute: '🗺️ Discovery Route',
    whyAIRecommends: 'Why Pulse Recommends This',
    getDirectionsBtn: 'Get Directions',
    savePlaceBtn: 'Bookmark Place',
    viewDetailsBtn: 'View Place Details',
  },
  gu: {
    heroTag: 'સ્પેસિયલ ડિસ્કવરી હોકાયંત્ર',
    heroTitle: 'તમારી આસપાસ શું છે તે શોધો',
    heroSubtitle: 'શાંત અભ્યાસ સ્થળો, પ્રકૃતિ સ્થાનો, કેફે અને સાંસ્કૃતિક સ્થળો માટે સ્થાનિક સંશોધન.',
    askNearbyPlaceholder: 'નજીકમાં શોધો (દા.ત. નજીકમાં શાંત અભ્યાસ સ્થળ શોધો…)',
    searchBtn: 'રડાર શોધો',
    radiusLabel: 'શોધ ત્રિજ્યા:',
    openNowFilter: '🟢 હાલમાં ખુલ્લું',
    comparePlacesBtn: 'સ્થળોની સરખામણી કરો',
    buildRouteBtn: '✨ બપોરનો રૂટ બનાવો',
    tabRadar: '📡 ઇન્ટરેક્ટિવ રડાર મેપ',
    tabCompare: '⚖️ સરખામણી',
    tabSaved: '🔖 સેવ કરેલા સ્થળો',
    tabRoute: '🗺️ કસ્ટમ રૂટ',
    whyAIRecommends: 'આની ભલામણ કેમ કરે છે',
    getDirectionsBtn: 'દિશાઓ મેળવો',
    savePlaceBtn: 'સ્થળ સેવ કરો',
    viewDetailsBtn: 'વિગતો જુઓ',
  },
  hi: {
    heroTag: 'स्पेशल डिस्कवरी कम्पास',
    heroTitle: 'अपनी आसपास की चीजें खोजें',
    heroSubtitle: 'शांत अध्ययन स्थलों, प्रकृति स्थानों, कैफे और सांस्कृतिक स्थलों की स्थानिक खोज।',
    askNearbyPlaceholder: 'आसपास खोजें (जैसे, अध्ययन के लिए एक शांत जगह खोजें…)',
    searchBtn: 'रडार खोजें',
    radiusLabel: 'खोज त्रिज्या:',
    openNowFilter: '🟢 अभी खुला हुआ',
    comparePlacesBtn: 'स्थानों की तुलना करें',
    buildRouteBtn: '✨ दोपहर का मार्ग बनाएं',
    tabRadar: '📡 इंटरैक्टिव रडार मैप',
    tabCompare: '⚖️ तुलना',
    tabSaved: '🔖 सहेजे गए स्थान',
    tabRoute: '🗺️ कस्टम मार्ग',
    whyAIRecommends: 'इसकी सिफारिश क्यों की जाती है',
    getDirectionsBtn: 'दिशा-निर्देश प्राप्त करें',
    savePlaceBtn: 'स्थान सहेजें',
    viewDetailsBtn: 'विवरण देखें',
  },
};

export default function Places() {
  const navigate = useNavigate();
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
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isBuildingRoute, setIsBuildingRoute] = useState(false);
  const [builtRoute, setBuiltRoute] = useState(null);

  // Sync places with API if available
  useEffect(() => {
    let mounted = true;
    apiFetch('/api/places')
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          // Merge API data with seed attributes
          const merged = data.map((apiItem, idx) => {
            const seedMatch = SEED_NEARBY_PLACES.find((s) => s.id === apiItem.id || s.id === apiItem._id) || SEED_NEARBY_PLACES[idx % SEED_NEARBY_PLACES.length];
            return {
              ...seedMatch,
              ...apiItem,
              id: apiItem.id || apiItem._id || seedMatch.id,
              image: apiItem.image || apiItem.image_url || seedMatch.image,
            };
          });
          setPlaces(merged);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('pulse_nearby_places_v1', JSON.stringify(places));
  }, [places]);

  useEffect(() => {
    localStorage.setItem('pulse_saved_places_v1', JSON.stringify(savedPlaceIds));
  }, [savedPlaceIds]);

  // Toggle Save Bookmark
  const toggleSavePlace = (id, e) => {
    if (e) e.stopPropagation();
    setSavedPlaceIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Build Route
  const handleBuildRoute = () => {
    setIsBuildingRoute(true);
    setTimeout(() => {
      setBuiltRoute({
        title: '2-Hour Afternoon Eco-Discovery Route',
        duration: '2 Hours 15 Mins',
        totalDistance: '2.8 km walking',
        stops: [
          { order: 1, id: 'p-1', name: 'Peepal Canopy Study Sanctuary', time: '1:00 PM - 1:45 PM', note: 'Start with quiet study under Peepal shade canopy.', icon: '📚' },
          { order: 2, id: 'p-2', name: 'Banyan Tree Botanical Garden Café', time: '1:50 PM - 2:30 PM', note: 'Organic herbal tea break & courtyard relaxation.', icon: '☕' },
          { order: 3, id: 'p-3', name: 'Urban Wetlands & Bird Deck', time: '2:35 PM - 3:15 PM', note: 'Evening Kingfisher observation and wetland walk.', icon: '🌳' },
        ],
      });
      setIsBuildingRoute(false);
      setActiveTab('route');
    }, 1000);
  };

  // Filtered Places
  const filteredPlaces = places.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (onlyOpenNow && !p.isOpen) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchWhy = p.whyRecommend?.toLowerCase().includes(q);
      const matchAddr = p.address?.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchWhy && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── RADICAL UNIQUE HEADER 3: SPATIAL COMPASS DIAL HEADER ──────────────── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 border-b border-[#20452F]">
          <div className="flex items-center gap-5">
            {/* Animated Compass Motif */}
            <div className="w-16 h-16 rounded-full bg-[#13271C] border-2 border-[#4ADE80] flex items-center justify-center relative shrink-0 shadow-lg">
              <Compass className="w-8 h-8 text-[#4ADE80] animate-spin" style={{ animationDuration: '20s' }} />
              <span className="absolute top-1 text-[8px] font-bold text-[#4ADE80]">N</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-[#4ADE80] uppercase tracking-widest">
                {t.heroTag}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBuildRoute}
            disabled={isBuildingRoute}
            className="px-6 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBuildingRoute ? 'Building Route…' : t.buildRouteBtn}</span>
          </motion.button>
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
                  : 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-white'
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

        {/* ──────────────── TAB 1: INTERACTIVE RADAR MAP & PLACES GRID ──────────────── */}
        {activeTab === 'radar' && (
          <div className="space-y-8">
            {/* Radar Visualizer */}
            <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[440px]">
              <div className="relative w-full h-[400px]">
                <svg viewBox="0 0 700 400" className="absolute inset-0 w-full h-full pointer-events-none">
                  <circle cx="350" cy="200" r="70" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                  <circle cx="350" cy="200" r="140" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                  <circle cx="350" cy="200" r="200" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                  <line x1="350" y1="200" x2="580" y2="90" stroke="#4ADE80" strokeWidth="1.5" opacity="0.4" />
                </svg>

                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#2E6141] to-[#040B06] border-2 border-[#4ADE80] flex flex-col items-center justify-center text-center shadow-2xl z-20 cursor-pointer"
                  onClick={() => setSelectedPlace(null)}
                >
                  <Navigation className="w-5 h-5 text-[#4ADE80]" />
                  <span className="text-[9px] font-bold text-white tracking-widest uppercase">YOU</span>
                </motion.div>

                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <motion.div
                      key={place.id}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPlace(place)}
                      style={{ left: place.mapX || 300, top: place.mapY || 200 }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl border transition-all cursor-pointer shadow-xl z-20 flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-[#4ADE80]/30 scale-110'
                          : 'bg-[#13271C]/95 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/50'
                      }`}
                    >
                      <span className="text-base">{place.icon || '🌿'}</span>
                      <div>
                        <p className="text-xs font-bold whitespace-nowrap">{place.name}</p>
                        <p className="text-[10px] text-[#4ADE80] font-semibold">{place.distance}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ──────────────── PLACES CARDS GRID (NORMAL ORIENTATION & CLICKABLE DETAILS) ──────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-white">
                  Nearby Spots ({filteredPlaces.length})
                </h2>
                <span className="text-xs text-slate-400">Click any card to explore full details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredPlaces.map((place) => {
                  const isSaved = savedPlaceIds.includes(place.id);

                  return (
                    <motion.div
                      key={place.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => navigate(`/app/places/${place.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/app/places/${place.id}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${place.name}`}
                      className="bg-[#0E2015] border border-[#20452F] hover:border-[#4ADE80]/60 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#4ADE80]"
                    >
                      {/* CARD IMAGE BANNER */}
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#13271C]">
                        <img
                          src={place.image || place.image_url}
                          alt={place.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E2015] via-transparent to-black/20" />
                        
                        {/* Top Category & Open/Close Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#07130B]/85 backdrop-blur-md text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/40 flex items-center gap-1">
                            <span>{place.icon || '🌿'}</span>
                            <span>{place.category || place.type}</span>
                          </span>
                        </div>

                        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                          place.isOpen !== false
                            ? 'bg-emerald-950/85 text-emerald-300 border-emerald-400/40'
                            : 'bg-red-950/85 text-red-300 border-red-400/40'
                        }`}>
                          {place.isOpen !== false ? '🟢 Open Now' : '🔴 Closed'}
                        </span>
                      </div>

                      {/* CARD CONTENT */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-display text-lg font-bold text-white group-hover:text-[#4ADE80] transition-colors line-clamp-1">
                              {place.name}
                            </h3>
                            <span className="text-xs text-amber-400 font-bold shrink-0 flex items-center gap-0.5">
                              ★ {place.rating || 4.8}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-300 line-clamp-1">{place.address || place.city}</p>
                          
                          <p className="text-xs text-slate-400 italic line-clamp-2 pt-1">
                            "{place.whyRecommend || place.description}"
                          </p>
                        </div>

                        {/* CARD FOOTER & ACTIONS */}
                        <div className="pt-3 border-t border-[#20422E] flex justify-between items-center">
                          <div className="text-xs text-[#4ADE80] font-semibold flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5" />
                            <span>{place.distance} · {place.walkTime}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => toggleSavePlace(place.id, e)}
                              aria-label={isSaved ? 'Remove Bookmark' : 'Bookmark Spot'}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                isSaved 
                                  ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]' 
                                  : 'bg-[#13271C] text-slate-300 border-[#20422E] hover:border-[#4ADE80]/50 hover:text-white'
                              }`}
                            >
                              <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                              <span>{isSaved ? 'Bookmarked ✓' : 'Bookmark'}</span>
                            </button>

                            <span className="p-1.5 rounded-full bg-[#13271C] text-slate-300 group-hover:text-[#4ADE80] group-hover:bg-[#1A3827] transition-colors">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 2: PLACE COMPARISON ──────────────── */}
        {activeTab === 'compare' && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 space-y-6 shadow-xl overflow-x-auto">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold text-white">Compare Discovery Spots</h2>
              <p className="text-xs text-slate-300">Side-by-side quietness, distance, and ambience metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[700px]">
              {places.slice(0, 4).map((p) => (
                <div key={p.id} className="bg-[#13271C] border border-[#20422E] rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <img src={p.image} alt={p.name} className="w-full h-28 object-cover rounded-xl" />
                    <h3 className="font-display text-sm font-bold text-white line-clamp-1">{p.name}</h3>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex justify-between py-1 border-b border-[#20422E]">
                        <span>Quiet Score</span>
                        <span className="text-[#4ADE80] font-bold">{p.quietScore || '92%'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#20422E]">
                        <span>Distance</span>
                        <span className="text-white font-semibold">{p.distance}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#20422E]">
                        <span>Rating</span>
                        <span className="text-amber-400 font-bold">★ {p.rating}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#20422E]">
                        <span>Price</span>
                        <span className="text-slate-200">{p.price || 'Free'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/app/places/${p.id}`)}
                    className="w-full py-2 rounded-xl bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all cursor-pointer text-center"
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────── TAB 3: SAVED PLACES ──────────────── */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-white">
                Saved Bookmarked Places ({savedPlaceIds.length})
              </h2>
            </div>

            {savedPlaceIds.length === 0 ? (
              <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-12 text-center space-y-4">
                <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-display text-lg font-bold text-white">No Saved Places Yet</h3>
                <p className="text-xs text-slate-300">Click the bookmark icon on any spot in the radar map to save it here.</p>
                <button
                  onClick={() => setActiveTab('radar')}
                  className="px-6 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all cursor-pointer"
                >
                  Explore Radar Map
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {places
                  .filter((p) => savedPlaceIds.includes(p.id))
                  .map((place) => (
                    <div
                      key={place.id}
                      onClick={() => navigate(`/app/places/${place.id}`)}
                      className="bg-[#0E2015] border border-[#20452F] hover:border-[#4ADE80]/50 rounded-3xl p-5 flex gap-4 cursor-pointer group shadow-xl transition-all"
                    >
                      <img src={place.image} alt={place.name} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-display text-sm font-bold text-white group-hover:text-[#4ADE80] transition-colors truncate">
                            {place.name}
                          </h3>
                          <p className="text-xs text-slate-300 truncate mt-0.5">{place.address}</p>
                          <p className="text-[10px] text-[#4ADE80] font-semibold mt-1">{place.distance} · {place.walkTime}</p>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-amber-400 font-bold">★ {place.rating}</span>
                          <button
                            onClick={(e) => toggleSavePlace(place.id, e)}
                            className="text-xs text-red-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 4: DISCOVERY ROUTE ──────────────── */}
        {activeTab === 'route' && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20452F] pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#4ADE80] uppercase tracking-widest">
                  AI-Optimized Route
                </span>
                <h2 className="font-display text-2xl font-bold text-white">
                  {builtRoute?.title || '2-Hour Afternoon Eco-Discovery Route'}
                </h2>
                <p className="text-xs text-slate-300">
                  {builtRoute?.duration || '2 Hours 15 Mins'} · {builtRoute?.totalDistance || '2.8 km walking route'}
                </p>
              </div>

              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Maps</span>
              </a>
            </div>

            {/* Route Stops Timeline */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#20422E]">
              {(builtRoute?.stops || [
                { order: 1, id: 'p-1', name: 'Peepal Canopy Study Sanctuary', time: '1:00 PM - 1:45 PM', note: 'Start with quiet study under Peepal shade canopy.', icon: '📚' },
                { order: 2, id: 'p-2', name: 'Banyan Tree Botanical Garden Café', time: '1:50 PM - 2:30 PM', note: 'Organic herbal tea break & courtyard relaxation.', icon: '☕' },
                { order: 3, id: 'p-3', name: 'Urban Wetlands & Bird Deck', time: '2:35 PM - 3:15 PM', note: 'Evening Kingfisher observation and wetland walk.', icon: '🌳' },
              ]).map((stop) => (
                <div key={stop.order} className="flex items-start gap-5 relative pl-2">
                  <div className="w-8 h-8 rounded-full bg-[#13271C] border-2 border-[#4ADE80] flex items-center justify-center text-xs font-bold text-[#4ADE80] shrink-0 z-10">
                    {stop.order}
                  </div>
                  <div className="bg-[#13271C] border border-[#20422E] rounded-2xl p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#4ADE80]/40 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stop.icon || '🌿'}</span>
                        <h4 className="font-display text-sm font-bold text-white">{stop.name}</h4>
                      </div>
                      <p className="text-xs text-slate-300">{stop.note}</p>
                      <span className="text-[11px] text-[#4ADE80] font-semibold">{stop.time}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/app/places/${stop.id || 'p-1'}`)}
                      className="px-4 py-2 rounded-xl bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30 hover:bg-[#4ADE80] hover:text-[#07130B] transition-all text-xs font-bold cursor-pointer shrink-0"
                    >
                      View Spot
                    </button>
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
