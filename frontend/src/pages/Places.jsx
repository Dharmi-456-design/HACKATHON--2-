import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Badge, Card, Skeleton, ErrorBanner } from '../components/ui';

const FILTERS = ['all', 'forest', 'wetland', 'river', 'garden', 'butte', 'neighborhood'];

export default function Places() {
  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/places${filter !== 'all' ? `?type=${filter}` : ''}`)
      .then((d) => {
        setPlaces(d);
        setActive(d[0] || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Location intelligence</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">Nearby nature, named at habitat scale.</h1>
      <p className="mt-2 text-sm text-forest/65 max-w-2xl">
        These are public green spaces and urban habitats. Pins are schematic — never your home, never a live GPS trail.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs capitalize border transition-colors ${
              filter === f ? 'bg-forest text-cream border-forest font-medium' : 'border-ink/10 text-forest hover:bg-mist/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <div className="mt-4"><ErrorBanner message={error} /></div>}

      {loading ? (
        <div className="mt-6 grid lg:grid-cols-5 gap-5">
          <Skeleton className="h-[420px] lg:col-span-3" />
          <Skeleton className="h-[420px] lg:col-span-2" />
        </div>
      ) : (
        <div className="mt-6 grid lg:grid-cols-5 gap-5">
          <Card className="lg:col-span-3 overflow-hidden">
            <div className="relative h-[420px] bg-[#d7e0d2] dark:bg-[#1f3327]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="water" x1="0" x2="1">
                    <stop offset="0%" stopColor="#9BB8B0" />
                    <stop offset="100%" stopColor="#6E8F86" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" fill="currentColor" className="text-[#dce6d4] dark:text-[#182a20]" />
                <path d="M0 62 C 18 50, 28 78, 48 70 S 78 88, 100 64 L 100 100 L 0 100 Z" fill="currentColor" className="text-[#c5d4b8] dark:text-[#1f3629]" />
                <path d="M0 38 C 22 44, 30 22, 52 30 S 80 18, 100 34 L 100 0 L 0 0 Z" fill="currentColor" className="text-[#cfe0c8] dark:text-[#253f31]" />
                <path d="M18 0 C 22 30, 20 55, 28 100" fill="none" stroke="url(#water)" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="62" cy="48" r="16" fill="currentColor" className="text-[#b7c9a8] dark:text-[#2b4837]" opacity="0.8" />
                <text x="6" y="8" fontSize="3.2" fill="currentColor" className="text-[#1B3A2C] dark:text-[#97CDAB]" opacity="0.6">Schematic · Pacific Northwest urban habitats</text>
                {places.map((p) => (
                  <g key={p.id} className="cursor-pointer" onClick={() => setActive(p)}>
                    <circle cx={p.map_x} cy={p.map_y} r={active?.id === p.id ? 3.2 : 2.1} fill={active?.id === p.id ? '#C4A35A' : '#1B3A2C'} />
                    <text x={p.map_x + 2.4} y={p.map_y + 1} fontSize="2.4" fill="currentColor" className="text-[#14261C] dark:text-[#EAF2EC]">{p.name}</text>
                  </g>
                ))}
              </svg>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-3 max-h-[420px] overflow-auto pr-1">
            {places.map((p) => (
              <button key={p.id} onClick={() => setActive(p)} className="w-full text-left">
                <Card className={`p-4 transition-shadow ${active?.id === p.id ? 'ring-2 ring-gold/60' : ''}`}>
                  <div className="flex gap-3">
                    <img src={p.image_url} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-forest/50 capitalize">{p.type} · {p.city}</p>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {active && (
        <Card className="mt-6 overflow-hidden grid md:grid-cols-2">
          <img src={active.image_url} alt="" className="h-64 md:h-full w-full object-cover" />
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              <Badge>{active.type}</Badge>
              <Badge tone="ink">{active.difficulty}</Badge>
              <Badge tone="gold">{active.best_time}</Badge>
            </div>
            <h2 className="font-display text-3xl mt-3">{active.name}</h2>
            <p className="text-xs text-forest/50 mt-1 flex items-center gap-1">
              <MapPin size={12} /> {active.city}, {active.region} · <Clock size={12} /> ~{active.walk_minutes} min from a typical neighborhood edge
            </p>
            <p className="mt-4 text-sm text-forest/75 leading-relaxed">{active.description}</p>
            <p className="mt-3 text-sm italic text-ink/80">{active.why_it_matters}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-forest/40">Habitat · {active.habitat}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(active.features || []).map((f) => (
                <span key={f} className="text-xs bg-cream rounded-full px-3 py-1 border border-ink/5">{f}</span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
