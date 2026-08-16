import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, Star, Navigation, Compass, Share2, 
  Bookmark, Sparkles, CheckCircle2, ExternalLink, Shield, Info, 
  Calendar, Wifi, Trees, Coffee, VolumeX, Heart, Layers, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

export default function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const token = session?.access_token;
  
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [bookmarkError, setBookmarkError] = useState(null);

  // Load place and bookmark state
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchPlaceData() {
      try {
        const backendRes = await apiFetch(`/api/places/${id}`).catch(() => null);
        if (isMounted) {
          if (backendRes && backendRes.name) {
            setPlace({
              ...backendRes,
              id: backendRes.id || backendRes._id || id,
              image: backendRes.image || backendRes.image_url || '',
            });
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

    // Check bookmark state from the user profile (server-side)
    if (token) {
      apiFetch('/api/profile', {}, token)
        .then((p) => {
          if (!isMounted) return;
          const ids = Array.isArray(p?.saved_places) ? p.saved_places : [];
          setSavedIds(ids);
          setIsSaved(ids.includes(id));
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  // Toggle Bookmark (persisted to the profile via the API)
  const toggleBookmark = () => {
    setBookmarkError(null);
    const nextSaved = !isSaved;
    const nextIds = nextSaved
      ? [...new Set([...savedIds, id])]
      : savedIds.filter((p) => p !== id);
    setIsSaved(nextSaved);
    if (!token) {
      setBookmarkError('Sign in to save places. Your bookmark could not be stored.');
      return;
    }
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ saved_places: nextIds }) }, token).catch(() => {
      setIsSaved(!nextSaved);
      setBookmarkError('Your bookmark could not be saved. Please check your connection and try again.');
    });
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

        {bookmarkError && (
          <div className="bg-red-950/80 border border-red-500/40 text-red-200 text-xs sm:text-sm rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <span>{bookmarkError}</span>
            <button onClick={() => setBookmarkError(null)} className="text-red-300 hover:text-white cursor-pointer shrink-0">✕</button>
          </div>
        )}

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

        {/* ──────────────── INTERACTIVE GOOGLE MAP LOCATION ──────────────── */}
        <div className="bg-[#0E2015] border border-[#20452F] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#4ADE80]" />
              <h2 className="font-display text-xl font-bold text-white">Interactive Location Map</h2>
            </div>
            <span className="text-[11px] text-[#4ADE80] font-bold bg-[#13271C] px-3 py-1 rounded-full border border-[#20422E]">
              Google Maps Live
            </span>
          </div>

          <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#20422E] shadow-inner bg-[#13271C]">
            <iframe
              title={`Google Map for ${place.name}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(place.name + ', ' + (place.address || place.city || 'Ahmedabad'))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 pt-1">
            <span>📍 {place.address || place.city || 'Sabarmati Riverfront, Ahmedabad'}</span>
            <span className="text-[#4ADE80] font-semibold">{place.distance} away</span>
          </div>
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

      </div>
    </div>
  );
}
