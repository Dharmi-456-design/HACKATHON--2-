import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, MapPin, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, GhostButton, PrimaryButton, Skeleton } from '../components/ui';

const TYPE_LABEL = { observe: 'Observe', explore: 'Explore', learn: 'Learn', act: 'Act', return: 'Return' };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// SVG checkmark draw-on animation
function AnimatedCheck() {
  return (
    <motion.svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <motion.circle
        cx="24" cy="24" r="20"
        stroke="#1B3A2C" strokeWidth="2.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: prefersReducedMotion() ? 0 : 0.5, ease: 'easeOut' }}
      />
      <motion.path
        d="M14 24 L21 31 L34 17"
        stroke="#1B3A2C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: prefersReducedMotion() ? 0 : 0.4, delay: 0.3, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

function MissionCard({ mission, onComplete, busy }) {
  const [completed, setCompleted] = useState(mission.status === 'completed');
  const progress = completed ? 100 : 0;

  const handleComplete = async () => {
    await onComplete(mission.id);
    setCompleted(true);
  };

  return (
    <motion.div
      className="snap-center shrink-0 w-72"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion() ? 0 : 0.3, ease: 'easeOut' }}
    >
      <Card className="p-5 h-full flex flex-col">
        {/* Category icon */}
        <motion.div
          className="w-10 h-10 rounded-2xl bg-cream flex items-center justify-center mb-3 text-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          {mission.mission_type === 'observe' ? '👁️' :
            mission.mission_type === 'explore' ? '🗺️' :
            mission.mission_type === 'learn' ? '📚' :
            mission.mission_type === 'act' ? '🌱' : '🔄'}
        </motion.div>

        <Badge tone="ink" className="self-start mb-2">
          {TYPE_LABEL[mission.mission_type] || mission.mission_type}
        </Badge>
        <h3 className="font-display text-xl leading-snug flex-1">{mission.title}</h3>
        <p className="text-sm text-forest/65 mt-2 leading-relaxed line-clamp-3">{mission.description}</p>

        {mission.location_hint && (
          <p className="mt-3 text-xs text-forest/50 flex items-center gap-1">
            <MapPin size={11} /> {mission.location_hint}
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-cream-deep rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sage to-forest rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: prefersReducedMotion() ? 0 : 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-forest/40 flex items-center gap-1">
            <Clock size={11} /> {mission.duration_minutes} min
          </p>
          <Badge tone={completed ? 'sage' : 'ink'}>{completed ? 'done' : mission.status}</Badge>
        </div>

        <div className="mt-4">
          {completed ? (
            <div className="flex justify-center">
              <AnimatedCheck />
            </div>
          ) : (
            <PrimaryButton
              onClick={handleComplete}
              disabled={busy}
              className="w-full justify-center text-sm"
            >
              <Check size={14} /> Start Mission
            </PrimaryButton>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default function NatureMissions() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const data = await apiFetch('/api/missions', {}, token);
      setMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load missions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setBusy(true);
    try {
      const data = await apiFetch('/api/missions', { method: 'POST', body: JSON.stringify({ generate: true, force: true }) }, token);
      setMissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pulse could not write missions');
    } finally { setBusy(false); }
  };

  const complete = async (id) => {
    try {
      await apiFetch('/api/missions', { method: 'PUT', body: JSON.stringify({ id, status: 'completed' }) }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete');
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto px-5 py-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion() ? 0 : 0.3 }}
    >
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Nature Missions</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">Personalized for your place and time.</h1>
          <p className="mt-2 text-sm text-forest/65 max-w-xl">
            Each mission is generated from your location, the time of day, and your interests. Complete them to grow your Nature Connection Score.
          </p>
        </div>
        <GhostButton onClick={generate} disabled={busy}>
          <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
          {busy ? 'Listening…' : 'New missions'}
        </GhostButton>
      </div>

      {error && <div className="mb-5"><ErrorBanner message={error} /></div>}

      {loading ? (
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="w-72 h-80 shrink-0" />)}
        </div>
      ) : missions.length === 0 ? (
        <Card>
          <Empty
            title="No missions yet"
            body="Pulse will write personalized missions based on your city, time of day, and interests."
            action={<PrimaryButton onClick={generate} disabled={busy}><RefreshCw size={14} /> Generate missions</PrimaryButton>}
          />
        </Card>
      ) : (
        <>
          {/* Carousel */}
          <div className="overflow-x-auto pb-4 snap-x snap-mandatory flex gap-5 scrollbar-hide">
            {missions.map((m) => (
              <MissionCard key={m.id} mission={m} onComplete={complete} busy={busy} />
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {missions.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${i === activeIndex ? 'bg-forest w-4' : 'bg-forest/20'}`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
