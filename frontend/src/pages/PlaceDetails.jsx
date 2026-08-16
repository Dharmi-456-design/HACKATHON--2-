import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, Star, Navigation, Compass, Share2, 
  Bookmark, Sparkles, CheckCircle2, ExternalLink, Shield, Info, 
  Calendar, Wifi, Trees, Coffee, VolumeX, Heart, Layers, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

// Seed Real Local Discoveries with rich fallback data
export const SEED_NEARBY_PLACES = [
  {
    id: 'p-1',
    name: 'Peepal Canopy Study Sanctuary',
    category: 'Study',
    icon: '📚',
    distance: '450 m',
    walkTime: '6 min walk',
    rating: 4.9,
    reviewsCount: 128,
    isOpen: true,
    hours: '7:00 AM - 9:00 PM',
    address: 'Sabarmati Riverfront Park, Block B',
    city: 'Ahmedabad',
    region: 'Gujarat',
    habitat: 'Riverfront Green Canopy & Shaded Botanical Study Zone',
    mapX: 320,
    mapY: 180,
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
    description: 'A dedicated peaceful outdoor study sanctuary shaded by mature sacred fig (Peepal) trees along the quiet riverfront promenade. Features ergonomic timber workbenches, natural ambient airflow, and minimal urban noise.',
    whyRecommend: 'High quietness score (94%), dense leafy shade canopy, open now, within 6 min walk.',
    price: 'Free',
    bestTime: 'Early Morning (7:00 AM - 10:30 AM) & Sunset',
    quietScore: '94%',
    amenities: [
      'Shaded Reading Pods',
      'Solar Device Charging',
      'Free High-Speed Wi-Fi',
      'Water Refill Fountain',
      'Wheelchair Accessible Ramp',
      'Ambient Bird Chorus',
    ],
    highlights: [
      'Zero traffic disturbance zone',
      'Over 24 mature native tree species providing natural cooling',
      'Regular community eco-study circles on weekends',
    ],
  },
  {
    id: 'p-2',
    name: 'Banyan Tree Botanical Garden Café',
    category: 'Cafés',
    icon: '☕',
    distance: '900 m',
    walkTime: '12 min walk',
    rating: 4.8,
    reviewsCount: 94,
    isOpen: true,
    hours: '8:00 AM - 10:00 PM',
    address: 'Law Garden Road, Opposite Museum',
    city: 'Ahmedabad',
    region: 'Gujarat',
    habitat: 'Subtropical Heritage Garden & Shaded Courtyard',
    mapX: 480,
    mapY: 260,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    description: 'An eco-conscious garden cafe nestled beneath a sprawling 70-year-old Banyan tree. Serving single-origin organic brews, seasonal herbal infusions, and fresh farm-to-table light bites amidst lush tropical foliage.',
    whyRecommend: 'Organic herbal tea, outdoor seating under banyan shade, strong Wi-Fi.',
    price: '$$',
    bestTime: 'Morning (8:30 AM - 11:30 AM) or Evening (5:00 PM - 8:00 PM)',
    quietScore: '86%',
    amenities: [
      'Artisanal Organic Coffee & Herbal Teas',
      'Open-Air Banyan Canopy Seating',
      'Laptop-Friendly Tables with Power Outlets',
      'Pet Friendly Patio',
      'Botanical Herb Garden Tours',
    ],
    highlights: [
      '100% compostable packaging and zero single-use plastic',
      'Microclimate 3°C cooler than surrounding asphalt streets',
      'Herbal infusions brewed with freshly plucked garden mint & tulsi',
    ],
  },
  {
    id: 'p-3',
    name: 'Urban Wetlands & Bird Deck',
    category: 'Parks',
    icon: '🌳',
    distance: '1.4 km',
    walkTime: '18 min walk',
    rating: 4.9,
    reviewsCount: 165,
    isOpen: true,
    hours: '6:00 AM - 7:00 PM',
    address: 'Kankaria Lake North Eco-Corridor',
    city: 'Ahmedabad',
    region: 'Gujarat',
    habitat: 'Freshwater Wetland & Riparian Reeds Ecosystem',
    mapX: 210,
    mapY: 340,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    description: 'A restored urban wetland sanctuary designed for biodiversity conservation and peaceful walking meditation. Elevated wooden boardwalks wind through reed beds and lily ponds.',
    whyRecommend: 'Ideal for Kingfisher observation and evening micro-climate walks.',
    price: 'Free',
    bestTime: 'Dawn (6:00 AM - 8:00 AM) for bird watching',
    quietScore: '96%',
    amenities: [
      'Elevated Observation Deck',
      'Binocular Lending Station',
      'Interpretive Nature Signage',
      'Guided Sunrise Bird Walks',
      'Paved Jogging Loop',
    ],
    highlights: [
      'Home to over 45 migratory bird species in winter',
      'Natural reed-bed filtration improving local water quality',
      'Benches positioned at prime photographic viewpoints',
    ],
  },
  {
    id: 'p-4',
    name: 'Heritage Textiles & Art Pavilion',
    category: 'Culture',
    icon: '🎨',
    distance: '2.1 km',
    walkTime: '8 min drive',
    rating: 4.7,
    reviewsCount: 82,
    isOpen: false,
    hours: 'Opens tomorrow 10:00 AM (10:00 AM - 6:00 PM)',
    address: 'Old City Cultural Promenade',
    city: 'Ahmedabad',
    region: 'Gujarat',
    habitat: 'Historic Courtyard with Native Neem Trees',
    mapX: 520,
    mapY: 140,
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1200&q=80',
    description: 'A heritage preservation center celebrating artisanal block printing, indigenous natural dyes, and sustainable textile craft traditions in a restored open-air haveli courtyard.',
    whyRecommend: 'Traditional indigo dye exhibitions and historic architecture.',
    price: '$',
    bestTime: 'Afternoon (2:00 PM - 5:00 PM)',
    quietScore: '89%',
    amenities: [
      'Live Dyeing Demonstration Workshops',
      'Artisan Gift Archive',
      'Courtyard Fountain Seating',
      'Audio Guide in 3 Languages',
      'Air-Cooled Exhibition Halls',
    ],
    highlights: [
      'Features authentic wooden printing blocks dating back 150 years',
      'Demonstrations of plant-based natural dye extraction',
      'Restored brick and timber Indo-Saracenic architectural elements',
    ],
  },
];

export default function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load place and bookmark state
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchPlaceData() {
      try {
        // Check local storage seed / cached places
        let placesPool = SEED_NEARBY_PLACES;
        try {
          const savedLocal = localStorage.getItem('pulse_nearby_places_v1');
          if (savedLocal) {
            const parsed = JSON.parse(savedLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              placesPool = parsed;
            }
          }
        } catch {
          // fallback to SEED_NEARBY_PLACES
        }

        // Try to find matching item in local pool
        let matched = placesPool.find(
          (p) => String(p.id) === String(id) || String(p._id) === String(id)
        );

        // Also check if backend provides it
        try {
          const backendRes = await apiFetch(`/api/places/${id}`).catch(() => null);
          if (backendRes && backendRes.name) {
            matched = {
              ...matched,
              ...backendRes,
              id: backendRes.id || backendRes._id || id,
              image: backendRes.image || backendRes.image_url || matched?.image || SEED_NEARBY_PLACES[0].image,
            };
          }
        } catch {
          // Backend offline or error, continue with matched
        }

        // Check fallback seed if still not found
        if (!matched) {
          matched = SEED_NEARBY_PLACES.find(
            (p) => String(p.id) === String(id) || String(p._id) === String(id)
          );
        }

        if (isMounted) {
          if (matched) {
            setPlace(matched);
          } else {
            setError('Place not found');
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load this place right now.');
          setLoading(false);
        }
      }
    }

    fetchPlaceData();

    // Check bookmark state
    try {
      const savedIds = JSON.parse(localStorage.getItem('pulse_saved_places_v1') || '[]');
      if (Array.isArray(savedIds)) {
        setIsSaved(savedIds.includes(id));
      }
    } catch {
      setIsSaved(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Toggle Bookmark
  const toggleBookmark = () => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('pulse_saved_places_v1') || '[]');
      let updated;
      if (savedIds.includes(id)) {
        updated = savedIds.filter((p) => p !== id);
        setIsSaved(false);
      } else {
        updated = [...savedIds, id];
        setIsSaved(true);
      }
      localStorage.setItem('pulse_saved_places_v1', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update bookmarks:', e);
    }
  };

  // Share Place URL
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place?.name || 'NaturePulse Place',
        text: `Check out ${place?.name} on NaturePulse!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#040B06] text-slate-100 px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-[#13271C] rounded-xl" />
          <div className="h-72 w-full bg-[#13271C] rounded-3xl" />
          <div className="h-10 w-3/4 bg-[#13271C] rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-20 bg-[#13271C] rounded-2xl" />
            <div className="h-20 bg-[#13271C] rounded-2xl" />
            <div className="h-20 bg-[#13271C] rounded-2xl" />
            <div className="h-20 bg-[#13271C] rounded-2xl" />
          </div>
          <div className="h-36 bg-[#13271C] rounded-3xl" />
        </div>
      </div>
    );
  }

  // Not Found / Error State
  if (error || !place) {
    return (
      <div className="min-h-screen bg-[#040B06] text-slate-100 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center bg-[#0E2015] border border-[#20452F] rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#13271C] border border-[#4ADE80]/40 flex items-center justify-center mx-auto text-[#4ADE80]">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white">
            {error === 'Place not found' ? 'Place Not Found' : 'Unable to Load Place'}
          </h2>
          <p className="text-sm text-slate-300">
            {error === 'Place not found'
              ? 'The discovery spot you are looking for does not exist or has moved.'
              : 'We could not load this discovery spot. Please verify your connection or try again.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/app/places')}
              className="px-6 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all cursor-pointer"
            >
              ← Back to Places
            </button>
            {error !== 'Place not found' && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-full bg-[#13271C] text-slate-200 border border-[#20422E] font-semibold text-xs hover:bg-[#1A3827] transition-all cursor-pointer"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Related nearby spots excluding current
  const relatedSpots = SEED_NEARBY_PLACES.filter((p) => String(p.id) !== String(place.id)).slice(0, 2);

  return (
    <div className="min-h-screen bg-[#040B06] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-24">
      
      {/* ──────────────── TOP NAVIGATION BAR ──────────────── */}
      <div className="border-b border-[#20452F] bg-[#0E2015]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/app/places');
              }
            }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-[#4ADE80] group-hover:-translate-x-1 transition-transform" />
            <span>Back to Places</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              aria-label="Share this place"
              className="p-2.5 rounded-full bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-[#4ADE80] hover:border-[#4ADE80]/50 transition-all cursor-pointer relative"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -bottom-8 right-0 bg-[#4ADE80] text-[#07130B] font-bold text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={toggleBookmark}
              aria-label={isSaved ? 'Remove from bookmarks' : 'Bookmark this place'}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80] shadow-md shadow-[#4ADE80]/20'
                  : 'bg-[#13271C] text-slate-200 border-[#20422E] hover:border-[#4ADE80]/60'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Bookmarked ✓' : 'Bookmark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── MAIN CONTENT CONTAINER ──────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* HERO IMAGE & HEADLINE BANNER */}
        <div className="relative rounded-3xl overflow-hidden border border-[#20452F] shadow-2xl bg-[#0E2015]">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden">
            <img
              src={place.image || place.image_url}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040B06] via-[#040B06]/40 to-transparent" />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-[#07130B]/90 backdrop-blur-md text-xs font-bold text-[#4ADE80] border border-[#4ADE80]/40 flex items-center gap-1.5 shadow-lg">
                <span>{place.icon || '🌿'}</span>
                <span>{place.category || place.type || 'Nature'}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#07130B]/90 backdrop-blur-md text-xs font-bold text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-lg">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{place.rating || 4.8}</span>
                {place.reviewsCount && <span className="text-slate-400 text-[11px]">({place.reviewsCount})</span>}
              </span>
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${
                place.isOpen !== false
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50'
                  : 'bg-red-950/90 text-red-300 border-red-400/50'
              }`}>
                {place.isOpen !== false ? '🟢 Open Now' : '🔴 Closed'}
              </span>
            </div>

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {place.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#4ADE80]" />
                  <span>{place.address || place.city || 'Sabarmati Riverfront, Ahmedabad'}</span>
                </span>
                <span>·</span>
                <span className="text-[#4ADE80] font-semibold">{place.distance || '450 m'}</span>
                <span>·</span>
                <span>{place.walkTime || (place.walk_minutes ? `${place.walk_minutes} min walk` : '6 min walk')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ──────────────── QUICK STATS METRICS GRID ──────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#0E2015] border border-[#20452F] p-4 rounded-2xl space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#4ADE80]" />
              <span>Hours</span>
            </span>
            <p className="text-sm font-bold text-white line-clamp-1">{place.hours || '7:00 AM - 9:00 PM'}</p>
          </div>

          <div className="bg-[#0E2015] border border-[#20452F] p-4 rounded-2xl space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <VolumeX className="w-3 h-3 text-[#4ADE80]" />
              <span>Quiet Score</span>
            </span>
            <p className="text-sm font-bold text-[#4ADE80]">{place.quietScore || '94% Calm'}</p>
          </div>

          <div className="bg-[#0E2015] border border-[#20452F] p-4 rounded-2xl space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#4ADE80]" />
              <span>Best Time</span>
            </span>
            <p className="text-sm font-bold text-white line-clamp-1">{place.bestTime || place.best_time || 'Morning & Sunset'}</p>
          </div>

          <div className="bg-[#0E2015] border border-[#20452F] p-4 rounded-2xl space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#4ADE80]" />
              <span>Entry / Price</span>
            </span>
            <p className="text-sm font-bold text-white">{place.price || 'Free Admission'}</p>
          </div>
        </div>

        {/* ──────────────── WHY AI RECOMMENDS THIS ──────────────── */}
        <div className="bg-gradient-to-br from-[#11271A] to-[#0A1A10] border border-[#4ADE80]/40 rounded-3xl p-6 sm:p-7 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#4ADE80]/20 text-[#4ADE80]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#4ADE80]">
              Why NaturePulse Recommends This
            </h3>
          </div>
          <p className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed">
            "{place.whyRecommend || place.why_it_matters || 'A pristine local refuge featuring excellent tree cover, micro-climate cooling, and quiet sanctuary conditions.'}"
          </p>
        </div>

        {/* ──────────────── ABOUT & HABITAT DESCRIPTION ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
          <h2 className="font-display text-xl font-bold text-white">About & Atmosphere</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {place.description || 'A serene natural setting designed for mindful observation, peaceful relaxation, and deeper connection with local flora and birds.'}
          </p>

          {place.habitat && (
            <div className="pt-3 border-t border-[#20422E] flex items-start gap-2.5">
              <Trees className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Ecosystem & Habitat Type</p>
                <p className="text-xs text-slate-300 mt-0.5">{place.habitat}</p>
              </div>
            </div>
          )}
        </div>

        {/* ──────────────── AMENITIES & FEATURES ──────────────── */}
        {((place.amenities && place.amenities.length > 0) || (place.features && place.features.length > 0)) && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <h2 className="font-display text-xl font-bold text-white">Amenities & Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(place.amenities || place.features || []).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-[#13271C] border border-[#20422E]">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
                  <span className="text-xs font-medium text-slate-200">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────── HIGHLIGHTS ──────────────── */}
        {place.highlights && place.highlights.length > 0 && (
          <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <h2 className="font-display text-xl font-bold text-white">Key Highlights</h2>
            <ul className="space-y-2.5">
              {place.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ──────────────── DIRECTIONS & ACTION BUTTONS ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display text-lg font-bold text-white">Ready to visit {place.name}?</h3>
            <p className="text-xs text-slate-300">Located at {place.address || place.city || 'Ahmedabad'}</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || place.city || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs sm:text-sm hover:bg-[#3ECE77] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#4ADE80]/20"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>

            <button
              onClick={toggleBookmark}
              className={`p-3 rounded-full border transition-all cursor-pointer shrink-0 ${
                isSaved ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80]' : 'bg-[#13271C] text-slate-300 border-[#20422E] hover:border-[#4ADE80]'
              }`}
              aria-label="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* ──────────────── OTHER PLACES TO EXPLORE ──────────────── */}
        <div className="space-y-4 pt-4">
          <h3 className="font-display text-xl font-bold text-white">Other Spots Nearby</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedSpots.map((spot) => (
              <Link
                key={spot.id}
                to={`/app/places/${spot.id}`}
                className="flex gap-4 p-4 rounded-3xl bg-[#0E2015] border border-[#20452F] hover:border-[#4ADE80]/50 transition-all group cursor-pointer shadow-lg"
              >
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-sm font-bold text-white truncate group-hover:text-[#4ADE80] transition-colors">
                      {spot.name}
                    </h4>
                    <p className="text-[11px] text-slate-300 truncate mt-0.5">{spot.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#4ADE80] font-semibold pt-1">
                    <span>{spot.distance} · {spot.walkTime}</span>
                    <span className="text-amber-300">★ {spot.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
