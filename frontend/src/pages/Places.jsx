import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Compass, MapPin, Search, Clock, Star, Navigation, 
  ChevronRight, Filter, Plus, Trash2, CheckCircle2, Shield, User, 
  Coffee, BookOpen, Trees, Palette, ShoppingBag, Utensils, Landmark, 
  HelpCircle, Eye, EyeOff, X, ArrowRight, Radio, Layers, RotateCcw, Send, Check,
  Activity, Gauge, Crosshair, Map, ArrowUpRight, LocateFixed, Radar, Scale, Bookmark, AlertTriangle, GraduationCap, Leaf, Sprout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';
import { FallbackImg } from '../components/ui';
import { useLiveLocation, calculateHaversineDistance, formatDistance, formatTravelTime } from '../hooks/useLiveLocation';

// Multilingual UI Translations for Nearby Discovery Engine
const NEARBY_TRANSLATIONS = {
  en: {
    heroTag: 'SPATIAL DISCOVERY COMPASS',
    heroTitle: 'Discover What Is Around',
    heroHighlight: 'You',
    heroSubtitle: 'Spatial discovery for quiet study spots, nature sanctuaries, local cafés, and cultural places with real-time GPS precision.',
    searchPromptTag: 'Find places that inspire your journey',
    askNearbyPlaceholder: 'Search nearby (e.g. Find a quiet place to study nearby…)',
    searchBtn: 'Search Radar',
    radiusLabel: 'Discovery Radius:',
    openNowFilter: 'Open Now Only',
    locateMe: 'Locate Me',
    locating: 'Locating…',
    comparePlacesBtn: 'Compare Places',
    buildRouteBtn: 'Build Afternoon Route →',
    tabRadarTitle: 'Interactive Radar Map',
    tabRadarSub: "See what's around you",
    tabCompareTitle: 'Place Comparison',
    tabCompareSub: 'Compare & choose best',
    tabSavedTitle: 'Saved Places',
    tabSavedSub: 'Your personal collection',
    tabRouteTitle: 'Discovery Route',
    tabRouteSub: 'Plan your adventure',
    whyAIRecommends: 'Why Recommends This',
    getDirectionsBtn: 'Get Directions',
    savePlaceBtn: 'Bookmark Place',
    topPicksTitle: 'Top Picks Nearby',
    viewAllBtn: 'View All 7 Places →',
    allPlacesTitle: '📡 All Local Places & Eco Sanctuaries',
    allPlacesSub: 'Hover cards for 3D flip details, operating hours, and travel breakdown',
  },
  gu: {
    heroTag: 'સ્પેસિયલ ડિસ્કવરી હોકાયંત્ર',
    heroTitle: 'તમારી આસપાસ શું છે તે',
    heroHighlight: 'શોધો ✨',
    heroSubtitle: 'શાંત અભ્યાસ સ્થળો, પ્રકૃતિ સ્થાનો, કેફે અને સાંસ્કૃતિક સ્થળો માટે રીઅલ-ટાઇમ જીપીએસ સંશોધન.',
    searchPromptTag: 'તમારી યાત્રાને પ્રેરણા આપે તેવા સ્થળો શોધો',
    askNearbyPlaceholder: 'નજીકમાં શોધો (દા.ત. નજીકમાં શાંત અભ્યાસ સ્થળ શોધો…)',
    searchBtn: 'રડાર શોધો',
    radiusLabel: 'શોધ ત્રિજ્યા:',
    openNowFilter: 'હાલમાં ખુલ્લું',
    locateMe: 'મારું સ્થાન',
    locating: 'સ્થાન શોધી રહ્યા…',
    comparePlacesBtn: 'સ્થળોની સરખામણી કરો',
    buildRouteBtn: '✨ બપોરનો રૂટ બનાવો →',
    tabRadarTitle: 'ઇન્ટરેક્ટિવ રડાર મેપ',
    tabRadarSub: 'તમારી આસપાસ જુઓ',
    tabCompareTitle: 'સ્થળ સરખામણી',
    tabCompareSub: 'શ્રેષ્ઠ પસંદ કરો',
    tabSavedTitle: 'સેવ કરેલા સ્થળો',
    tabSavedSub: 'તમારું સંગ્રહ',
    tabRouteTitle: 'ડિસ્કવરી રૂટ',
    tabRouteSub: 'પ્લાન બનાવો',
    whyAIRecommends: 'આની ભલામણ કેમ કરે છે',
    getDirectionsBtn: 'દિશાઓ મેળવો',
    savePlaceBtn: 'સ્થળ સેવ કરો',
    topPicksTitle: '🌿 મુખ્ય નજીકના સ્થળો',
    viewAllBtn: 'બધા ૭ સ્થળો જુઓ →',
    allPlacesTitle: '📡 તમામ સ્થાનિક સ્થળો અને પ્રકૃતિ સ્થાનો',
    allPlacesSub: '3D ફ્લિપ વિગતો માટે કાર્ડ્સ પર હોવર કરો',
  },
  hi: {
    heroTag: 'स्पेशल डिस्कवरी कम्पास',
    heroTitle: 'अपनी आसपास की चीजें',
    heroHighlight: 'खोजें ✨',
    heroSubtitle: 'शांत अध्ययन स्थलों, प्रकृति स्थानों, कैफे और सांस्कृतिक स्थलों की रीयल-टाइम जीपीएस खोज।',
    searchPromptTag: 'अपनी यात्रा को प्रेरित करने वाले स्थान खोजें',
    askNearbyPlaceholder: 'आसपास खोजें (जैसे, अध्ययन के लिए एक शांत जगह खोजें…)',
    searchBtn: 'रडार खोजें',
    radiusLabel: 'खोज त्रिज्या:',
    openNowFilter: 'अभी खुला हुआ',
    locateMe: 'मेरा स्थान',
    locating: 'स्थान खोज रहे हैं…',
    comparePlacesBtn: 'स्थानों की तुलना करें',
    buildRouteBtn: '✨ दोपहर का मार्ग बनाएं →',
    tabRadarTitle: 'इंटरैक्टिव रडार मैप',
    tabRadarSub: 'अपने आसपास देखें',
    tabCompareTitle: 'स्थान तुलना',
    tabCompareSub: 'सर्वश्रेष्ठ चुनें',
    tabSavedTitle: 'सहेजे गए स्थान',
    tabSavedSub: 'आपका व्यक्तिगत संग्रह',
    tabRouteTitle: 'डिस्कवरी मार्ग',
    tabRouteSub: 'अपनी योजना बनाएं',
    whyAIRecommends: 'इसकी सिफारिश क्यों की जाती है',
    getDirectionsBtn: 'दिशा-निर्देश प्राप्त करें',
    savePlaceBtn: 'स्थान सहेजें',
    topPicksTitle: '🌿 प्रमुख आसपास के स्थान',
    viewAllBtn: 'सभी 7 स्थान देखें →',
    allPlacesTitle: '📡 सभी स्थानीय स्थान और प्रकृति आश्रय स्थल',
    allPlacesSub: '3D फ्लिप विवरण के लिए कार्ड पर होवर करें',
  },
};

const DEFAULT_TOP_PICKS = [
  {
    id: "kankaria-lake",
    name: "Kankaria Lake & Eco Sanctuary",
    category: "Nature",
    icon: "🌊",
    image: "/kankaria_lake.png",
    description: "A historic circular lake with central island gardens and rich birdlife.",
    address: "Maninagar, Ahmedabad, Gujarat",
    distance: "1.2 km",
    walkTime: "15 min walk",
    rating: 4.9,
    reviewsCount: 320,
    isOpen: true,
    whyRecommend: "Iconic eco sanctuary taking reference from real Google GPS coordinates.",
    hours: "8 AM - 10 PM",
    price: "Free",
    lat: 23.0063,
    lng: 72.6026,
    mapX: "35%",
    mapY: "40%",
  },
  {
    id: "sabarmati-riverfront",
    name: "Sabarmati Riverfront Biodiversity Park",
    category: "Parks",
    icon: "🌿",
    image: "/sabarmati_riverfront.png",
    description: "Lush urban green promenade with native flora and riverside walking trails.",
    address: "Sabarmati Riverfront, Ahmedabad",
    distance: "0.8 km",
    walkTime: "10 min walk",
    rating: 4.8,
    reviewsCount: 240,
    isOpen: true,
    whyRecommend: "Restored riparian habitat buffer along the Sabarmati.",
    hours: "6 AM - 9 PM",
    price: "Free",
    lat: 23.0300,
    lng: 72.5800,
    mapX: "55%",
    mapY: "30%",
  },
  {
    id: "thol-sanctuary",
    name: "Thol Lake Bird Sanctuary",
    category: "Nature",
    icon: "🦩",
    image: "/thol_lake.png",
    description: "Freshwater wetland habitat supporting thousands of migratory flamingos and pelicans.",
    address: "Thol Village, Kalol, Gujarat",
    distance: "3.5 km",
    walkTime: "40 min walk",
    rating: 4.9,
    reviewsCount: 410,
    isOpen: true,
    whyRecommend: "Ramsar site providing vital wintering grounds for waterbirds.",
    hours: "6 AM - 6 PM",
    price: "₹50",
    lat: 23.1381,
    lng: 72.3957,
    mapX: "70%",
    mapY: "65%",
  },
  {
    id: "law-garden",
    name: "Law Garden Botanical Reserve",
    category: "Culture",
    icon: "🌸",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
    description: "Vibrant city garden featuring over 80 species of native flowers and medicinal plants.",
    address: "Ellisbridge, Ahmedabad",
    distance: "1.8 km",
    walkTime: "22 min walk",
    rating: 4.7,
    reviewsCount: 180,
    isOpen: true,
    whyRecommend: "Urban heat island buffer with rich pollinator gardens.",
    hours: "7 AM - 9 PM",
    price: "Free",
    lat: 23.0245,
    lng: 72.5595,
    mapX: "25%",
    mapY: "70%",
  },
];

export default function Places() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const token = session?.access_token;
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = NEARBY_TRANSLATIONS[lang] || NEARBY_TRANSLATIONS.en;

  // Real-Time Live Geolocation Hook with watchPosition
  const {
    latitude: userLat,
    longitude: userLng,
    accuracy: userAccuracy,
    altitude: userAltitude,
    heading: userHeading,
    speed: userSpeed,
    timestamp: userTimestamp,
    hasLocation,
    status: locationStatus,
    permission: locationPermission,
    error: locationError,
    isWatching,
    isLocating,
    followUser,
    setFollowUser,
    lastUpdatedLabel,
    accuracyQuality,
    startWatching,
    stopWatching,
    locateMe,
    recalibrate,
  } = useLiveLocation({
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 20000,
    autoStart: true,
  });

  // Reverse Geocoded Locality Name
  const [locationAddress, setLocationAddress] = useState('Resolving location…');
  const [sortByDistance, setSortByDistance] = useState(false);
  const [mapCenterOverride, setMapCenterOverride] = useState(null);

  // Persistent State
  const [places, setPlaces] = useState(DEFAULT_TOP_PICKS);

  // Fetch dynamic places from backend MongoDB API and merge with DEFAULT_TOP_PICKS
  useEffect(() => {
    let mounted = true;
    apiFetch('/api/places')
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          const merged = data.map((apiItem) => ({
            ...apiItem,
            id: apiItem.id || apiItem._id,
            name: apiItem.name || apiItem.title || 'Ecological Sanctuary',
            category: apiItem.category || 'Park',
            image: apiItem.image || apiItem.image_url || '',
            description: apiItem.description || '',
            address: apiItem.address || apiItem.city || 'Oregon, USA',
            distance: apiItem.distance || '0.8 km',
            walkTime: apiItem.walkTime || '10 min walk',
            rating: apiItem.rating || 4.8,
            reviewsCount: apiItem.reviewsCount || apiItem.review_count || 120,
            isOpen: apiItem.isOpen !== undefined ? apiItem.isOpen : true,
          }));

          const combined = [...DEFAULT_TOP_PICKS];
          merged.forEach((item) => {
            if (!combined.some((c) => c.name.toLowerCase().includes(item.name.toLowerCase()))) {
              combined.push(item);
            }
          });
          setPlaces(combined);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch places:', err.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const [savedPlaceIds, setSavedPlaceIds] = useState([]);
  const [bookmarkError, setBookmarkError] = useState('');

  // Controls
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [activeTab, setActiveTab] = useState('radar');
  const [radarViewMode, setRadarViewMode] = useState('google_maps'); // Default to Live Google Maps
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [clickedCardId, setClickedCardId] = useState(null);
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');
  const [showAllPlacesModal, setShowAllPlacesModal] = useState(false);
  const [isBuildingRoute, setIsBuildingRoute] = useState(false);
  const [builtRoute, setBuiltRoute] = useState(null);

  // Reverse Geocode when real user GPS coordinates arrive
  useEffect(() => {
    if (userLat != null && userLng != null) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`)
        .then((r) => r.json())
        .then((data) => {
          if (data && data.address) {
            const locality =
              data.address.suburb ||
              data.address.neighbourhood ||
              data.address.residential ||
              data.address.city ||
              data.address.town ||
              'Current Locality';
            const city = data.address.city || data.address.state_district || data.address.state || '';
            setLocationAddress(`${locality}${city ? ', ' + city : ''}`);
          }
        })
        .catch(() => {
          setLocationAddress(`${userLat.toFixed(4)}°N, ${userLng.toFixed(4)}°E`);
        });
    }
  }, [userLat, userLng]);

  // Dynamically calculate and update real distance to all places whenever user location updates
  const dynamicPlaces = useMemo(() => {
    let list = places.map((p) => {
      if (hasLocation && p.lat != null && p.lng != null) {
        const realDistKm = calculateHaversineDistance(userLat, userLng, p.lat, p.lng);
        return {
          ...p,
          realDistanceKm: realDistKm,
          distance: formatDistance(realDistKm) || p.distance,
          walkTime: formatTravelTime(realDistKm, 'walk') || p.walkTime,
          driveTime: formatTravelTime(realDistKm, 'drive'),
        };
      }
      return p;
    });

    if (sortByDistance && hasLocation) {
      list.sort((a, b) => (a.realDistanceKm || 999) - (b.realDistanceKm || 999));
    }
    return list;
  }, [places, hasLocation, userLat, userLng, sortByDistance]);

  // Handle Locate Me Click
  const handleLocateMe = useCallback(async () => {
    try {
      const pos = await locateMe();
      if (pos && pos.latitude && pos.longitude) {
        setMapCenterOverride({ lat: pos.latitude, lng: pos.longitude, timestamp: Date.now() });
        setSelectedPlace(null);
      }
    } catch (e) {
      // Handled in hook
    }
  }, [locateMe]);



  // Load saved place bookmarks from the user profile (server-side)
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    apiFetch('/api/profile', {}, token)
      .then((p) => {
        if (mounted && Array.isArray(p?.saved_places)) {
          setSavedPlaceIds(p.saved_places);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [token]);

  // Toggle Save Bookmark (persisted to the profile via the API)
  const toggleSavePlace = (id, e) => {
    if (e) e.stopPropagation();
    setBookmarkError('');
    const next = savedPlaceIds.includes(id)
      ? savedPlaceIds.filter((p) => p !== id)
      : [...savedPlaceIds, id];
    setSavedPlaceIds(next);
    if (!token) {
      setBookmarkError('Sign in to save places. Your bookmark could not be stored.');
      return;
    }
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ saved_places: next }) }, token).catch(() => {
      setBookmarkError('Your bookmark could not be saved. Please check your connection and try again.');
    });
  };

  // Build Route
  const handleBuildRoute = () => {
    const routePlaces = dynamicPlaces.slice(0, 3);
    if (routePlaces.length === 0) {
      setBuiltRoute(null);
      return;
    }
    setIsBuildingRoute(true);
    const now = new Date();
    const timeString = (minsOffset) => {
      const d = new Date(now.getTime() + minsOffset * 60000);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };
    let cum = 0;
    const stops = routePlaces.map((p, i) => {
      const durWalk = p.realDistanceKm != null ? formatTravelTime(p.realDistanceKm, 'walk') : '15 min';
      const start = timeString(cum);
      const durMin = parseInt(durWalk) || 15;
      cum += durMin + 45;
      return {
        order: i + 1,
        name: p.name || p.title || 'Sanctuary Stop',
        time: `${start} - ${timeString(cum)}`,
        note: p.whyRecommend || `Visit ${p.name || 'this sanctuary'}.`,
      };
    });
    const totalWalk = routePlaces.reduce((s, p) => s + (p.realDistanceKm || 0), 0);
    setTimeout(() => {
      setBuiltRoute({
        title: `${routePlaces.length} Spot Eco-Discovery Route`,
        duration: `${Math.max(1, Math.round(cum / 60))} hr ${cum % 60} mins`,
        totalDistance: `${formatDistance(totalWalk)} total walking`,
        stops,
      });
      setIsBuildingRoute(false);
      setActiveTab('route');
    }, 1000);
  };

  // Filtered Places
  const filteredPlaces = dynamicPlaces.filter((p) => {
    if (selectedCategory !== 'All' && (p?.category || '') !== selectedCategory) return false;
    if (onlyOpenNow && !p?.isOpen) return false;
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = String(p?.name || p?.title || '').toLowerCase().includes(q);
      const matchCat = String(p?.category || '').toLowerCase().includes(q);
      const matchDesc = String(p?.description || '').toLowerCase().includes(q);
      const matchCity = String(p?.city || p?.address || '').toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchDesc && !matchCity) return false;
    }
    return true;
  });

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${
      isDark ? 'bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white' : 'bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900'
    }`}>
      
      {/* ──────────────── VIEW ALL PLACES MODAL DRAWER ──────────────── */}
      <AnimatePresence>
        {showAllPlacesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 sm:p-8 overflow-y-auto"
            onClick={() => setShowAllPlacesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`max-w-5xl mx-auto rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border transition-colors ${
                isDark ? 'bg-[#0E2015] border-[#4ADE80]/40 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-sm'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex justify-between items-center border-b pb-4 ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <div>
                  <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.allPlacesTitle}</h3>
                  <p className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.allPlacesSub}</p>
                </div>
                <button
                  onClick={() => setShowAllPlacesModal(false)}
                  aria-label="Close"
                  className={`p-2 rounded-full border cursor-pointer ${
                    isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28] hover:text-[#0F2418]'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => {
                  const isFlipped = flippedCardId === place.id;
                  const isSaved = savedPlaceIds.includes(place.id);
                  return (
                    <div
                      key={place.id}
                      className="perspective-1000 h-96 cursor-pointer"
                      onMouseEnter={() => { if (clickedCardId !== place.id) setFlippedCardId(place.id); }}
                      onMouseLeave={() => { if (clickedCardId !== place.id) setFlippedCardId(null); }}
                      onClick={() => {
                        if (clickedCardId === place.id) {
                          setClickedCardId(null);
                          setFlippedCardId(null);
                        } else {
                          setClickedCardId(place.id);
                          setFlippedCardId(place.id);
                        }
                      }}
                    >
                      <motion.div
                        className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                      >
                        <div className={`absolute inset-0 backface-hidden rounded-3xl overflow-hidden flex flex-col justify-between border ${
                          isDark ? 'bg-[#07150C] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-sm'
                        }`}>
                          <div className="relative h-44 overflow-hidden">
                            <FallbackImg src={place.image} alt={place.name} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#07130B]/80 backdrop-blur-md text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/40">
                              {place.icon} {place.category}
                            </span>
                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                              place.isOpen ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40' : 'bg-red-950/80 text-red-300 border-red-400/40'
                            }`}>
                              {place.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className={`font-display text-base font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{place.name}</h4>
                                <span className="text-xs text-amber-500 font-bold">★ {place.rating}</span>
                              </div>
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{place.address}</p>
                            </div>

                            <div className={`flex justify-between items-center pt-2 border-t ${
                              isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                            }`}>
                              <span className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{place.distance} · {place.walkTime}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSavePlace(place.id);
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                  isSaved
                                    ? isDark ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]' : 'bg-[#183B28] text-[#FAF7F0] border-[#183B28]'
                                    : isDark ? 'bg-[#13271C] text-slate-300 border-[#20422E]' : 'bg-[#EDE6D8] text-[#183B28] border-[#D4CBB8]'
                                }`}
                              >
                                {isSaved ? 'Bookmarked ✓' : 'Bookmark'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 flex flex-col justify-between border ${
                          isDark ? 'bg-[#112318] border-[#4ADE80]/50 text-slate-200' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] shadow-sm'
                        }`}>
                          <div className="space-y-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isDark ? 'bg-[#1A3827] text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28]'
                            }`}>
                              {t.whyAIRecommends}
                            </span>
                            <h4 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{place.name}</h4>
                            <p className={`text-xs italic leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#2D4536]'}`}>
                              "{place.whyRecommend}"
                            </p>
                          </div>

                          <div className={`pt-2 border-t flex justify-between items-center text-[10px] ${
                            isDark ? 'border-[#20422E] text-slate-400' : 'border-[#E0D8C8] text-[#3E5C48]'
                          }`}>
                            <span>Hours: {place.hours}</span>
                            <span className={`font-bold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>Price: {place.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">

        {bookmarkError && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-500 text-xs sm:text-sm rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <span>{bookmarkError}</span>
            <button onClick={() => setBookmarkError('')} className="text-red-500 hover:text-red-700 cursor-pointer shrink-0">✕</button>
          </div>
        )}
        
        {/* ──────────────── LANDSCAPE HERO BANNER ──────────────── */}
        <div className="relative border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[280px] flex flex-col justify-between group">
          
          {/* HD Sunset Mountain Pine Forest Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('/hero_background.png')` }}
          />

          {/* Dark Forest Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040C07] via-[#040C07]/85 to-[#040C07]/25" />

          {/* Top Compass Tag Row & Title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1A3827] border border-[#4ADE80]/50 flex items-center justify-center text-[#4ADE80]">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold text-[#4ADE80] uppercase tracking-widest">
                  {t.heroTag}
                </span>
                <div className="w-12 h-px bg-[#4ADE80]/40" />
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {t.heroTitle} <span className="text-[#4ADE80]">{t.heroHighlight}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow">
                {t.heroSubtitle}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLocateMe}
                disabled={isLocating}
                className={`px-5 py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
                  hasLocation
                    ? 'bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80] shadow-[#4ADE80]/20'
                    : 'bg-[#0E2015]/90 text-white border border-[#20452F] hover:border-[#4ADE80]/60'
                }`}
              >
                <Crosshair className={`w-4 h-4 text-[#4ADE80] ${isLocating ? 'animate-spin' : hasLocation ? 'animate-pulse' : ''}`} />
                <span>
                  {isLocating
                    ? 'Acquiring GPS Fix…'
                    : hasLocation
                    ? '📍 Locate Me'
                    : '📍 Enable Live GPS'}
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuildRoute}
                disabled={isBuildingRoute}
                className="px-6 py-3.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all shadow-xl shadow-[#4ADE80]/20 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isBuildingRoute ? 'Building Route…' : t.buildRouteBtn}</span>
              </motion.button>
            </div>
          </div>

          {/* Real-time GPS Error Notice */}
          {locationError && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>{locationError}</span>
              </div>
              <button
                onClick={handleLocateMe}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* ──────────────── SEARCH ROW ──────────────── */}
        <div className={`rounded-3xl p-6 space-y-4 shadow-xl border transition-colors ${
          isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
        }`}>
          <div className={`flex items-center gap-2 text-xs font-semibold border-l-2 pl-3 ${
            isDark ? 'text-slate-300 border-[#4ADE80]' : 'text-[#2D4536] border-[#183B28]'
          }`}>
            <span>{t.searchPromptTag}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setGoogleSearchQuery(searchQuery);
                    setRadarViewMode('google_maps');
                  }
                }}
                placeholder={t.askNearbyPlaceholder}
                className={`w-full rounded-2xl pl-11 pr-52 py-3.5 text-xs sm:text-sm outline-none transition-colors ${
                  isDark
                    ? 'bg-[#07150C] border border-[#20422E] text-white focus:border-[#4ADE80]'
                    : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setGoogleSearchQuery(searchQuery);
                    setRadarViewMode('google_maps');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Search</span>
                </button>
                <button
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                    isDark
                      ? 'bg-[#1A3827] border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#20452F]'
                      : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28] hover:bg-[#D4E8D2]'
                  }`}
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? t.locating : t.locateMe}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────── 4 TAB ICON CARDS ──────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'radar', title: t.tabRadarTitle, sub: t.tabRadarSub, icon: Radar },
            { id: 'compare', title: t.tabCompareTitle, sub: t.tabCompareSub, icon: Scale },
            { id: 'saved', title: `${t.tabSavedTitle} (${savedPlaceIds.length})`, sub: t.tabSavedSub, icon: Bookmark },
            { id: 'route', title: t.tabRouteTitle, sub: t.tabRouteSub, icon: Map },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 shadow-lg ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                      : 'bg-[#E1EFE0] border-[#183B28] text-[#0F2418] ring-1 ring-[#183B28] font-bold'
                    : isDark
                      ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
                      : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] hover:bg-[#F2ECE1]'
                }`}
              >
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-[#1A3827] border-[#4ADE80]/40 text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-display text-sm font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{tab.title}</h4>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{tab.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ──────────────── MAIN 2-COLUMN DISCOVERY GRID ──────────────── */}
        {activeTab === 'radar' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT 2-COLUMN: INTERACTIVE RADAR CANVAS / GOOGLE MAPS LIVE VIEW */}
              <div className={`lg:col-span-2 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between border transition-colors ${
                isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
              }`}>
                
                {/* View Mode Toggle Header */}
                <div className={`flex items-center justify-between pb-3 border-b z-20 relative ${
                  isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                }`}>
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                      {radarViewMode === 'radar' ? 'Spatial Radar Compass' : 'Live Google Map View'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
            <button
                      onClick={handleLocateMe}
                      disabled={isLocating}
                      className={`px-2.5 py-1 rounded-full border font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? 'bg-[#13271C] border-[#4ADE80]/50 text-[#4ADE80] hover:bg-[#4ADE80] hover:text-[#07130B]'
                          : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28] hover:bg-[#D4EAD3]'
                      }`}
                      title="Center on user GPS position"
                    >
                      <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>Locate Me</span>
                    </button>

                    <div className={`flex items-center gap-1.5 border p-1 rounded-full text-xs ${
                      isDark ? 'bg-[#07150C] border-[#20422E]' : 'bg-[#EDE6D8] border-[#D4CBB8]'
                    }`}>
                      <button
                        onClick={() => setRadarViewMode('radar')}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          radarViewMode === 'radar'
                            ? isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0]'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
                        }`}
                      >
                        📡 Radar
                      </button>
                      <button
                        onClick={() => setRadarViewMode('google_maps')}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          radarViewMode === 'google_maps'
                            ? isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0]'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'
                        }`}
                      >
                        🗺️ Google Maps
                      </button>
                    </div>
                  </div>
                </div>

                {radarViewMode === 'google_maps' ? (
                  <div className={`relative w-full h-[430px] rounded-2xl overflow-hidden border my-3 shadow-2xl ${
                    isDark ? 'bg-[#07150C] border-[#20422E]' : 'bg-[#EDE6D8] border-[#D4CBB8]'
                  }`}>
                    <iframe
                      title="Google Maps Nearby Discovery"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: '430px' }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        selectedPlace 
                          ? `${selectedPlace.name}, ${selectedPlace.address || selectedPlace.city || 'Ahmedabad'}`
                          : mapCenterOverride
                          ? `${mapCenterOverride.lat},${mapCenterOverride.lng}`
                          : hasLocation
                          ? `${userLat},${userLng}`
                          : googleSearchQuery.trim() 
                          ? `${googleSearchQuery}, Ahmedabad`
                          : 'Sabarmati Riverfront Park, Ahmedabad'
                      )}&t=&z=${selectedPlace ? 16 : hasLocation ? 16 : 14}&ie=UTF8&iwloc=&output=embed`}
                    />
                    
                    {/* Active Selected Pin */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md border border-emerald-400/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-2 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        {selectedPlace
                          ? `Focused Spot: ${selectedPlace.name}`
                          : hasLocation
                          ? `Live GPS: ${locationAddress} (±${userAccuracy || 10}m)`
                          : 'Live Discovery Map'}
                      </span>
                    </div>

                    {/* Quick Centering Button */}
                    {hasLocation && (
                      <button
                        onClick={handleLocateMe}
                        className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-emerald-400 border border-emerald-400/60 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>Re-center Me</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-[400px]">
                    <svg viewBox="0 0 700 400" className="absolute inset-0 w-full h-full pointer-events-none">
                      <circle cx="350" cy="220" r="70" stroke={isDark ? "#20422E" : "#D4CBB8"} strokeWidth="1" strokeDasharray="4" fill="none" />
                      <circle cx="350" cy="220" r="140" stroke={isDark ? "#20422E" : "#D4CBB8"} strokeWidth="1" strokeDasharray="4" fill="none" />
                      <circle cx="350" cy="220" r="210" stroke={isDark ? "#20422E" : "#D4CBB8"} strokeWidth="1" strokeDasharray="4" fill="none" />
                      <line x1="350" y1="220" x2="600" y2="90" stroke={isDark ? "#4ADE80" : "#183B28"} strokeWidth="1.5" opacity="0.4" />
                    </svg>

                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className={`absolute left-1/2 top-3/5 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center text-center shadow-2xl z-20 cursor-pointer ${
                        isDark ? 'bg-gradient-to-br from-[#2E6141] to-[#040B06] border-[#4ADE80]' : 'bg-[#183B28] border-[#0F2418]'
                      }`}
                      onClick={handleLocateMe}
                      title={hasLocation ? `Current GPS: ${userLat?.toFixed(4)}°, ${userLng?.toFixed(4)}° (±${userAccuracy}m)` : 'Click to acquire GPS'}
                    >
                      <Navigation className={`w-5 h-5 text-white ${hasLocation ? 'rotate-45' : ''}`} />
                      <span className="text-[9px] font-bold text-white tracking-widest uppercase">
                        {hasLocation ? 'GPS' : 'YOU'}
                      </span>
                    </motion.div>

                    {filteredPlaces.map((place) => {
                      const isSelected = selectedPlace?.id === place.id;
                      return (
                        <motion.div
                          key={place.id}
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedPlace(place)}
                          style={{ left: place.mapX, top: place.mapY }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer shadow-xl z-20 flex items-center gap-2.5 ${
                            isSelected
                              ? isDark
                                ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-[#4ADE80]/30 scale-105'
                                : 'bg-[#183B28] border-[#0F2418] text-[#FAF7F0] shadow-lg scale-105'
                              : isDark
                                ? 'bg-[#07150C]/95 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/50'
                                : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] hover:border-[#183B28]'
                          }`}
                        >
                          <span className="text-base">{place.icon}</span>
                          <div>
                            <p className="text-xs font-bold whitespace-nowrap">{place.name}</p>
                            <p className={`text-[10px] font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{place.distance}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                <div className={`flex items-center gap-2 overflow-x-auto pt-3 border-t text-xs ${
                  isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                }`}>
                  {[
                    { label: 'Study Spots', icon: GraduationCap },
                    { label: 'Cafés', icon: Coffee },
                    { label: 'Parks', icon: Trees },
                    { label: 'Culture', icon: Landmark },
                    { label: 'Nature', icon: Leaf },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => setSelectedCategory(item.label === 'Study Spots' ? 'Study' : item.label)}
                        className={`px-3.5 py-1.5 rounded-xl border font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          isDark ? 'bg-[#07150C] border-[#20422E] text-[#4ADE80] hover:bg-[#13271C]' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28] hover:bg-[#E3DDD1]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* RIGHT COLUMN: TOP PICKS NEARBY */}
              <div className={`rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between border transition-colors ${
                isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
              }`}>
                
                <div className="space-y-4">
                  <div className={`flex items-center gap-2 border-b pb-3 ${
                    isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                  }`}>
                    <Leaf className="w-5 h-5 text-[#4ADE80] shrink-0" />
                    <h3 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.topPicksTitle}</h3>
                  </div>

                  <div className="space-y-3">
                    {places.slice(0, 3).map((pick) => (
                      <div
                        key={pick.id}
                        onClick={() => setSelectedPlace(pick)}
                        className={`p-3 rounded-2xl flex items-center justify-between border transition-all cursor-pointer ${
                          isDark ? 'bg-[#07150C] border-[#20422E] hover:border-[#4ADE80]/40' : 'bg-[#F2ECE1] border-[#E0D8C8] hover:border-[#183B28]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FallbackImg src={pick.image} alt={pick.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h4 className={`font-display text-xs font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{pick.name}</h4>
                            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>{pick.category} · {pick.distance}</p>
                          </div>
                        </div>

                        <span className="text-xs font-extrabold text-amber-500">★ {pick.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAllPlacesModal(true)}
                  className={`w-full py-3.5 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isDark
                      ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80] hover:text-[#07130B]'
                      : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28] hover:bg-[#D4EAD3]'
                  }`}
                >
                  <span>{t.viewAllBtn}</span>
                </motion.button>

              </div>

            </div>

            {/* ──────────────── EXTENDED DEEP CATALOG SECTION ──────────────── */}
            <div className={`rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl border transition-colors ${
              isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
            }`}>
              <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <div>
                  <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.allPlacesTitle}</h3>
                  <p className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.allPlacesSub}</p>
                </div>
                <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>7 Verified Habitats</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dynamicPlaces.map((place) => {
                  const isFlipped = flippedCardId === place.id;
                  const isSaved = savedPlaceIds.includes(place.id);

                  return (
                    <div
                      key={place.id}
                      className="perspective-1000 h-96 cursor-pointer"
                      onMouseEnter={() => { if (clickedCardId !== place.id) setFlippedCardId(place.id); }}
                      onMouseLeave={() => { if (clickedCardId !== place.id) setFlippedCardId(null); }}
                      onClick={() => {
                        if (clickedCardId === place.id) {
                          setClickedCardId(null);
                          setFlippedCardId(null);
                        } else {
                          setClickedCardId(place.id);
                          setFlippedCardId(place.id);
                        }
                      }}
                    >
                      <motion.div
                        className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                      >
                        <div className={`absolute inset-0 backface-hidden rounded-3xl overflow-hidden flex flex-col justify-between border ${
                          isDark ? 'bg-[#07150C] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-sm'
                        }`}>
                          <div className="relative h-44 overflow-hidden">
                            <FallbackImg src={place.image} alt={place.name} className="w-full h-full object-cover" />
                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#07130B]/80 backdrop-blur-md text-[10px] font-bold text-[#4ADE80] border border-[#4ADE80]/40">
                              {place.icon} {place.category}
                            </span>
                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                              place.isOpen ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40' : 'bg-red-950/80 text-red-300 border-red-400/40'
                            }`}>
                              {place.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                            </span>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className={`font-display text-base font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{place.name}</h4>
                                <span className="text-xs text-amber-500 font-bold">★ {place.rating}</span>
                              </div>
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{place.address}</p>
                            </div>

                            <div className={`flex justify-between items-center pt-2 border-t ${
                              isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                            }`}>
                              <span className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{place.distance} · {place.walkTime}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSavePlace(place.id);
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                  isSaved
                                    ? isDark ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]' : 'bg-[#183B28] text-[#FAF7F0] border-[#183B28]'
                                    : isDark ? 'bg-[#13271C] text-slate-300 border-[#20422E]' : 'bg-[#EDE6D8] text-[#183B28] border-[#D4CBB8]'
                                }`}
                              >
                                {isSaved ? 'Bookmarked ✓' : 'Bookmark'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 flex flex-col justify-between border ${
                          isDark ? 'bg-[#112318] border-[#4ADE80]/50 text-slate-200' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] shadow-sm'
                        }`}>
                          <div className="space-y-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isDark ? 'bg-[#1A3827] text-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28]'
                            }`}>
                              {t.whyAIRecommends}
                            </span>
                            <h4 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{place.name}</h4>
                            <p className={`text-xs italic leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#2D4536]'}`}>
                              "{place.whyRecommend}"
                            </p>
                          </div>

                          <div className={`pt-2 border-t flex justify-between items-center text-[10px] ${
                            isDark ? 'border-[#20422E] text-slate-400' : 'border-[#E0D8C8] text-[#3E5C48]'
                          }`}>
                            <span>Hours: {place.hours}</span>
                            <span className={`font-bold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>Price: {place.price}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ──────────────── TAB 2: PLACE COMPARISON ──────────────── */}
        {activeTab === 'compare' && (
          <div className={`border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl ${
            isDark ? 'bg-[#0E2015] border-[#20452F] text-slate-100' : 'bg-white border-emerald-900/15 text-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 border-emerald-950/15">
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Place Comparison Matrix</h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`}>Compare quietness, canopy shade, seating & distance across top spots</p>
              </div>
              <span className="text-xs font-mono text-slate-400">Side-by-Side Analysis</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className={`border-b text-xs uppercase tracking-wider ${isDark ? 'border-[#20422E] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="py-3 px-4">Place Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4">Shade Canopy</th>
                    <th className="py-3 px-4">Quiet Score</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/10 text-xs sm:text-sm">
                  {dynamicPlaces.slice(0, 5).map((p) => (
                    <tr key={p.id} className={isDark ? 'hover:bg-[#13271C]/50' : 'hover:bg-emerald-50/50'}>
                      <td className="py-3.5 px-4 font-bold">{p.name}</td>
                      <td className="py-3.5 px-4">{p.category}</td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">★ {p.rating}</td>
                      <td className="py-3.5 px-4">{p.distance || '1.2 km'}</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-500">Dense Canopy 🌳</td>
                      <td className="py-3.5 px-4 font-mono">92/100 🤫</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.isOpen ? 'bg-emerald-900/40 text-emerald-400' : 'bg-rose-900/40 text-rose-400'
                        }`}>
                          {p.isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 3: SAVED PLACES ──────────────── */}
        {activeTab === 'saved' && (
          <div className={`border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl ${
            isDark ? 'bg-[#0E2015] border-[#20452F] text-slate-100' : 'bg-white border-emerald-900/15 text-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 border-emerald-950/15">
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>My Saved Places Collection</h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-emerald-700'}`}>{savedPlaceIds.length} bookmarked nature sanctuaries & quiet study spots</p>
              </div>
            </div>

            {savedPlaceIds.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-4xl">🔖</p>
                <h4 className="font-display text-lg font-bold">No Bookmarked Places Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "Bookmark" on any discovery card to save your favorite quiet study spots and nature parks here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dynamicPlaces.filter((p) => savedPlaceIds.includes(p.id)).map((place) => (
                  <div key={place.id} className={`rounded-3xl border overflow-hidden p-4 space-y-3 ${
                    isDark ? 'bg-[#07150C] border-[#20422E]' : 'bg-[#F4F7F4] border-slate-200'
                  }`}>
                    <FallbackImg src={place.image} alt="" className="w-full h-36 object-cover rounded-2xl" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">{place.name}</h4>
                      <p className="text-xs text-slate-400">{place.category} · {place.address}</p>
                    </div>
                    <button
                      onClick={() => toggleSavePlace(place.id)}
                      className="w-full py-2 rounded-xl bg-rose-900/30 text-rose-400 hover:bg-rose-900/50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Remove Bookmark
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 4: DISCOVERY ROUTE ──────────────── */}
        {activeTab === 'route' && builtRoute && (
          <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${
            isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${
              isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
            }`}>
              <div>
                <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{builtRoute.title}</h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>Total Duration: {builtRoute.duration}</p>
              </div>
            </div>

            <div className="space-y-4">
              {builtRoute.stops.map((stop) => (
                <div key={stop.order} className={`p-5 rounded-2xl flex items-start gap-4 border ${
                  isDark ? 'bg-[#07150C] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                }`}>
                  <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDark ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28]'
                  }`}>
                    0{stop.order}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{stop.name}</h4>
                      <span className={`text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{stop.time}</span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{stop.note}</p>
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
