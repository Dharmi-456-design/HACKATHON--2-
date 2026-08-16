import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Compass, MapPin, Search, Clock, Star, Navigation, 
  ChevronRight, Filter, Plus, Trash2, CheckCircle2, Shield, User, 
  Coffee, BookOpen, Trees, Palette, ShoppingBag, Utensils, Landmark, 
  HelpCircle, Eye, EyeOff, X, ArrowRight, Radio, Layers, RotateCcw, Send, Check,
  Activity, Gauge, Crosshair, Map, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { useLiveLocation, calculateHaversineDistance, formatDistance, formatTravelTime } from '../hooks/useLiveLocation';

// Multilingual UI Translations for Nearby Discovery Engine
const NEARBY_TRANSLATIONS = {
  en: {
    heroTag: 'SPATIAL DISCOVERY COMPASS',
    heroTitle: 'Discover What Is Around',
    heroHighlight: 'You ✨',
    heroSubtitle: 'Spatial discovery for quiet study spots, nature sanctuaries, local cafés, and cultural places with real-time GPS precision.',
    searchPromptTag: 'Find places that inspire your journey',
    askNearbyPlaceholder: 'Search nearby (e.g. Find a quiet place to study nearby…)',
    searchBtn: 'Search Radar',
    radiusLabel: 'Discovery Radius:',
    openNowFilter: 'Open Now Only',
    comparePlacesBtn: 'Compare Places',
    buildRouteBtn: '✨ Build Afternoon Route →',
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
    topPicksTitle: '🌿 Top Picks Nearby',
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

// Seed Real Local Discoveries (7 Total Places)
const SEED_NEARBY_PLACES = [
  {
    id: 'p-1',
    name: 'Peepal Canopy Study Sanctuary',
    category: 'Study',
    icon: '🎓',
    lat: 23.0304,
    lng: 72.5802,
    distance: '450 m',
    walkTime: '6 min walk',
    rating: 4.9,
    isOpen: true,
    hours: '7:00 AM - 9:00 PM',
    address: 'Sabarmati Riverfront Park, Block B',
    city: 'Ahmedabad',
    mapX: 220,
    mapY: 280,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'High quietness score (94%), shade canopy, open now, within 6 min walk.',
    price: 'Free',
  },
  {
    id: 'p-2',
    name: 'Sunset Hill Café',
    category: 'Cafés',
    icon: '☕',
    lat: 23.0270,
    lng: 72.5560,
    distance: '1.3 km',
    walkTime: '12 min walk',
    rating: 4.8,
    isOpen: true,
    hours: '8:00 AM - 10:00 PM',
    address: 'Law Garden Road, Opposite Museum',
    city: 'Ahmedabad',
    mapX: 520,
    mapY: 310,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Organic herbal tea, outdoor seating under banyan shade, strong Wi-Fi.',
    price: '$$',
  },
  {
    id: 'p-3',
    name: 'Heritage Textiles & Art Pavilion',
    category: 'Culture',
    icon: '🏛️',
    lat: 23.0258,
    lng: 72.5873,
    distance: '2.1 km',
    walkTime: '8 min drive',
    rating: 4.7,
    isOpen: false,
    hours: 'Opens tomorrow 10:00 AM',
    address: 'Old City Cultural Promenade',
    city: 'Ahmedabad',
    mapX: 440,
    mapY: 140,
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Traditional indigo dye exhibitions and historic architecture.',
    price: '$',
  },
  {
    id: 'p-4',
    name: 'Whispering Woods Nature Reserve',
    category: 'Parks',
    icon: '🌲',
    lat: 23.0410,
    lng: 72.5690,
    distance: '0.8 km',
    walkTime: '10 min walk',
    rating: 4.7,
    isOpen: true,
    hours: '6:00 AM - 8:00 PM',
    address: 'Eco Park North Sector',
    city: 'Ahmedabad',
    mapX: 300,
    mapY: 120,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Dense pine tree canopy with shaded reading benches and birdsong.',
    price: 'Free',
  },
  {
    id: 'p-5',
    name: 'Green Brew Organic Roastery',
    category: 'Cafés',
    icon: '☕',
    lat: 23.0350,
    lng: 72.5450,
    distance: '1.1 km',
    walkTime: '14 min walk',
    rating: 4.6,
    isOpen: true,
    hours: '8:00 AM - 9:00 PM',
    address: 'University Road Block 4',
    city: 'Ahmedabad',
    mapX: 180,
    mapY: 340,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Zero-waste coffee beans, solar-powered espresso, quiet balcony seating.',
    price: '$$',
  },
  {
    id: 'p-6',
    name: 'Lotus Lake Botanical Park',
    category: 'Parks',
    icon: '🌲',
    lat: 22.9970,
    lng: 72.6025,
    distance: '1.6 km',
    walkTime: '20 min walk',
    rating: 4.8,
    isOpen: true,
    hours: '5:30 AM - 7:30 PM',
    address: 'East City Wetland Corridor',
    city: 'Ahmedabad',
    mapX: 580,
    mapY: 200,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Beautiful lotus flower pond with migratory bird watching deck.',
    price: 'Free',
  },
  {
    id: 'p-7',
    name: 'Banyan Tree Quiet Reading Nook',
    category: 'Study',
    icon: '🎓',
    lat: 23.0330,
    lng: 72.5620,
    distance: '650 m',
    walkTime: '8 min walk',
    rating: 4.9,
    isOpen: true,
    hours: '24 Hours',
    address: 'Central Library Courtyard',
    city: 'Ahmedabad',
    mapX: 380,
    mapY: 260,
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    whyRecommend: 'Open 24/7, high-speed Wi-Fi, shaded courtyard under 100-year-old banyan.',
    price: 'Free',
  },
];

export default function Places() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
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
      return saved ? JSON.parse(saved) : ['p-1', 'p-4'];
    } catch {
      return ['p-1', 'p-4'];
    }
  });

  // Controls
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [activeTab, setActiveTab] = useState('radar');
  const [radarViewMode, setRadarViewMode] = useState('google_maps'); // Default to Live Google Maps
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [flippedCardId, setFlippedCardId] = useState(null);
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
          { order: 1, name: 'Peepal Canopy Study Sanctuary', time: '1:00 PM - 1:45 PM', note: 'Start with quiet study under Peepal shade.' },
          { order: 2, name: 'Sunset Hill Café', time: '1:50 PM - 2:30 PM', note: 'Coffee break & organic herbal tea.' },
          { order: 3, name: 'Heritage Textiles Pavilion', time: '2:35 PM - 3:15 PM', note: 'Cultural art tour.' },
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
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24 relative overflow-hidden">
      
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
              className="max-w-5xl mx-auto bg-[#0E2015] border border-[#4ADE80]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#20452F] pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">{t.allPlacesTitle}</h3>
                  <p className="text-xs text-[#4ADE80] font-semibold">{t.allPlacesSub}</p>
                </div>
                <button
                  onClick={() => setShowAllPlacesModal(false)}
                  className="p-2 rounded-full bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white cursor-pointer"
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
                      onMouseEnter={() => setFlippedCardId(place.id)}
                      onMouseLeave={() => setFlippedCardId(null)}
                    >
                      <motion.div
                        className="w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                      >
                        <div className="absolute inset-0 backface-hidden bg-[#07150C] border border-[#20452F] rounded-3xl overflow-hidden flex flex-col justify-between">
                          <div className="relative h-44 overflow-hidden">
                            <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
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
                                <h4 className="font-display text-base font-bold text-white line-clamp-1">{place.name}</h4>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10">
        
        {/* ──────────────── LANDSCAPE HERO BANNER WITH PRESERVED SUNSET MOUNTAIN BACKGROUND & FLIGHT TRAILS ──────────────── */}
        <div className="relative border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[280px] flex flex-col justify-between group">
          
          {/* PRESERVED HD Sunset Mountain Pine Forest Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')` }}
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

            {/* Action Buttons: Live Location & Build Afternoon Route */}
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

          {/* Real-time GPS Error Notice if Permission Denied or Timeout */}
          {locationError && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>{locationError}</span>
              </div>
              <button
                onClick={handleLocateMe}
                className="px-4 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white font-bold transition-colors cursor-pointer shrink-0"
              >
                Retry GPS
              </button>
            </div>
          )}

        </div>

        {/* ──────────────── REAL-TIME GPS TELEMETRY & ACCURACY DASHBOARD ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20422E] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#13271C] border border-[#4ADE80]/40 flex items-center justify-center text-[#4ADE80]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm sm:text-base font-bold text-white">
                    Live GPS Telemetry & Accuracy
                  </h3>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    hasLocation
                      ? 'bg-emerald-950/80 text-[#4ADE80] border-[#4ADE80]/40'
                      : isLocating
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${hasLocation ? 'bg-[#4ADE80] animate-ping' : isLocating ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
                    {hasLocation ? 'LIVE GPS ACTIVE' : isLocating ? 'ACQUIRING FIX' : 'GPS STANDBY'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {locationAddress}
                </p>
              </div>
            </div>

            {/* Top Right Controls: Follow Mode & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFollowUser((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  followUser
                    ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]'
                    : 'bg-[#07150C] text-slate-400 border-[#20422E] hover:text-white'
                }`}
                title="Automatically pan the map as your GPS position moves"
              >
                <Radio className={`w-3.5 h-3.5 ${followUser ? 'animate-pulse text-[#4ADE80]' : ''}`} />
                <span>Follow Me: {followUser ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setSortByDistance((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  sortByDistance
                    ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]'
                    : 'bg-[#07150C] text-slate-400 border-[#20422E] hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Sort by Closest</span>
              </button>

              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="p-2 rounded-xl bg-[#13271C] border border-[#20422E] hover:border-[#4ADE80]/50 text-[#4ADE80] transition-colors cursor-pointer"
                title="Recalibrate / Center GPS"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Latitude */}
            <div className="p-3 rounded-2xl bg-[#07150C] border border-[#20422E] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Latitude</span>
              <p className="font-mono text-xs sm:text-sm font-bold text-white">
                {userLat != null ? `${userLat.toFixed(6)}°` : '—'}
              </p>
            </div>

            {/* Longitude */}
            <div className="p-3 rounded-2xl bg-[#07150C] border border-[#20422E] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Longitude</span>
              <p className="font-mono text-xs sm:text-sm font-bold text-white">
                {userLng != null ? `${userLng.toFixed(6)}°` : '—'}
              </p>
            </div>

            {/* GPS Accuracy */}
            <div className="p-3 rounded-2xl bg-[#07150C] border border-[#20422E] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
                {accuracyQuality && (
                  <span className={`text-[9px] font-extrabold text-${accuracyQuality.color}-400`}>
                    {accuracyQuality.level}
                  </span>
                )}
              </div>
              <p className="font-mono text-xs sm:text-sm font-bold text-[#4ADE80]">
                {userAccuracy != null ? `±${userAccuracy} m` : '—'}
              </p>
            </div>

            {/* Speed & Heading / Last Updated */}
            <div className="p-3 rounded-2xl bg-[#07150C] border border-[#20422E] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Telemetry Feed</span>
              <p className="font-mono text-xs sm:text-sm font-bold text-slate-200">
                {userSpeed != null ? `${userSpeed} km/h` : lastUpdatedLabel}
              </p>
            </div>
          </div>
        </div>

        {/* ──────────────── SEARCH ROW WITH PROMPT TAG (2ND SCREENSHOT MATCH) ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 border-l-2 border-[#4ADE80] pl-3">
            <span>{t.searchPromptTag}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.askNearbyPlaceholder}
                className="w-full bg-[#07150C] border border-[#20422E] rounded-2xl pl-11 pr-28 py-3.5 text-xs sm:text-sm text-white outline-none focus:border-[#4ADE80]"
              />
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#13271C] border border-[#20422E] hover:border-[#4ADE80]/60 text-[11px] font-bold text-[#4ADE80] flex items-center gap-1.5 cursor-pointer transition-all"
                title="Locate me & center map"
              >
                <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{hasLocation ? 'LOCATED' : 'LOCATE'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#07150C] border border-[#20422E] shrink-0">
              <button
                onClick={() => setOnlyOpenNow((v) => !v)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  onlyOpenNow ? 'bg-[#4ADE80]' : 'bg-[#13271C]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  onlyOpenNow ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
              <span className="text-xs font-semibold text-slate-300">{t.openNowFilter}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {['All', 'Study', 'Cafés', 'Parks', 'Culture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]'
                    : 'bg-[#07150C] border-[#20422E] text-slate-300 hover:bg-[#13271C]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ──────────────── 4 CIRCULAR TAB ICON CARDS (2ND SCREENSHOT MATCH) ──────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'radar', title: t.tabRadarTitle, sub: t.tabRadarSub, icon: '🎯' },
            { id: 'compare', title: t.tabCompareTitle, sub: t.tabCompareSub, icon: '⚖️' },
            { id: 'saved', title: `${t.tabSavedTitle} (${savedPlaceIds.length})`, sub: t.tabSavedSub, icon: '🔖' },
            { id: 'route', title: t.tabRouteTitle, sub: t.tabRouteSub, icon: '🗺️' },
          ].map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 shadow-lg ${
                activeTab === tab.id
                  ? 'bg-[#132B1C] border-[#4ADE80] ring-1 ring-[#4ADE80]/50'
                  : 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#1A3827] border border-[#4ADE80]/40 flex items-center justify-center text-lg shrink-0">
                {tab.icon}
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-white">{tab.title}</h4>
                <p className="text-[11px] text-slate-400">{tab.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ──────────────── MAIN 2-COLUMN DISCOVERY GRID ──────────────── */}
        {activeTab === 'radar' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT 2-COLUMN: INTERACTIVE RADAR CANVAS / GOOGLE MAPS LIVE VIEW */}
              <div className="lg:col-span-2 bg-[#0E2015] border border-[#20452F] rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
                
                {/* View Mode Toggle Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#20422E] z-20 relative">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#4ADE80]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {radarViewMode === 'radar' ? 'Spatial Radar Compass' : 'Live Google Map View'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLocateMe}
                      disabled={isLocating}
                      className="px-2.5 py-1 rounded-full bg-[#13271C] border border-[#4ADE80]/50 text-[#4ADE80] font-bold text-[11px] hover:bg-[#4ADE80] hover:text-[#07130B] transition-all flex items-center gap-1 cursor-pointer"
                      title="Center on user GPS position"
                    >
                      <Crosshair className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>Locate Me</span>
                    </button>

                    <div className="flex items-center gap-1.5 bg-[#07150C] border border-[#20422E] p-1 rounded-full text-xs">
                      <button
                        onClick={() => setRadarViewMode('radar')}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          radarViewMode === 'radar'
                            ? 'bg-[#4ADE80] text-[#07130B]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        📡 Radar
                      </button>
                      <button
                        onClick={() => setRadarViewMode('google_maps')}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          radarViewMode === 'google_maps'
                            ? 'bg-[#4ADE80] text-[#07130B]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        🗺️ Google Maps
                      </button>
                    </div>
                  </div>
                </div>

                {radarViewMode === 'google_maps' ? (
                  <div className="relative w-full h-[430px] rounded-2xl overflow-hidden border border-[#20422E] my-3 shadow-2xl bg-[#07150C]">
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
                          : searchQuery.trim() 
                          ? `${searchQuery}, Ahmedabad`
                          : 'Sabarmati Riverfront Park, Ahmedabad'
                      )}&t=&z=${selectedPlace ? 16 : hasLocation ? 16 : 14}&ie=UTF8&iwloc=&output=embed`}
                    />
                    
                    {/* Active Selected Pin or Live GPS Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-[#07130B]/90 backdrop-blur-md border border-[#4ADE80]/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-2 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
                      <span>
                        {selectedPlace
                          ? `Focused Spot: ${selectedPlace.name}`
                          : hasLocation
                          ? `Live GPS: ${locationAddress} (±${userAccuracy || 10}m)`
                          : 'Live Discovery Map'}
                      </span>
                    </div>

                    {/* Quick Centering Button on Map */}
                    {hasLocation && (
                      <button
                        onClick={handleLocateMe}
                        className="absolute bottom-3 right-3 bg-[#0E2015]/90 hover:bg-[#13271C] text-[#4ADE80] border border-[#4ADE80]/60 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>Re-center Me</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-[400px]">
                    <svg viewBox="0 0 700 400" className="absolute inset-0 w-full h-full pointer-events-none">
                      <circle cx="350" cy="220" r="70" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                      <circle cx="350" cy="220" r="140" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                      <circle cx="350" cy="220" r="210" stroke="#20422E" strokeWidth="1" strokeDasharray="4" fill="none" />
                      <line x1="350" y1="220" x2="600" y2="90" stroke="#4ADE80" strokeWidth="1.5" opacity="0.4" />
                    </svg>

                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-1/2 top-3/5 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#2E6141] to-[#040B06] border-2 border-[#4ADE80] flex flex-col items-center justify-center text-center shadow-2xl z-20 cursor-pointer"
                      onClick={handleLocateMe}
                      title={hasLocation ? `Current GPS: ${userLat?.toFixed(4)}°, ${userLng?.toFixed(4)}° (±${userAccuracy}m)` : 'Click to acquire GPS'}
                    >
                      <Navigation className={`w-5 h-5 text-[#4ADE80] ${hasLocation ? 'rotate-45' : ''}`} />
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
                              ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-[#4ADE80]/30 scale-105'
                              : 'bg-[#07150C]/95 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/50'
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
                )}

                <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#20422E] text-xs">
                  {[
                    { label: 'Study Spots', icon: '🎓' },
                    { label: 'Cafés', icon: '☕' },
                    { label: 'Parks', icon: '🌲' },
                    { label: 'Culture', icon: '🏛️' },
                    { label: 'Nature', icon: '🌿' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setSelectedCategory(item.label === 'Study Spots' ? 'Study' : item.label)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#07150C] border border-[#20422E] text-[#4ADE80] font-semibold text-[11px] flex items-center gap-1.5 hover:bg-[#13271C] cursor-pointer whitespace-nowrap"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

              </div>

              {/* RIGHT COLUMN: 🌿 TOP PICKS NEARBY */}
              <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-5 space-y-4 shadow-2xl flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#20452F] pb-3">
                    <span className="text-lg">🌿</span>
                    <h3 className="font-display text-base font-bold text-white">{t.topPicksTitle}</h3>
                  </div>

                  <div className="space-y-3">
                    {places.slice(0, 3).map((pick) => (
                      <div
                        key={pick.id}
                        onClick={() => setSelectedPlace(pick)}
                        className="bg-[#07150C] border border-[#20422E] p-3 rounded-2xl flex items-center justify-between hover:border-[#4ADE80]/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img src={pick.image} alt={pick.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h4 className="font-display text-xs font-bold text-white line-clamp-1">{pick.name}</h4>
                            <p className="text-[10px] text-slate-400">{pick.category} · {pick.distance}</p>
                          </div>
                        </div>

                        <span className="text-xs font-extrabold text-amber-400">★ {pick.rating}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAllPlacesModal(true)}
                  className="w-full py-3.5 rounded-2xl bg-[#1A3827] border border-[#4ADE80] text-[#4ADE80] font-bold text-xs hover:bg-[#4ADE80] hover:text-[#07130B] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4ADE80]/10"
                >
                  <span>{t.viewAllBtn}</span>
                </motion.button>

              </div>

            </div>

            {/* ──────────────── EXTENDED DEEP CATALOG SECTION ──────────────── */}
            <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#20452F] pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white">{t.allPlacesTitle}</h3>
                  <p className="text-xs text-[#4ADE80] font-semibold">{t.allPlacesSub}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">7 Verified Habitats</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dynamicPlaces.map((place) => {
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
                        <div className="absolute inset-0 backface-hidden bg-[#07150C] border border-[#20452F] rounded-3xl overflow-hidden flex flex-col justify-between">
                          <div className="relative h-44 overflow-hidden">
                            <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
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
                                <h4 className="font-display text-base font-bold text-white line-clamp-1">{place.name}</h4>
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

          </div>
        )}

        {/* ──────────────── TAB 4: DISCOVERY ROUTE ──────────────── */}
        {activeTab === 'route' && builtRoute && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#20452F] pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-white">{builtRoute.title}</h3>
                <p className="text-xs text-[#4ADE80] font-semibold">Total Duration: {builtRoute.duration}</p>
              </div>
            </div>

            <div className="space-y-4">
              {builtRoute.stops.map((stop) => (
                <div key={stop.order} className="bg-[#07150C] border border-[#20422E] p-5 rounded-2xl flex items-start gap-4">
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
