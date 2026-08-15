import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Link, useLocation } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, Skeleton } from '../components/ui';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CATEGORIES = ['birds', 'trees', 'flowers', 'insects', 'fungi', 'moss', 'mammals', 'reptiles', 'other'];
const CAT_EMOJI = { birds: '🐦', trees: '🌳', flowers: '🌸', insects: '🦋', fungi: '🍄', moss: '🌿', mammals: '🦔', reptiles: '🦎', other: '🌱' };

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: { initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } } },
};

function SpeciesCard({ discovery, isNew }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isNew || prefersReducedMotion()) return;
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#1B3A2C', '#7A9B78', '#C5D4C0', '#3D5C4A'],
        disableForReducedMotion: true,
      });
    }, 400);
  }, [isNew]);

  return (
    <motion.div
      ref={cardRef}
      variants={stagger.item}
      whileHover={{ scale: prefersReducedMotion() ? 1 : 1.03, boxShadow: '0 24px 60px -24px rgba(20,38,28,0.28)' }}
      animate={isNew ? { scale: [0.8, 1.05, 1], boxShadow: ['0 0 0 0 rgba(61,92,74,0)', '0 0 0 12px rgba(61,92,74,0.25)', '0 0 0 0 rgba(61,92,74,0)'] } : {}}
      transition={isNew ? { duration: prefersReducedMotion() ? 0 : 0.7, ease: 'easeOut' } : {}}
      className="rounded-2xl bg-paper border border-ink/5 overflow-hidden cursor-pointer"
    >
      {discovery.image_url ? (
        <img src={discovery.image_url} alt={discovery.common_name} className="w-full h-32 object-cover" />
      ) : (
        <div className="w-full h-32 bg-cream flex items-center justify-center text-3xl">
          {CAT_EMOJI[discovery.category] || '🌱'}
        </div>
      )}
      <div className="p-3">
        <p className="text-xs text-forest/40 mb-1">{CAT_EMOJI[discovery.category]} {discovery.category}</p>
        <p className="font-display text-base leading-tight">{discovery.common_name}</p>
        {discovery.scientific_name && (
          <p className="italic text-[11px] text-forest/50 mt-0.5 truncate">{discovery.scientific_name}</p>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <Badge tone={discovery.confidence === 'high' ? 'sage' : 'warn'}>{discovery.confidence}</Badge>
          <span className="text-[10px] text-forest/40">{formatWhen(discovery.created_at)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function PlaceholderCard() {
  return (
    <div className="rounded-2xl bg-cream-deep/60 border border-ink/5 overflow-hidden opacity-50">
      <div className="w-full h-32 bg-cream-deep flex items-center justify-center text-2xl grayscale">🌫️</div>
      <div className="p-3">
        <p className="text-[10px] text-forest/30 mb-1">???</p>
        <p className="font-display text-base text-forest/30">Not yet discovered</p>
        <p className="text-[11px] text-forest/25 mt-1">Go explore to unlock</p>
      </div>
    </div>
  );
}

export default function BiodiversityPassport() {
  const { session } = useAuth();
  const token = session?.access_token;
  const location = useLocation();
  const newDiscovery = location.state?.newDiscovery;
  const [discoveries, setDiscoveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const d = await apiFetch('/api/discoveries', {}, token);
      setDiscoveries(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load passport');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = discoveries.filter((d) => d.category === cat);
    return acc;
  }, {});

  return (
    <motion.div
      className="max-w-6xl mx-auto px-5 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion() ? 0 : 0.3 }}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Biodiversity Passport</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-1">Your personal field collection.</h1>
      <p className="mt-2 text-sm text-forest/65 max-w-2xl">
        Every species you identify becomes part of your passport. Collect across categories — the world is the game.
      </p>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : discoveries.length === 0 ? (
        <Card className="mt-8">
          <Empty
            title="Passport is empty"
            body="Every journey starts with one observation. Go photograph something ordinary."
            action={<Link to="/app/lens" className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-5 py-2.5 text-sm font-medium hover:bg-ink transition-colors"><Camera size={14} /> Open Nature Lens</Link>}
          />
        </Card>
      ) : (
        <div className="mt-8 space-y-10">
          {CATEGORIES.map((cat) => {
            const items = byCategory[cat];
            if (items.length === 0) return null;
            const placeholders = Math.max(0, 3 - items.length);
            return (
              <div key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">{CAT_EMOJI[cat]}</span>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-forest/45 font-semibold">{cat}</p>
                  <Badge tone="sage">{items.length}</Badge>
                </div>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  variants={stagger.container}
                  initial="initial"
                  animate="animate"
                >
                  {items.map((d) => (
                    <SpeciesCard
                      key={d.id}
                      discovery={d}
                      isNew={newDiscovery?.common_name === d.common_name}
                    />
                  ))}
                  {Array.from({ length: placeholders }).map((_, i) => (
                    <PlaceholderCard key={`ph-${i}`} />
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
