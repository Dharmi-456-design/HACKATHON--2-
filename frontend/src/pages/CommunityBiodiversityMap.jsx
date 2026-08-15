import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

const CAT_EMOJI = { birds: '🐦', trees: '🌳', flowers: '🌸', insects: '🦋', fungi: '🍄', moss: '🌿', mammals: '🦔', reptiles: '🦎', other: '🌱' };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Simple custom marker rendered as emoji pin
function DiscoveryPin({ discovery }) {
  const emoji = CAT_EMOJI[discovery.category] || '🌿';
  return (
    <div className="flex flex-col items-center cursor-pointer group">
      <div className="text-2xl drop-shadow-md group-hover:scale-125 transition-transform duration-200">{emoji}</div>
      <div className="mt-1 bg-paper rounded-lg px-2 py-1 shadow-soft border border-ink/5 text-xs font-medium text-forest hidden group-hover:block whitespace-nowrap">
        {discovery.common_name}
      </div>
    </div>
  );
}

// Since we can't use react-leaflet (not installed), we use a Schematic SVG map like Places.jsx
// Shows discovery pins as positioned emoji markers on a schematic background

export default function CommunityBiodiversityMap() {
  const [discoveries, setDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePin, setActivePin] = useState(null);

  useEffect(() => {
    apiFetch('/api/community')
      .then((d) => setDiscoveries(Array.isArray(d) ? d : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Distribute pins pseudo-randomly across the SVG canvas (0-100 viewBox)
  const pinPositions = discoveries.map((d, i) => ({
    ...d,
    x: ((i * 37 + 15) % 80) + 10,
    y: ((i * 53 + 20) % 70) + 10,
  }));

  const legend = Object.entries(CAT_EMOJI).slice(0, 6);

  return (
    <motion.div
      className="max-w-6xl mx-auto px-5 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion() ? 0 : 0.3 }}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Community Map</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">Nature spotted by your community.</h1>
      <p className="mt-2 text-sm text-forest/65 max-w-2xl">
        Anonymous observations from all NaturePulse users. No user info, no precise GPS — only city-level nature finds.
      </p>

      {error && <div className="mt-5"><ErrorBanner message={error} /></div>}

      {loading ? (
        <Skeleton className="mt-8 h-[500px]" />
      ) : (
        <div className="mt-8 grid lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-4 overflow-hidden">
            <div className="relative bg-[#d7e0d2]" style={{ height: 480 }}>
              {/* Schematic map background (same style as Places.jsx) */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="bio-water" x1="0" x2="1">
                    <stop offset="0%" stopColor="#9BB8B0" />
                    <stop offset="100%" stopColor="#6E8F86" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="#dce6d4" />
                <path d="M0 62 C 18 50, 28 78, 48 70 S 78 88, 100 64 L 100 100 L 0 100 Z" fill="#c5d4b8" />
                <path d="M0 38 C 22 44, 30 22, 52 30 S 80 18, 100 34 L 100 0 L 0 0 Z" fill="#cfe0c8" />
                <path d="M18 0 C 22 30, 20 55, 28 100" fill="none" stroke="url(#bio-water)" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="62" cy="48" r="16" fill="#b7c9a8" opacity="0.8" />
                <text x="3" y="8" fontSize="3" fill="#1B3A2C" opacity="0.5">Community Biodiversity Map · Anonymous observations only</text>

                {/* Discovery pins */}
                {pinPositions.map((pin, i) => (
                  <g key={i} className="cursor-pointer" onClick={() => setActivePin(activePin?.id === pin.id ? null : pin)}>
                    <circle
                      cx={pin.x} cy={pin.y} r={activePin?.id === pin.id ? 3.5 : 2.5}
                      fill={activePin?.id === pin.id ? '#C4A35A' : '#1B3A2C'}
                      opacity={0.85}
                    />
                    <text x={pin.x} y={pin.y - 3.5} fontSize="4" textAnchor="middle">
                      {CAT_EMOJI[pin.category] || '🌿'}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Popup */}
              {activePin && (
                <motion.div
                  className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-72"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{CAT_EMOJI[activePin.category] || '🌿'}</span>
                      <div className="min-w-0">
                        <p className="font-display text-lg leading-tight">{activePin.common_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge tone="sage">{activePin.category}</Badge>
                          <span className="text-xs text-forest/45">{activePin.city || 'Unknown city'}</span>
                        </div>
                        <p className="text-xs text-forest/40 mt-1">{formatWhen(activePin.created_at)}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Empty state overlay */}
              {discoveries.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Card className="p-6 text-center max-w-xs">
                    <p className="font-display text-xl">No community discoveries yet</p>
                    <p className="text-sm text-forest/60 mt-2">Make a discovery in Nature Lens and share it to the community to see it here.</p>
                  </Card>
                </div>
              )}
            </div>
          </Card>

          {/* Legend + Stats */}
          <div className="space-y-4">
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-forest/45 mb-3">Species categories</p>
              <div className="space-y-2">
                {legend.map(([cat, emoji]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="text-sm capitalize text-forest/70">{cat}</span>
                    <span className="ml-auto text-xs text-forest/40">
                      {discoveries.filter((d) => d.category === cat).length}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-forest/45 mb-2">Total observations</p>
              <p className="font-display text-3xl">{discoveries.length}</p>
              <p className="text-xs text-forest/50 mt-1">Anonymous · privacy-safe</p>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  );
}
