import { useState, useEffect, useRef } from 'react';
import {
  Globe, Search, ZoomIn, ZoomOut, X, MapPin, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch } from '../lib/api';

const T = {
  en: {
    tag: 'COMMUNITY BIODIVERSITY NETWORK',
    title: 'Live Biodiversity Map',
    subtitle: 'Community-reported nature sightings pinned to real locations across your city.',
    search: 'Search species, locations…',
    all: 'All',
    constellation: '✨ Constellation',
    liveMap: '🗺️ Live Map',
    close: 'Close',
    loading: 'Loading…',
  },
  gu: {
    tag: 'કમ્યુનિટી બાયોડાઇવર્સિટી',
    title: 'લાઈવ બાયોડાઇવર્સિટી નકશો',
    subtitle: 'તમારા શહેરમાં સમુદાયના અવલોકનો.',
    search: 'પ્રજાતિઓ, સ્થળો…',
    all: 'બધા',
    constellation: '✨ નક્ષત્ર',
    liveMap: '🗺️ નકશો',
    close: 'બંધ',
    loading: 'લોડ…',
  },
  hi: {
    tag: 'कम्युनिटी बायोडायवर्सिटी',
    title: 'लाइव बायोडायवर्सिटी मैप',
    subtitle: 'आपके शहर के समुदाय के अवलोकन।',
    search: 'प्रजातियां, स्थान…',
    all: 'सभी',
    constellation: '✨ नक्षत्र',
    liveMap: '🗺️ मैप',
    close: 'बंद',
    loading: 'लोड…',
  },
};

const catEmoji = { birds: '🐦', trees: '🌳', flowers: '🌸', insects: '🦋', fungi: '🍄', moss: '🌿', plant: '🌱', water: '💧', other: '🌱' };

function categoryKey(cat) {
  const c = String(cat || '').toLowerCase();
  if (c.includes('bird')) return 'birds';
  if (c.includes('tree')) return 'trees';
  if (c.includes('flower') || c.includes('plant')) return 'flowers';
  if (c.includes('insect') || c.includes('butterfly')) return 'insects';
  if (c.includes('fung')) return 'fungi';
  if (c.includes('moss') || c.includes('lichen')) return 'moss';
  return 'other';
}

const CITY_COORDS = {
  'sabarmati': { lat: 23.0395, lng: 72.5876 },
  'law garden': { lat: 23.0247, lng: 72.5618 },
  'parimal': { lat: 23.0295, lng: 72.559 },
  'prahladnagar': { lat: 23.017, lng: 72.5062 },
  'riverfront': { lat: 23.0571, lng: 72.5842 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'bodakdev': { lat: 23.0443, lng: 72.5152 },
  'navrangpura': { lat: 23.0358, lng: 72.5578 },
  'maninagar': { lat: 22.9945, lng: 72.5997 },
  'vastrapur': { lat: 23.0388, lng: 72.5277 },
};

function cityToLatLng(city, index) {
  const cl = (city || '').toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (cl.includes(key)) {
      return {
        lat: coords.lat + Math.sin(index * 1.7) * 0.012,
        lng: coords.lng + Math.cos(index * 2.3) * 0.015,
      };
    }
  }
  return {
    lat: 23.0225 + Math.sin(index * 1.7) * 0.02,
    lng: 72.5714 + Math.cos(index * 2.3) * 0.025,
  };
}

const DEFAULT_PINS = [
  { id: 'p1', name: 'Indian Myna', category: 'birds', city: 'Sabarmati Park', lat: 23.0395, lng: 72.5876, confidence: '98% Verified', note: 'Dawn roosting near Peepal tree.' },
  { id: 'p2', name: 'Peepal Shade Canopy', category: 'trees', city: 'Law Garden', lat: 23.0247, lng: 72.5618, confidence: '95%', note: '40-year old canopy providing shade.' },
  { id: 'p3', name: 'Champa Night Bloom', category: 'flowers', city: 'Parimal Garden', lat: 23.0295, lng: 72.559, confidence: '99%', note: 'Fragrant white petals opening at dusk.' },
  { id: 'p4', name: 'Swallowtail Butterfly', category: 'insects', city: 'Prahladnagar', lat: 23.017, lng: 72.5062, confidence: '92%', note: 'Visiting wild milkweed nectar patch.' },
  { id: 'p5', name: 'Banyan Root Moss', category: 'moss', city: 'Sabarmati Riverfront', lat: 23.0571, lng: 72.5842, confidence: '96%', note: 'Velvet moss carpet along damp soil.' },
  { id: 'p6', name: 'Mycelium Colony', category: 'fungi', city: 'Vastrapur Lake', lat: 23.0388, lng: 72.5277, confidence: '94%', note: 'Sub-surface fungal web in root soil.' },
];

function ConstellationMap({ pins, selectedPin, onSelect, isDark, zoomLevel }) {
  const cx = 350, cy = 240;
  const svgW = 700, svgH = 480;
  const nodes = pins.map((p, i) => {
    const angle = (i / Math.max(pins.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const baseR = Math.min(120 + i * 18, 195);
    return { ...p, nx: cx + Math.cos(angle) * baseR, ny: cy + Math.sin(angle) * baseR, emoji: catEmoji[p.category] || '🌱' };
  });
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 480 }}>
      <div className="absolute inset-0 transition-transform duration-300 origin-center" style={{ transform: `scale(${zoomLevel})` }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0 w-full h-full pointer-events-none">
          {[1, 2, 3].map((r) => (
            <circle key={r} cx={cx} cy={cy} r={r * 70} fill="none" stroke={isDark ? '#4ADE8018' : '#18382818'} strokeWidth="1" strokeDasharray="4 6" />
          ))}
          {nodes.map((n) => (
            <line key={n.id} x1={cx} y1={cy} x2={n.nx} y2={n.ny}
              stroke={selectedPin?.id === n.id ? (isDark ? '#4ADE80' : '#183B28') : (isDark ? '#20422E' : '#D4CBB8')}
              strokeWidth={selectedPin?.id === n.id ? 2 : 1}
              strokeDasharray={selectedPin?.id === n.id ? '' : '4 4'}
              opacity={0.7}
            />
          ))}
        </svg>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-xl z-20 cursor-pointer border-2 ${isDark ? 'bg-gradient-to-br from-[#2E6141] to-[#040B06] border-[#4ADE80]' : 'bg-gradient-to-br from-[#183B28] to-[#0F2418] border-[#4ADE80]/40'}`}
          style={{ left: cx, top: cy, transform: 'translate(-50%,-50%)' }}
          onClick={() => onSelect(null)}
        >
          <Globe className={`w-5 h-5 ${isDark ? 'text-[#4ADE80]' : 'text-emerald-200'}`} />
          <span className="text-[9px] font-bold text-white uppercase tracking-wider">HUB</span>
        </motion.div>
        {nodes.map((n) => {
          const isSel = selectedPin?.id === n.id;
          return (
            <motion.button key={n.id} whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(n)}
              className={`absolute rounded-2xl border flex items-center gap-1.5 px-2.5 py-1.5 shadow-lg z-20 cursor-pointer transition-all text-xs font-bold ${isSel ? (isDark ? 'bg-[#1A3827] border-[#4ADE80] text-white' : 'bg-[#183B28] border-[#4ADE80] text-white') : (isDark ? 'bg-[#13271C]/90 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/60' : 'bg-white border-[#E3DDD1] text-[#0F2418] hover:border-[#183B28]')}`}
              style={{ left: n.nx, top: n.ny, transform: 'translate(-50%,-50%)' }}
            >
              <span className="text-sm">{n.emoji}</span>
              <span className="whitespace-nowrap max-w-[100px] truncate">{n.name}</span>
            </motion.button>
          );
        })}
        {pins.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`border border-dashed rounded-2xl px-6 py-4 text-xs max-w-xs text-center ${isDark ? 'bg-[#0E2015]/90 border-[#4ADE80]/30 text-slate-300' : 'bg-[#F2ECE1] border-[#D4CBB8] text-[#3E5C48]'}`}>
              No observations yet. Log sightings in Nature Lens to add pins here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleMapsView({ pins, selectedPin, apiKey }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  function initMap() {
    if (!mapRef.current || !window.google) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 23.0225, lng: 72.5714 },
      zoom: 12,
      mapTypeId: 'terrain',
      styles: [
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c8e6c9' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#90caf9' }] },
        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#dcedc8' }] },
      ],
      mapTypeControl: false,
      streetViewControl: false,
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();
    placeMarkers(map, pins);
  }

  function placeMarkers(map, pinsToPlace) {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    pinsToPlace.forEach((pin) => {
      if (!pin.lat || !pin.lng) return;
      const marker = new window.google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        map,
        title: pin.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: '#183B28',
          fillOpacity: 0.92,
          strokeColor: '#4ADE80',
          strokeWeight: 2.5,
        },
      });
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(`<div style="font-family:sans-serif;max-width:200px;padding:4px"><div style="font-weight:700;font-size:14px;color:#183B28">${catEmoji[pin.category] || '🌱'} ${pin.name}</div><div style="font-size:11px;color:#3E5C48;margin-top:2px">📍 ${pin.city}</div><div style="font-size:11px;color:#555;margin-top:4px">${pin.note || ''}</div><div style="font-size:10px;color:#22c55e;font-weight:600;margin-top:4px">✅ ${pin.confidence}</div></div>`);
        infoWindowRef.current.open(map, marker);
      });
      markersRef.current.push(marker);
    });
  }

  useEffect(() => {
    if (!apiKey) { setMapError(true); return; }
    if (window.__gmapsLoaded) { setTimeout(initMap, 100); return; }
    const existing = document.getElementById('gmap-script');
    if (existing) { existing.addEventListener('load', () => { window.__gmapsLoaded = true; initMap(); }); return; }
    const script = document.createElement('script');
    script.id = 'gmap-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => { window.__gmapsLoaded = true; initMap(); };
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => { if (mapInstanceRef.current && window.google) placeMarkers(mapInstanceRef.current, pins); }, [pins]);

  useEffect(() => {
    if (selectedPin && mapInstanceRef.current && window.google && selectedPin.lat) {
      mapInstanceRef.current.panTo({ lat: selectedPin.lat, lng: selectedPin.lng });
      mapInstanceRef.current.setZoom(15);
    }
  }, [selectedPin]);

  if (mapError || !apiKey) {
    const q = selectedPin ? `${selectedPin.name}, ${selectedPin.city}, Ahmedabad` : 'nature parks, Ahmedabad, Gujarat, India';
    return (
      <div className="w-full h-[480px] rounded-2xl overflow-hidden">
        <iframe title="Biodiversity Map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=k&z=13&output=embed`} />
      </div>
    );
  }
  return <div ref={mapRef} className="w-full rounded-2xl overflow-hidden shadow-inner" style={{ height: 480 }} />;
}

export default function CommunityBiodiversityMap() {
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = T[lang] || T.en;
  const { isDark } = useTheme();
  const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const [pins, setPins] = useState(DEFAULT_PINS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPin, setSelectedPin] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState('constellation');

  const CATS = [
    { key: 'All', label: t.all },
    { key: 'birds', label: '🐦 Birds' },
    { key: 'trees', label: '🌳 Trees' },
    { key: 'flowers', label: '🌸 Flowers' },
    { key: 'insects', label: '🦋 Insects' },
    { key: 'fungi', label: '🍄 Fungi' },
    { key: 'moss', label: '🌿 Moss' },
  ];

  useEffect(() => {
    apiFetch('/api/community', {}, null)
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((p, i) => {
            const cat = categoryKey(p.category || p.common_name);
            const coords = cityToLatLng(p.city || '', i);
            return { id: p._id || `pin-${i}`, name: p.common_name || 'Community Observation', category: cat, city: p.city || 'Ahmedabad', confidence: p.confidence_pct ? `${p.confidence_pct}% Verified` : 'Community Verified', note: p.note || p.description || '', lat: coords.lat, lng: coords.lng };
          });
          setPins(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('pulse_user_lens_discoveries') || '[]');
      if (local.length > 0) {
        const localPins = local.filter((d) => d.is_public !== false).map((d, i) => {
          const cat = categoryKey(d.category);
          const coords = cityToLatLng(d.place_name || d.city || '', i + 100);
          return { id: d.id || d._id || `loc-${i}`, name: d.common_name || 'My Observation', category: cat, city: d.place_name || d.city || 'Local', confidence: d.confidence_pct ? `${d.confidence_pct}%` : 'Logged', note: d.description || d.notes || '', lat: coords.lat, lng: coords.lng };
        });
        setPins((prev) => { const ids = new Set(prev.map((p) => p.id)); return [...prev, ...localPins.filter((p) => !ids.has(p.id))]; });
      }
    } catch {}
    setLoading(false);
  }, []);

  const filteredPins = pins.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q) || (p.note || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 ${isDark ? 'bg-[#040B06] text-slate-100' : 'bg-[#FAF7F0] text-[#0F2418]'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">

        {/* Header */}
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b ${isDark ? 'border-[#4ADE80]/20' : 'border-[#E3DDD1]'}`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isDark ? 'bg-[#4ADE80]' : 'bg-[#183B28]'}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>{t.tag}</span>
            </div>
            <h1 className={`font-display text-4xl sm:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.title}</h1>
            <p className={`text-sm leading-relaxed max-w-lg ${isDark ? 'text-slate-300' : 'text-[#3E5C48]'}`}>{t.subtitle}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${isDark ? 'bg-[#1A3827]/80 border-[#4ADE80]/40 text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28]'}`}>
            <MapPin className="w-3.5 h-3.5" />
            {filteredPins.length} Observations
          </span>
        </div>

        {/* Search + Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search}
                className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none border transition-colors ${isDark ? 'bg-[#12241A] border-[#234A33] text-white placeholder:text-slate-500 focus:border-[#4ADE80]' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] placeholder:text-[#6B8C7A] focus:border-[#183B28]'}`}
              />
            </div>
            <div className="flex items-center gap-2">
              {viewMode === 'constellation' && (
                <>
                  <button onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.5))} className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28]'}`}><ZoomIn className="w-4 h-4" /></button>
                  <button onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))} className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28]'}`}><ZoomOut className="w-4 h-4" /></button>
                </>
              )}
              <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark ? 'bg-[#07150C] border-[#20422E]' : 'bg-[#EDE6D8] border-[#D4CBB8]'}`}>
                <button onClick={() => setViewMode('constellation')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${viewMode === 'constellation' ? (isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-white') : (isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48]')}`}>{t.constellation}</button>
                <button onClick={() => setViewMode('map')} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${viewMode === 'map' ? (isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-white') : (isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48]')}`}>{t.liveMap}</button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATS.map(({ key, label }) => (
              <button key={key} onClick={() => setSelectedCategory(key)}
                className={`px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === key ? (isDark ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]' : 'bg-[#183B28] border-[#183B28] text-white') : (isDark ? 'bg-[#0E2015]/60 border-[#20422E] text-slate-400 hover:text-white' : 'bg-white border-[#E3DDD1] text-[#3E5C48] hover:bg-[#F2ECE1]')}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Panel */}
        <div className={`rounded-3xl shadow-2xl border overflow-hidden ${isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1]'}`}>
          <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'}`}>
            <div className="flex items-center gap-2">
              <Globe className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{viewMode === 'map' ? 'Live Google Map — Ahmedabad Biodiversity' : 'Species Constellation Network'}</span>
            </div>
            {loading && <span className={`text-[10px] animate-pulse ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.loading}</span>}
          </div>
          <div className="p-3 sm:p-4">
            {viewMode === 'map' ? (
              <GoogleMapsView pins={filteredPins} selectedPin={selectedPin} apiKey={MAPS_API_KEY} />
            ) : (
              <ConstellationMap pins={filteredPins} selectedPin={selectedPin} onSelect={setSelectedPin} isDark={isDark} zoomLevel={zoomLevel} />
            )}
          </div>
        </div>

        {/* Selected Pin Detail Card */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              className={`rounded-3xl p-5 sm:p-6 shadow-2xl border space-y-3 ${isDark ? 'bg-[#112318] border-[#4ADE80]/40 text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'}`}>
              <div className={`flex justify-between items-start border-b pb-3 ${isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{catEmoji[selectedPin.category] || '🌱'}</span>
                  <div>
                    <h3 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{selectedPin.name}</h3>
                    <p className={`text-xs font-semibold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>📍 {selectedPin.city} &nbsp;·&nbsp; ✅ {selectedPin.confidence}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {viewMode === 'constellation' && (
                    <button onClick={() => setViewMode('map')} title="View on Live Map" className={`p-2 rounded-full border cursor-pointer transition-colors ${isDark ? 'border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#1A3827]' : 'border-[#183B28]/40 text-[#183B28] hover:bg-emerald-50'}`}><Eye className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => setSelectedPin(null)} className={`cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-[#0F2418]'}`}><X className="w-5 h-5" /></button>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-[#2D4836]'}`}>
                "{selectedPin.note || 'Community nature observation. Tap on Map view to see exact location.'}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Count Strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {['birds', 'trees', 'flowers', 'insects', 'fungi', 'moss'].map((cat) => {
            const count = pins.filter((p) => p.category === cat).length;
            return (
              <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                className={`rounded-2xl p-3 border text-center transition-all cursor-pointer ${selectedCategory === cat ? (isDark ? 'bg-[#1A3827] border-[#4ADE80]' : 'bg-[#E1EFE0] border-[#183B28]') : (isDark ? 'bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/40' : 'bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28]/40')}`}>
                <div className="text-xl">{catEmoji[cat]}</div>
                <div className={`text-xs font-bold mt-1 ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{count}</div>
                <div className={`text-[9px] uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cat}</div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
