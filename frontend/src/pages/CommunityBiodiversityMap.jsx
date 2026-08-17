import { useState, useEffect, useRef } from "react";
import {
  Globe, Search, ZoomIn, ZoomOut, X, MapPin, Eye, Share2, CheckCircle,
  Filter, Layers, Navigation, Feather, Trees, Flower2, Bug, Sprout, Leaf, Sparkles, Map as MapIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../lib/api";

// ── Leaflet CSS (loaded once dynamically) ────────────────────────────────────
if (!document.getElementById("leaflet-css")) {
  const link = document.createElement("link");
  link.id = "leaflet-css";
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(link);
}

const CAT_ICONS = {
  birds: Feather,
  trees: Trees,
  flowers: Flower2,
  insects: Bug,
  fungi: Sprout,
  moss: Leaf,
  plant: Sprout,
  other: Leaf,
};

const CAT_EMOJI = {
  birds: "🐦", trees: "🌳", flowers: "🌸", insects: "🦋",
  fungi: "🍄", moss: "🌿", plant: "🌱", other: "🌱",
};
const CATS = ["All","birds","trees","flowers","insects","fungi","moss"];
const CAT_LABELS = {
  All: { label: "All", icon: Globe },
  birds: { label: "Birds", icon: Feather },
  trees: { label: "Trees", icon: Trees },
  flowers: { label: "Flowers", icon: Flower2 },
  insects: { label: "Insects", icon: Bug },
  fungi: { label: "Fungi", icon: Sprout },
  moss: { label: "Moss", icon: Leaf },
};

function catKey(cat) {
  const c = String(cat || "").toLowerCase();
  if (c.includes("bird")) return "birds";
  if (c.includes("tree")) return "trees";
  if (c.includes("flower") || c.includes("plant")) return "flowers";
  if (c.includes("insect") || c.includes("butterfly")) return "insects";
  if (c.includes("fung")) return "fungi";
  if (c.includes("moss") || c.includes("lichen")) return "moss";
  return "other";
}

// Ahmedabad city→coords lookup
const CITY_COORDS = {
  "sabarmati": [23.0395, 72.5876], "law garden": [23.0247, 72.5618],
  "parimal": [23.0295, 72.559], "prahladnagar": [23.017, 72.5062],
  "riverfront": [23.0571, 72.5842], "vastrapur": [23.0388, 72.5277],
  "bodakdev": [23.0443, 72.5152], "navrangpura": [23.0358, 72.5578],
  "maninagar": [22.9945, 72.5997], "science city": [23.0485, 72.5295],
  "gandhinagar": [23.2156, 72.6369], "surat": [21.1702, 72.8311],
  "ahmedabad": [23.0225, 72.5714],
};

function cityToLatLng(city, idx) {
  const cl = (city || "").toLowerCase();
  for (const [k, c] of Object.entries(CITY_COORDS)) {
    if (cl.includes(k)) {
      return [c[0] + Math.sin(idx * 1.7) * 0.006, c[1] + Math.cos(idx * 2.3) * 0.008];
    }
  }
  return [23.0225 + Math.sin(idx * 1.7) * 0.018, 72.5714 + Math.cos(idx * 2.3) * 0.022];
}

const DEFAULT_PINS = [
  { id:"p1", name:"Indian Myna", category:"birds", city:"Sabarmati Park", lat:23.0395, lng:72.5876, confidence:"98% Verified", note:"Dawn roosting near Peepal tree.", image_url:"" },
  { id:"p2", name:"Peepal Shade Canopy", category:"trees", city:"Law Garden", lat:23.0247, lng:72.5618, confidence:"95%", note:"40-year old canopy providing shade.", image_url:"" },
  { id:"p3", name:"Champa Night Bloom", category:"flowers", city:"Parimal Garden", lat:23.0295, lng:72.559, confidence:"99%", note:"Fragrant white petals opening at dusk.", image_url:"" },
  { id:"p4", name:"Swallowtail Butterfly", category:"insects", city:"Prahladnagar", lat:23.017, lng:72.5062, confidence:"92%", note:"Visiting wild milkweed nectar patch.", image_url:"" },
  { id:"p5", name:"Banyan Root Moss", category:"moss", city:"Sabarmati Riverfront", lat:23.0571, lng:72.5842, confidence:"96%", note:"Velvet moss carpet along damp soil.", image_url:"" },
  { id:"p6", name:"Mycelium Colony", category:"fungi", city:"Vastrapur Lake", lat:23.0388, lng:72.5277, confidence:"94%", note:"Sub-surface fungal web in root soil.", image_url:"" },
];

// ── Leaflet Map component ────────────────────────────────────────────────────
function LeafletMap({ pins, selectedPin, onSelect, isDark, userLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const L = useRef(null);

  useEffect(() => {
    import("leaflet").then((leafletModule) => {
      L.current = leafletModule.default || leafletModule;
      if (mapInstance.current) return;
      if (!mapRef.current) return;

      const map = L.current.map(mapRef.current, {
        center: [23.0225, 72.5714],
        zoom: 12,
        zoomControl: true,
      });

      // Use OpenStreetMap tiles (free, no API key)
      L.current.tileLayer(
        isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: isDark
            ? '&copy; <a href="https://carto.com">CartoDB</a>'
            : '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstance.current = map;
      addMarkers(map, pins);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markersRef.current = {};
        userMarkerRef.current = null;
      }
    };
  }, []); // init once

  function addMarkers(map, pinsToAdd) {
    if (!L.current || !map) return;
    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    pinsToAdd.forEach((pin) => {
      if (!pin.lat || !pin.lng) return;
      const emoji = CAT_EMOJI[pin.category] || "🌱";
      const icon = L.current.divIcon({
        className: "",
        html: `<div style="
          background:${isDark ? "#183B28" : "#fff"};
          border:2px solid ${isDark ? "#4ADE80" : "#183B28"};
          border-radius:50%;
          width:38px;height:38px;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          cursor:pointer;
          transition:transform 0.15s;
        ">${emoji}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22],
      });

      const marker = L.current.marker([pin.lat, pin.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:4px">
            <div style="font-weight:700;font-size:14px;color:#183B28">${emoji} ${pin.name}</div>
            <div style="font-size:11px;color:#3E5C48;margin:3px 0">📍 ${pin.city || "Unknown"}</div>
            ${pin.image_url ? `<img src="${pin.image_url}" style="width:100%;border-radius:6px;margin:6px 0;max-height:120px;object-fit:cover" />` : ""}
            <div style="font-size:11px;color:#555;line-height:1.5">${pin.note || ""}</div>
            <div style="font-size:10px;color:#22c55e;font-weight:700;margin-top:6px">✅ ${pin.confidence || "Verified"}</div>
          </div>
        `);

      marker.on("click", () => onSelect(pin));
      markersRef.current[pin.id] = marker;
    });
  }

  // Re-render markers when pins change
  useEffect(() => {
    if (mapInstance.current && L.current) {
      addMarkers(mapInstance.current, pins);
    }
  }, [pins]);

  // Pan to selected pin
  useEffect(() => {
    if (selectedPin && mapInstance.current) {
      mapInstance.current.flyTo([selectedPin.lat, selectedPin.lng], 15, { duration: 1 });
      const marker = markersRef.current[selectedPin.id];
      if (marker) marker.openPopup();
    }
  }, [selectedPin]);

  // Handle userLocation
  useEffect(() => {
    if (userLocation && mapInstance.current && L.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const icon = L.current.divIcon({
          className: "",
          html: `<div style="
            background:${isDark ? "#4ADE80" : "#22c55e"};
            border:2px solid #fff;
            border-radius:50%;
            width:16px;height:16px;
            box-shadow:0 0 10px rgba(0,0,0,0.5);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        userMarkerRef.current = L.current.marker([userLocation.lat, userLocation.lng], { icon })
          .addTo(mapInstance.current)
          .bindPopup("<div style='font-family:sans-serif;font-size:12px;font-weight:bold;color:#183B28;padding:2px'>You are here</div>");
      }
      mapInstance.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1 });
    }
  }, [userLocation, isDark]);

  return (
    <div
      ref={mapRef}
      style={{ height: 480, width: "100%", borderRadius: "16px", overflow: "hidden" }}
      className="z-0"
    />
  );
}

// ── Constellation Map ─────────────────────────────────────────────────────────
function ConstellationMap({ pins, selectedPin, onSelect, isDark, zoomLevel }) {
  const cx = 350, cy = 240;
  const nodes = pins.map((p, i) => {
    const angle = (i / Math.max(pins.length, 1)) * 2 * Math.PI - Math.PI / 2;
    const r = Math.min(100 + i * 20, 190);
    return { ...p, nx: cx + Math.cos(angle) * r, ny: cy + Math.sin(angle) * r, emoji: CAT_EMOJI[p.category] || "🌱" };
  });

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 480 }}>
      <div className="absolute inset-0 transition-transform duration-300 origin-center" style={{ transform: `scale(${zoomLevel})` }}>
        <svg viewBox="0 0 700 480" className="absolute inset-0 w-full h-full pointer-events-none">
          {[1,2,3].map(r => (
            <circle key={r} cx={cx} cy={cy} r={r*65} fill="none"
              stroke={isDark ? "#4ADE8015" : "#18382810"} strokeWidth="1" strokeDasharray="4 6" />
          ))}
          {nodes.map(n => (
            <line key={n.id} x1={cx} y1={cy} x2={n.nx} y2={n.ny}
              stroke={selectedPin?.id===n.id ? (isDark?"#4ADE80":"#183B28") : (isDark?"#20422E":"#D4CBB8")}
              strokeWidth={selectedPin?.id===n.id ? 2 : 1}
              strokeDasharray={selectedPin?.id===n.id ? "" : "4 4"}
              opacity={0.7}
            />
          ))}
        </svg>

        {/* Hub */}
        <motion.div
          animate={{ scale:[1,1.08,1] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
          className={`absolute w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-xl z-20 cursor-pointer border-2 ${
            isDark ? "bg-gradient-to-br from-[#2E6141] to-[#040B06] border-[#4ADE80]"
                   : "bg-gradient-to-br from-[#183B28] to-[#0F2418] border-[#4ADE80]/40"
          }`}
          style={{ left:cx, top:cy, transform:"translate(-50%,-50%)" }}
          onClick={() => onSelect(null)}
        >
          <Globe className={`w-5 h-5 ${isDark?"text-[#4ADE80]":"text-emerald-200"}`} />
          <span className="text-[8px] font-bold text-white uppercase tracking-wider">HUB</span>
        </motion.div>

        {/* Nodes */}
        {nodes.map(n => {
          const isSel = selectedPin?.id===n.id;
          return (
            <motion.button key={n.id} whileHover={{ scale:1.15 }} whileTap={{ scale:0.95 }}
              onClick={() => onSelect(n)}
              className={`absolute rounded-2xl border flex items-center gap-1.5 px-2.5 py-1.5 shadow-lg z-20 cursor-pointer transition-all text-xs font-bold ${
                isSel
                  ? isDark ? "bg-[#1A3827] border-[#4ADE80] text-white" : "bg-[#183B28] border-[#4ADE80] text-white"
                  : isDark ? "bg-[#13271C]/90 border-[#20422E] text-slate-200 hover:border-[#4ADE80]/60"
                           : "bg-white border-[#E3DDD1] text-[#0F2418] hover:border-[#183B28]"
              }`}
              style={{ left:n.nx, top:n.ny, transform:"translate(-50%,-50%)" }}
            >
              <span className="text-sm">{n.emoji}</span>
              <span className="whitespace-nowrap max-w-[90px] truncate">{n.name}</span>
            </motion.button>
          );
        })}

        {pins.length===0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`border border-dashed rounded-2xl px-6 py-4 text-xs max-w-xs text-center ${
              isDark?"bg-[#0E2015]/90 border-[#4ADE80]/30 text-slate-300":"bg-[#F2ECE1] border-[#D4CBB8] text-[#3E5C48]"
            }`}>
              No observations yet — log sightings in Nature Lens to add pins here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CommunityBiodiversityMap() {
  const { isDark } = useTheme();
  const { session } = useAuth();
  const token = session?.access_token;

  const [pins, setPins] = useState(DEFAULT_PINS);
  const [loading, setLoading] = useState(true);
  const [selCat, setSelCat] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [viewMode, setViewMode] = useState("map"); // "map" | "constellation"
  const [zoomLevel, setZoomLevel] = useState(1);
  const [shareStatus, setShareStatus] = useState({}); // id→"sharing"|"done"
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Load community posts from backend
  useEffect(() => {
    apiFetch("/api/community", {}, null)
      .then(list => {
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((p, i) => {
            const lat = p.lat || cityToLatLng(p.city, i)[0];
            const lng = p.lng || cityToLatLng(p.city, i)[1];
            return {
              id: p._id || `api-${i}`,
              name: p.common_name || "Community Observation",
              category: catKey(p.category),
              city: p.city || "Ahmedabad",
              confidence: p.confidence_pct ? `${p.confidence_pct}% Verified` : (p.confidence || "Community Verified"),
              note: p.note || p.description || "",
              image_url: p.image_url || "",
              lat, lng,
            };
          });
          setPins(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Merge user's local lens discoveries
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem("pulse_user_lens_discoveries") || "[]");
      if (local.length > 0) {
        const localPins = local.map((d, i) => {
          const [lat, lng] = cityToLatLng(d.place_name || d.city || "", i + 200);
          return {
            id: d.id || d._id || `local-${i}`,
            name: d.common_name || "My Observation",
            category: catKey(d.category),
            city: d.place_name || d.city || "Local",
            confidence: d.confidence_pct ? `${d.confidence_pct}%` : "My Sighting",
            note: d.description || d.notes || "",
            image_url: d.image_url || "",
            lat: d.lat || lat,
            lng: d.lng || lng,
            _localDiscovery: d, // for sharing
          };
        });
        setPins(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...localPins.filter(p => !ids.has(p.id))];
        });
      }
    } catch {}
    setLoading(false);
  }, []);

  const filtered = pins.filter(p => {
    if (selCat !== "All" && p.category !== selCat) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.city||"").toLowerCase().includes(q) || (p.note||"").toLowerCase().includes(q);
    }
    return true;
  });

  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setViewMode("map"); // force map view if found
        setLocating(false);
      },
      () => {
        alert("Unable to retrieve your location");
        setLocating(false);
      }
    );
  };

  // Share local discovery to community backend
  const shareToMap = async (pin) => {
    if (!token) return;
    setShareStatus(s => ({ ...s, [pin.id]: "sharing" }));
    try {
      const d = pin._localDiscovery || {};
      await apiFetch("/api/community", {
        method: "POST",
        body: JSON.stringify({
          common_name: pin.name,
          scientific_name: d.scientific_name || "",
          category: pin.category,
          note: pin.note,
          image_url: pin.image_url,
          confidence: pin.confidence,
          confidence_pct: d.confidence_pct || 0,
          city: pin.city,
          lat: pin.lat,
          lng: pin.lng,
        }),
      }, token);
      setShareStatus(s => ({ ...s, [pin.id]: "done" }));
    } catch {
      setShareStatus(s => ({ ...s, [pin.id]: "error" }));
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-24 ${
      isDark ? "bg-[#040B06] text-slate-100" : "bg-[#FAF7F0] text-[#0F2418]"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 relative z-10">

        {/* ── Header ── */}
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? "border-[#4ADE80]/20" : "border-[#E3DDD1]"
        }`}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isDark?"bg-[#4ADE80]":"bg-[#183B28]"}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${isDark?"text-[#4ADE80]":"text-[#183B28]"}`}>
                COMMUNITY BIODIVERSITY NETWORK
              </span>
            </div>
            <h1 className={`font-display text-4xl sm:text-5xl font-black tracking-tight ${isDark?"text-white":"text-[#0F2418]"}`}>
              Live Biodiversity Map
            </h1>
            <p className={`text-sm leading-relaxed max-w-lg ${isDark?"text-slate-300":"text-[#3E5C48]"}`}>
              Community-reported nature sightings pinned to real locations across your city.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              isDark?"bg-[#1A3827]/80 border-[#4ADE80]/40 text-[#4ADE80]":"bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28]"
            }`}>
              <MapPin className="w-3.5 h-3.5" />
              {filtered.length} Observations
            </span>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isDark?"text-slate-400":"text-[#3E5C48]"}`} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search species, locations…"
                className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none border transition-colors ${
                  isDark?"bg-[#12241A] border-[#234A33] text-white placeholder:text-slate-500 focus:border-[#4ADE80]"
                       :"bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] placeholder:text-[#6B8C7A] focus:border-[#183B28]"
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              {viewMode==="constellation" && (
                <>
                  <button onClick={() => setZoomLevel(z => Math.min(z+0.15, 1.5))}
                    className={`p-2.5 rounded-xl border cursor-pointer ${isDark?"bg-[#13271C] border-[#20422E] text-slate-300":"bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28]"}`}>
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => setZoomLevel(z => Math.max(z-0.15, 0.6))}
                    className={`p-2.5 rounded-xl border cursor-pointer ${isDark?"bg-[#13271C] border-[#20422E] text-slate-300":"bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28]"}`}>
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </>
              )}
              {viewMode==="map" && (
                <button onClick={locateUser} disabled={locating}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    locating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } ${isDark ? "bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white" : "bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28] hover:bg-[#E3DDD1]"}`}>
                  <Navigation className={`w-4 h-4 ${locating ? "animate-pulse" : ""}`} />
                  <span className="hidden sm:inline">{locating ? "Locating…" : "Locate Me"}</span>
                </button>
              )}
              <div className={`flex items-center gap-1 p-1 rounded-xl border ${isDark?"bg-[#07150C] border-[#20422E]":"bg-[#EDE6D8] border-[#D4CBB8]"}`}>
                <button onClick={() => setViewMode("map")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode==="map" ? (isDark?"bg-[#4ADE80] text-[#07130B]":"bg-[#183B28] text-white") : (isDark?"text-slate-400 hover:text-white":"text-[#3E5C48]")
                  }`}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Live Map</span>
                </button>
                <button onClick={() => setViewMode("constellation")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode==="constellation" ? (isDark?"bg-[#4ADE80] text-[#07130B]":"bg-[#183B28] text-white") : (isDark?"text-slate-400 hover:text-white":"text-[#3E5C48]")
                  }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Constellation</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATS.map(key => {
              const item = CAT_LABELS[key];
              const Icon = item.icon;
              return (
                <button key={key} onClick={() => setSelCat(key)}
                  className={`px-3.5 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                    selCat===key
                      ? isDark?"bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]":"bg-[#183B28] border-[#183B28] text-white"
                      : isDark?"bg-[#0E2015]/60 border-[#20422E] text-slate-400 hover:text-white":"bg-white border-[#E3DDD1] text-[#3E5C48] hover:bg-[#F2ECE1]"
                  }`}>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Map Panel ── */}
        <div className={`rounded-3xl shadow-2xl border overflow-hidden ${isDark?"bg-[#0E2015] border-[#20452F]":"bg-[#FDFBF7] border-[#E3DDD1]"}`}>
          <div className={`flex items-center justify-between px-5 py-3 border-b ${isDark?"border-[#20422E]":"border-[#E3DDD1]"}`}>
            <div className="flex items-center gap-2">
              {viewMode==="map" ? <MapPin className={`w-4 h-4 ${isDark?"text-[#4ADE80]":"text-[#183B28]"}`} /> : <Globe className={`w-4 h-4 ${isDark?"text-[#4ADE80]":"text-[#183B28]"}`} />}
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark?"text-white":"text-[#0F2418]"}`}>
                {viewMode==="map" ? "OpenStreetMap — Live Biodiversity Observations" : "Species Constellation Network"}
              </span>
            </div>
            {loading && <span className={`text-[10px] animate-pulse ${isDark?"text-slate-400":"text-slate-500"}`}>Loading…</span>}
          </div>
          <div className={`p-3 sm:p-4 ${viewMode==="map" ? "" : ""}`}>
            {viewMode==="map" ? (
              <LeafletMap
                key="leaflet-map"
                pins={filtered}
                selectedPin={selectedPin}
                onSelect={setSelectedPin}
                isDark={isDark}
                userLocation={userLocation}
              />
            ) : (
              <ConstellationMap
                pins={filtered}
                selectedPin={selectedPin}
                onSelect={setSelectedPin}
                isDark={isDark}
                zoomLevel={zoomLevel}
              />
            )}
          </div>
        </div>

        {/* ── Selected Pin Detail ── */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:12 }}
              className={`rounded-3xl border shadow-2xl space-y-3 overflow-hidden ${
                isDark?"bg-[#112318] border-[#4ADE80]/40":"bg-[#FDFBF7] border-[#E3DDD1]"
              }`}
            >
              {selectedPin.image_url && (
                <img src={selectedPin.image_url} alt={selectedPin.name}
                  className="w-full max-h-48 object-cover" />
              )}
              <div className="p-5 sm:p-6 space-y-3">
                <div className={`flex justify-between items-start border-b pb-3 ${isDark?"border-[#20452F]":"border-[#E3DDD1]"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{CAT_EMOJI[selectedPin.category]||"🌱"}</span>
                    <div>
                      <h3 className={`font-display text-xl font-bold ${isDark?"text-white":"text-[#0F2418]"}`}>{selectedPin.name}</h3>
                      <p className={`text-xs font-semibold ${isDark?"text-[#4ADE80]":"text-[#183B28]"}`}>
                        📍 {selectedPin.city} &nbsp;·&nbsp; ✅ {selectedPin.confidence}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {viewMode==="constellation" && (
                      <button onClick={() => setViewMode("map")} title="View on Live Map"
                        className={`p-2 rounded-full border cursor-pointer transition-colors ${isDark?"border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#1A3827]":"border-[#183B28]/40 text-[#183B28] hover:bg-emerald-50"}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {selectedPin._localDiscovery && token && (
                      <button
                        onClick={() => shareToMap(selectedPin)}
                        disabled={shareStatus[selectedPin.id]==="sharing"||shareStatus[selectedPin.id]==="done"}
                        title="Share to Community Map"
                        className={`p-2 rounded-full border cursor-pointer transition-colors ${
                          shareStatus[selectedPin.id]==="done"
                            ? isDark?"border-[#4ADE80] text-[#4ADE80]":"border-green-500 text-green-600"
                            : isDark?"border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#1A3827]":"border-[#183B28]/40 text-[#183B28] hover:bg-emerald-50"
                        }`}>
                        {shareStatus[selectedPin.id]==="done"
                          ? <CheckCircle className="w-4 h-4" />
                          : <Share2 className="w-4 h-4" />
                        }
                      </button>
                    )}
                    <button onClick={() => setSelectedPin(null)}
                      className={`cursor-pointer ${isDark?"text-slate-400 hover:text-white":"text-slate-400 hover:text-[#0F2418]"}`}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${isDark?"text-slate-200":"text-[#2D4836]"}`}>
                  "{selectedPin.note || "Community nature observation. Click the map view to see location."}"
                </p>
                {selectedPin._localDiscovery && !shareStatus[selectedPin.id] && token && (
                  <p className={`text-[11px] ${isDark?"text-slate-400":"text-slate-500"}`}>
                    💡 This is your private sighting — tap <Share2 className="w-3 h-3 inline" /> to share it with the community map.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Category Strip ── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {["birds","trees","flowers","insects","fungi","moss"].map(cat => {
            const count = pins.filter(p => p.category===cat).length;
            const Icon = CAT_ICONS[cat] || Leaf;
            return (
              <button key={cat} onClick={() => setSelCat(selCat===cat ? "All" : cat)}
                className={`rounded-2xl p-3 border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  selCat===cat
                    ? isDark?"bg-[#1A3827] border-[#4ADE80]":"bg-[#E1EFE0] border-[#183B28]"
                    : isDark?"bg-[#0E2015] border-[#20422E] hover:border-[#4ADE80]/40":"bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28]/40"
                }`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center mb-1.5 ${
                  isDark ? 'bg-[#07150C] border-[#20422E] text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className={`text-xs font-bold ${isDark?"text-white":"text-[#0F2418]"}`}>{count}</div>
                <div className={`text-[9px] uppercase tracking-wide ${isDark?"text-slate-400":"text-slate-500"}`}>{cat}</div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
